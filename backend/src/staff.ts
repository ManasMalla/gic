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
  return json({
    perTrack,
    byStatus: byStatus.map((r) => ({ track: r.track, status: r.status, count: r._count._all })),
    total: byTrack.reduce((n, r) => n + r._count._all, 0),
    referrals: byCode.map((r) => ({ code: r.referralCode, registrations: r._count._all, paid: paid.get(r.referralCode) ?? 0 })),
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
  const [codes, used, paid] = await Promise.all([
    prisma.referralCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.application.groupBy({ by: ["referralCode"], where: { referralCode: { not: null } }, _count: { _all: true } }),
    prisma.application.groupBy({ by: ["referralCode"], where: { referralCode: { not: null }, status: "paid" }, _count: { _all: true } }),
  ]);
  const u = new Map(used.map((r) => [r.referralCode, r._count._all]));
  const p = new Map(paid.map((r) => [r.referralCode, r._count._all]));
  return json({ codes: codes.map((c) => ({ ...c, registrations: u.get(c.code) ?? 0, paid: p.get(c.code) ?? 0 })) });
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
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const where: Prisma.ApplicationWhereInput = {
    ...(track === "junior" || track === "main" ? { track } : {}),
    ...(status === "awaiting_payment" || status === "paid" || status === "refunded" ? { status } : {}),
    ...(code ? { referralCode: code } : {}),
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
      select: { reference: true, submittedAt: true, track: true, status: true, teamName: true, institution: true, ownerEmail: true, theme: true, ideaTitle: true, referralCode: true, createdAt: true, paidAt: true, file: { select: { filename: true } } },
    }),
  ]);
  return json({ total, page, pageSize, applications: rows.map(({ file, ...a }) => ({ ...a, hasDeck: !!file })) });
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
