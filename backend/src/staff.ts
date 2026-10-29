import { z } from "zod";
import { config } from "./config.ts";
import { prisma } from "./db.ts";
import { Prisma } from "./generated/prisma/client.ts";
import { deckResponse, insertApplication, issues } from "./applications.ts";
import { deleteObject } from "./storage.ts";
import { assignPayment, dismissPayment, listPayments } from "./admin.ts";
import { json } from "./http.ts";
import { reconcilePending } from "./reconcile.ts";
import { normalizeReference } from "./reference.ts";

/**
 * Role-based access for the admin panel. Calls arrive from our Next.js server with a verified `x-user-email`.
 *   super_admin  everything, plus assigning roles
 *   admin        full stats, referral codes (CRUD), applications/submissions (CRUD)
 *   core         create referral codes; sees ONLY the number of registrations per track
 */
export const ROLES = ["super_admin", "admin", "core"] as const;
export type Role = (typeof ROLES)[number];

const PERMISSIONS = {
  statsFull: ["super_admin", "admin"],
  statsTrackCounts: ["super_admin", "admin", "core"],
  referralsCreate: ["super_admin", "admin", "core"],
  referralsManage: ["super_admin", "admin"], // list with usage numbers, edit, delete
  applications: ["super_admin", "admin"],
  roles: ["super_admin"],
} as const satisfies Record<string, readonly Role[]>;
type Permission = keyof typeof PERMISSIONS;

export async function roleOf(email: string): Promise<Role | null> {
  if (config.superAdminEmails.includes(email)) return "super_admin";
  const u = await prisma.staffUser.findUnique({ where: { email } });
  return u && (ROLES as readonly string[]).includes(u.role) ? (u.role as Role) : null;
}
const allowed = (role: Role, p: Permission) => (PERMISSIONS[p] as readonly Role[]).includes(role);
const forbidden = () => json({ error: "forbidden" }, 403);

const body = async (req: Request) => await req.json().catch(() => null);

export async function handleStaff(req: Request, url: URL, email: string): Promise<Response> {
  const role = await roleOf(email);
  if (!role) return json({ error: "not_staff" }, 403);
  const path = url.pathname.replace(/^\/api\/staff/, "");
  const m = req.method;
  const need = (p: Permission) => (allowed(role, p) ? null : forbidden());
  let seg: RegExpMatchArray | null;

  if (m === "GET" && path === "/me") {
    return json({ email, role, permissions: Object.keys(PERMISSIONS).filter((p) => allowed(role, p as Permission)) });
  }
  if (m === "GET" && path === "/stats") return stats(role);

  if (path === "/referrals") {
    if (m === "GET") return listReferrals(role, email);
    if (m === "POST") return need("referralsCreate") ?? createReferral(await body(req), email);
  }
  if ((seg = path.match(/^\/referrals\/([A-Za-z0-9-]+)$/))) {
    const denied = need("referralsManage");
    if (denied) return denied;
    if (m === "PATCH") return updateReferral(seg[1].toUpperCase(), await body(req));
    if (m === "DELETE") return deleteReferral(seg[1].toUpperCase());
  }

  if (path === "/payments" || path.startsWith("/payments/")) {
    const denied = need("applications");
    if (denied) return denied;
    if (m === "GET" && path === "/payments") return listPayments(url);
    if (m === "POST" && path === "/payments/reconcile") return json({ matched: await reconcilePending() });
    if (m === "POST" && (seg = path.match(/^\/payments\/([0-9a-f-]{36})\/(assign|dismiss)$/))) {
      return seg[2] === "assign" ? assignPayment(seg[1], req) : dismissPayment(seg[1], req);
    }
  }

  if (path === "/applications") {
    const denied = need("applications");
    if (denied) return denied;
    if (m === "GET") return listApplications(url);
    if (m === "POST") {
      const b = (await body(req)) as { ownerEmail?: string } | null;
      const owner = String(b?.ownerEmail ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner)) return json({ error: "validation", errors: { ownerEmail: "Enter a valid email" } }, 422);
      return insertApplication({ declaration: "on", ...b }, owner);
    }
  }
  if (m === "PATCH" && (seg = path.match(/^\/applications\/([^/]+)\/members$/))) {
    const denied = need("applications");
    if (denied) return denied;
    const reference = normalizeReference(decodeURIComponent(seg[1]));
    if (!reference) return json({ error: "invalid_reference" }, 400);
    return updateMembers(reference, await body(req), email);
  }
  if ((seg = path.match(/^\/applications\/([^/]+)(\/deck)?$/))) {
    const denied = need("applications");
    if (denied) return denied;
    const reference = normalizeReference(decodeURIComponent(seg[1]));
    if (!reference) return json({ error: "invalid_reference" }, 400);
    if (m === "GET" && seg[2]) return downloadDeck(reference);
    if (m === "GET") return getApplication(reference);
    if (m === "PATCH") return updateApplication(reference, await body(req));
    if (m === "DELETE") return deleteApplication(reference);
  }

  if (path === "/users" || path.startsWith("/users/")) {
    const denied = need("roles");
    if (denied) return denied;
    if (m === "GET" && path === "/users") return listUsers();
    if (m === "PUT" && path === "/users") return setRole(await body(req), email);
    if (m === "DELETE" && (seg = path.match(/^\/users\/(.+)$/))) return removeUser(decodeURIComponent(seg[1]).toLowerCase(), email);
  }
  return json({ error: "not_found" }, 404);
}

// ---------- stats ----------

async function stats(role: Role): Promise<Response> {
  const byTrack = await prisma.application.groupBy({ by: ["track"], _count: { _all: true } });
  const perTrack = { junior: 0, main: 0, ...Object.fromEntries(byTrack.map((r) => [r.track, r._count._all])) };
  // Core team: nothing but the registration count per track.
  if (!allowed(role, "statsFull")) return json({ perTrack });

  const [byStatus, byCode, unmatched] = await Promise.all([
    prisma.application.groupBy({ by: ["track", "status"], _count: { _all: true } }),
    prisma.application.groupBy({ by: ["referralCode"], where: { referralCode: { not: null } }, _count: { _all: true } }),
    prisma.payment.count({ where: { matchStatus: { not: "matched" }, reviewedAt: null } }),
  ]);
  const paidByCode = await prisma.application.groupBy({ by: ["referralCode"], where: { referralCode: { not: null }, status: "paid" }, _count: { _all: true } });
  const paid = new Map(paidByCode.map((r) => [r.referralCode, r._count._all]));
  const linkedByCode = await prisma.accountReferral.groupBy({ by: ["code"], _count: { _all: true } });
  const reg = new Map(byCode.map((r) => [r.referralCode as string, r._count._all]));
  const codesSeen = [...new Set([...reg.keys(), ...linkedByCode.map((r) => r.code)])];
  return json({
    perTrack,
    byStatus: byStatus.map((r) => ({ track: r.track, status: r.status, count: r._count._all })),
    total: byTrack.reduce((n, r) => n + r._count._all, 0),
    // Every code with any reach: people who opened the link and signed in ("accounts") and teams that registered with it.
    referrals: codesSeen.map((code) => ({ code, accounts: linkedByCode.find((r) => r.code === code)?._count._all ?? 0, registrations: reg.get(code) ?? 0, paid: paid.get(code) ?? 0 })),
    paymentsNeedingReview: unmatched,
  });
}

// ---------- referral codes ----------

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const makeCode = () => "GIC-" + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");

const createReferralSchema = z.object({
  label: z.string().trim().max(100).default(""),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{4,30}$/, "4–30 letters, numbers or -").optional().or(z.literal("")),
});

async function createReferral(raw: unknown, email: string): Promise<Response> {
  const parsed = createReferralSchema.safeParse(raw ?? {});
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const custom = parsed.data.code || null;
  for (let i = 0; i < 5; i++) {
    const code = custom ?? makeCode();
    try {
      const row = await prisma.referralCode.create({ data: { code, label: parsed.data.label, createdBy: email } });
      return json({ code: row.code, label: row.label, active: row.active, createdAt: row.createdAt }, 201);
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") throw e;
      if (custom) return json({ error: "validation", errors: { code: "That code already exists" } }, 422);
    }
  }
  return json({ error: "code_collision" }, 500);
}

async function listReferrals(role: Role, email: string): Promise<Response> {
  if (!allowed(role, "referralsManage")) {
    // Core team: only the codes they issued themselves, with no usage numbers.
    const own = await prisma.referralCode.findMany({ where: { createdBy: email }, orderBy: { createdAt: "desc" } });
    return json({ codes: own.map((c) => ({ code: c.code, label: c.label, active: c.active, createdAt: c.createdAt })) });
  }
  const [codes, used, paid, linked] = await Promise.all([
    prisma.referralCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.application.groupBy({ by: ["referralCode"], where: { referralCode: { not: null } }, _count: { _all: true } }),
    prisma.application.groupBy({ by: ["referralCode"], where: { referralCode: { not: null }, status: "paid" }, _count: { _all: true } }),
    prisma.accountReferral.groupBy({ by: ["code"], _count: { _all: true } }),
  ]);
  const l = new Map(linked.map((r) => [r.code, r._count._all]));
  const u = new Map(used.map((r) => [r.referralCode, r._count._all]));
  const p = new Map(paid.map((r) => [r.referralCode, r._count._all]));
  return json({ codes: codes.map((c) => ({ ...c, accounts: l.get(c.code) ?? 0, registrations: u.get(c.code) ?? 0, paid: p.get(c.code) ?? 0 })) });
}

async function updateReferral(code: string, raw: unknown): Promise<Response> {
  const parsed = z.object({ label: z.string().trim().max(100).optional(), active: z.boolean().optional() }).safeParse(raw ?? {});
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const r = await prisma.referralCode.updateMany({ where: { code }, data: parsed.data });
  return r.count ? json({ ok: true }) : json({ error: "not_found" }, 404);
}

async function deleteReferral(code: string): Promise<Response> {
  const r = await prisma.referralCode.deleteMany({ where: { code } }); // applications keep the code text they were registered with
  return r.count ? json({ ok: true }) : json({ error: "not_found" }, 404);
}

// ---------- applications / submissions ----------

async function listApplications(url: URL): Promise<Response> {
  const q = url.searchParams.get("q")?.trim();
  const track = url.searchParams.get("track");
  const status = url.searchParams.get("status");
  const code = url.searchParams.get("referral")?.trim().toUpperCase();
  const deck = url.searchParams.get("deck");           // yes | no
  const video = url.searchParams.get("video");         // any | none | link | file
  const submitted = url.searchParams.get("submitted"); // yes | no
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);

  const hasLink: Prisma.ApplicationWhereInput = { AND: [{ pitchVideoLink: { not: null } }, { pitchVideoLink: { not: "" } }] };
  const noLink: Prisma.ApplicationWhereInput = { OR: [{ pitchVideoLink: null }, { pitchVideoLink: "" }] };
  const and: Prisma.ApplicationWhereInput[] = [];
  if (deck === "yes") and.push({ file: { isNot: null } });
  if (deck === "no") and.push({ file: { is: null } });
  if (video === "file") and.push({ video: { isNot: null } });
  if (video === "link") and.push(hasLink);
  if (video === "any") and.push({ OR: [{ video: { isNot: null } }, hasLink] });
  if (video === "none") and.push({ video: { is: null } }, noLink);
  if (submitted === "yes") and.push({ submittedAt: { not: null } });
  if (submitted === "no") and.push({ submittedAt: null });

  const where: Prisma.ApplicationWhereInput = {
    ...(track === "junior" || track === "main" ? { track } : {}),
    ...(status === "awaiting_payment" || status === "paid" || status === "refunded" ? { status } : {}),
    ...(code ? { referralCode: code } : {}),
    ...(and.length ? { AND: and } : {}),
    ...(q ? { OR: [
      { teamName: { contains: q, mode: "insensitive" } }, { institution: { contains: q, mode: "insensitive" } },
      { reference: { contains: q, mode: "insensitive" } }, { ownerEmail: { contains: q, mode: "insensitive" } },
      { ideaTitle: { contains: q, mode: "insensitive" } },
    ] } : {}),
  };
  const pageSize = 50;
  const [total, rows] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      select: { reference: true, submittedAt: true, track: true, status: true, teamName: true, institution: true, ownerEmail: true, theme: true, ideaTitle: true, referralCode: true, pitchVideoLink: true, createdAt: true, paidAt: true, file: { select: { filename: true } }, video: { select: { filename: true } } },
    }),
  ]);
  return json({
    total, page, pageSize,
    applications: rows.map(({ file, video: vf, pitchVideoLink, ...a }) => ({ ...a, hasDeck: !!file, hasVideoFile: !!vf, hasVideoLink: !!pitchVideoLink })),
  });
}

async function getApplication(reference: string): Promise<Response> {
  const a = await prisma.application.findUnique({
    where: { reference },
    include: { contacts: true, file: { select: { filename: true, size: true, contentType: true, publicUrl: true } }, video: { select: { filename: true, size: true, publicUrl: true } }, payments: { orderBy: { occurredAt: "desc" } } },
  });
  if (!a) return json({ error: "not_found" }, 404);
  return json({ ...a, payments: a.payments.map((p) => ({ id: p.id, type: p.eventType, transactionId: p.transactionId, amount: p.amount, status: p.matchStatus, occurredAt: p.occurredAt })) });
}

const patchSchema = z.object({
  teamName: z.string().trim().min(1).max(100), institution: z.string().trim().min(1).max(150),
  status: z.enum(["awaiting_payment", "paid", "refunded"]),
  referralCode: z.string().trim().toUpperCase().max(30).nullable(),
  theme: z.enum(["planet-sustainability", "bio-economy", "deeptech-manufacturing", "sports-fitness", "d2c-consumer"]).nullable(),
  ideaTitle: z.string().trim().max(150).nullable(), problemStatement: z.string().trim().max(300).nullable(),
  ideaSummary: z.string().trim().max(600).nullable(), pitchVideoLink: z.string().trim().max(255).nullable(),
}).partial();

async function updateApplication(reference: string, raw: unknown): Promise<Response> {
  const parsed = patchSchema.safeParse(raw ?? {});
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const d = { ...parsed.data };
  if (d.referralCode === "") d.referralCode = null;
  const cur = await prisma.application.findUnique({ where: { reference }, select: { paidAt: true } });
  if (!cur) return json({ error: "not_found" }, 404);
  await prisma.application.update({
    where: { reference },
    data: { ...d, ...(d.status === "paid" && !cur.paidAt ? { paidAt: new Date() } : {}), ...(d.ideaTitle !== undefined || d.ideaSummary !== undefined ? { ideaUpdatedAt: new Date() } : {}) },
  });
  return json({ ok: true });
}

// ---------- team members (admin edits the people on a team) ----------

const SLOTS = ["founder", "cofounder", "member3", "member4", "member5", "member6"] as const;
const MEMBER_GENDERS = ["female", "male", "other", "prefer-not-to-say"] as const;
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

const slotSchema = z.object({
  name: z.string().trim().max(100).default(""),
  email: z.string().trim().toLowerCase().max(100).default(""),
  phone: z.string().default("").transform(digits),
  courseYear: z.string().trim().max(100).default(""),
  gender: z.union([z.literal(""), z.enum(MEMBER_GENDERS)]).default(""),
});
const membersSchema = z.object({ founder: slotSchema, cofounder: slotSchema, member3: slotSchema.optional(), member4: slotSchema.optional(), member5: slotSchema.optional(), member6: slotSchema.optional() });
type Slot = z.infer<typeof slotSchema>;
const blankSlot: Slot = { name: "", email: "", phone: "", courseYear: "", gender: "" };
const isBlank = (p: Slot) => !p.name && !p.email && !p.phone && !p.courseYear && !p.gender;

/**
 * PATCH /api/staff/applications/:reference/members: replaces the people on a team (Lead, Co-lead, members 3-6).
 * A member slot left completely blank means "not on the team". Lead and Co-lead can't be removed, only changed.
 * Rewrites the saved details AND the contact list that sign-in access and payment matching use, in one transaction.
 */
async function updateMembers(reference: string, raw: unknown, actor: string): Promise<Response> {
  const parsed = membersSchema.safeParse(raw ?? {});
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const app = await prisma.application.findUnique({ where: { reference }, select: { id: true, track: true, data: true } });
  if (!app) return json({ error: "not_found" }, 404);

  const slots = Object.fromEntries(SLOTS.map((k) => [k, parsed.data[k] ?? blankSlot])) as Record<(typeof SLOTS)[number], Slot>;
  const errors: Record<string, string> = {};
  const maxMembers = app.track === "junior" ? 4 : 6;
  const seen = new Map<string, string>();
  SLOTS.forEach((k, i) => {
    const p = slots[k];
    const required = k === "founder" || k === "cofounder";
    if (!required && isBlank(p)) return;
    if (!required && i + 1 > maxMembers) errors[`${k}.name`] = `A ${app.track} team can have at most ${maxMembers} members`;
    if (!p.name) errors[`${k}.name`] ??= "Name is required";
    if (!z.email().safeParse(p.email).success) errors[`${k}.email`] = "Enter a valid email address";
    if (!/^\d{10,15}$/.test(p.phone)) errors[`${k}.phone`] = "Mobile must be 10–15 digits";
    if (p.email) {
      if (seen.has(p.email)) errors[`${k}.email`] ??= `Same email as ${seen.get(p.email)}`;
      seen.set(p.email, k);
    }
  });
  if (Object.keys(errors).length) return json({ error: "validation", errors }, 422);

  const clean = (p: Slot) => ({ name: p.name, courseYear: p.courseYear, email: p.email, phone: p.phone, gender: p.gender });
  const before = (app.data ?? {}) as Record<string, { email?: string } | undefined>;
  const next = Object.fromEntries(SLOTS.map((k) => [k, isBlank(slots[k]) ? { ...blankSlot } : clean(slots[k])]));
  const contacts = SLOTS.filter((k) => !isBlank(slots[k])).map((k) => ({ applicationId: app.id, role: k, email: slots[k].email, phone: slots[k].phone }));

  await prisma.$transaction(async (tx) => {
    await tx.application.update({ where: { id: app.id }, data: { data: { ...(app.data as object), ...next } as Prisma.InputJsonValue } });
    await tx.applicationContact.deleteMany({ where: { applicationId: app.id, role: { not: "owner" } } }); // the registering account stays
    await tx.applicationContact.createMany({ data: contacts });
  });

  const emails = contacts.map((c) => c.email);
  // Who else uses these emails? Shown to the admin: the same email on two teams makes payment matching ambiguous.
  const clash = await prisma.applicationContact.findMany({
    where: { email: { in: emails }, applicationId: { not: app.id } },
    select: { email: true, role: true, application: { select: { reference: true, teamName: true } } },
  });
  const warnings = clash.map((c) => `${c.email} is also ${c.role === "owner" ? "the sign-in account" : `listed as ${c.role}`} on ${c.application.teamName} (${c.application.reference})`);
  const reconciled = await reconcilePending(emails); // a payment already waiting for one of these emails can now attach
  console.log(JSON.stringify({
    severity: "NOTICE", msg: "team members edited", message: `team members edited: ${reference} by ${actor}`, reference, actor,
    changed: SLOTS.filter((k) => (before[k]?.email ?? "") !== slots[k].email).map((k) => ({ slot: k, from: before[k]?.email ?? "", to: slots[k].email })),
  }));
  return json({ ok: true, warnings, reconciled });
}

async function deleteApplication(reference: string): Promise<Response> {
  const a = await prisma.application.findUnique({ where: { reference }, select: { id: true, file: { select: { objectKey: true } }, video: { select: { objectKey: true } } } });
  if (!a) return json({ error: "not_found" }, 404);
  await prisma.$transaction([
    prisma.payment.updateMany({ where: { applicationId: a.id }, data: { applicationId: null } }), // keep the money trail, unlinked
    prisma.application.delete({ where: { id: a.id } }),
  ]);
  await deleteObject(a.file?.objectKey);
  await deleteObject(a.video?.objectKey);
  return json({ ok: true });
}

async function downloadDeck(reference: string): Promise<Response> {
  const f = await prisma.applicationFile.findFirst({ where: { application: { reference } } });
  return f ? deckResponse(f) : json({ error: "not_found" }, 404);
}

// ---------- roles (super admin) ----------

async function listUsers(): Promise<Response> {
  const rows = await prisma.staffUser.findMany({ orderBy: { createdAt: "asc" } });
  const fixed = config.superAdminEmails.map((email) => ({ email, role: "super_admin", locked: true }));
  return json({ users: [...fixed, ...rows.filter((r) => !config.superAdminEmails.includes(r.email)).map((r) => ({ email: r.email, role: r.role, createdBy: r.createdBy, createdAt: r.createdAt, locked: false }))] });
}

async function setRole(raw: unknown, actor: string): Promise<Response> {
  const parsed = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()), role: z.enum(ROLES) }).safeParse(raw ?? {});
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const { email, role } = parsed.data;
  if (config.superAdminEmails.includes(email)) return json({ error: "locked", message: "This super admin is set in the server configuration." }, 409);
  await prisma.staffUser.upsert({ where: { email }, create: { email, role, createdBy: actor }, update: { role } });
  return json({ ok: true });
}

async function removeUser(email: string, actor: string): Promise<Response> {
  if (config.superAdminEmails.includes(email)) return json({ error: "locked" }, 409);
  if (email === actor) return json({ error: "cannot_remove_self" }, 409);
  const r = await prisma.staffUser.deleteMany({ where: { email } });
  return r.count ? json({ ok: true }) : json({ error: "not_found" }, 404);
}
