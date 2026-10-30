import { config } from "./config.ts";
import { Prisma } from "./generated/prisma/client.ts";
import { prisma } from "./db.ts";
import { FEES_PAISE } from "./fees.ts";
import { json } from "./http.ts";
import { reconcilePending } from "./reconcile.ts";
import { abortMultipart, completeMultipart, createMultipart, deckKey, deleteObject, isOwnVideoKey, objectSize, publicUrlFor, putObject, storageEnabled, uploadPart, videoKey } from "./storage.ts";
import { generateReference, normalizeReference } from "./reference.ts";
import { z } from "zod";
import { ideaSchema, teamSchema } from "./schema.ts";

export const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) => {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[i.path.join(".")] ??= i.message;
  return out;
};

/** POST /api/applications (JSON) — step 1: the signed-in user registers their team. One application per Google account. */
export async function createApplication(req: Request, ownerEmail: string): Promise<Response> {
  if (Date.now() > config.registrationDeadline.getTime()) {
    return json({ error: "registration_closed", closedAt: config.registrationDeadline }, 409);
  }
  return insertApplication(await req.json().catch(() => null), ownerEmail);
}

/** Validates a team payload and stores it. Shared by the public flow and the admin panel. */
export async function insertApplication(body: unknown, ownerEmail: string): Promise<Response> {
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const t = parsed.data;

  // A code that is typed must be one we issued (and still active). Leaving it empty is fine, and then the code this account
  // arrived with (from a referral link) is used, so a blank or reset form field never loses it.
  let referralCode = t.referralCode?.toUpperCase() || null;
  if (referralCode) {
    const rc = await prisma.referralCode.findUnique({ where: { code: referralCode } });
    if (!rc || !rc.active) return json({ error: "validation", errors: { referralCode: "This referral code isn't valid" } }, 422);
  } else {
    referralCode = await validAccountReferral(ownerEmail);
  }

  const existing = await prisma.application.findUnique({ where: { ownerEmail }, select: { reference: true, status: true } });
  if (existing) return json({ error: "already_registered", reference: existing.reference, status: existing.status }, 409);

  // Contacts power webhook matching: the owner's Google email plus every teammate's email.
  const contacts = [{ role: "owner", email: ownerEmail, phone: "" }];
  for (const [role, p] of [["founder", t.founder], ["cofounder", t.cofounder], ["member3", t.member3], ["member4", t.member4], ["member5", t.member5], ["member6", t.member6]] as const) {
    if (p.email) contacts.push({ role, email: p.email.toLowerCase(), phone: p.phone });
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateReference();
    try {
      await prisma.application.create({
        data: {
          reference, ownerEmail, referralCode, track: t.track, teamName: t.teamName, institution: t.institution,
          data: { ...t, referralCode: referralCode ?? "" } as unknown as Prisma.InputJsonValue, amountDue: FEES_PAISE[t.track],
          contacts: { create: contacts },
        },
      });
      // People often pay on GEvents before registering here: pick up any payment already waiting for this team's emails.
      await reconcilePending(contacts.map((c) => c.email));
      return json({ reference, amountDue: FEES_PAISE[t.track], track: t.track }, 201);
    } catch (e) {
      // P2002 = unique violation: either a reference collision (retry) or a concurrent double-submit by the same owner.
      if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") throw e;
      const again = await prisma.application.findUnique({ where: { ownerEmail }, select: { reference: true, status: true } });
      if (again) return json({ error: "already_registered", reference: again.reference, status: again.status }, 409);
    }
  }
  return json({ error: "reference_collision" }, 500);
}

/**
 * The application a signed-in Google account belongs to: the one it owns, otherwise the one where it is listed as a
 * team member (lead, co-lead, member 3…6). The owner, Lead and Co-lead can edit; other members get a read-only view.
 */
async function applicationFor(email: string) {
  const owned = await prisma.application.findUnique({ where: { ownerEmail: email } });
  if (owned) return { a: owned, owner: true, canEdit: true };
  // If someone is on several teams, prefer a paid one, then the earliest.
  const where = { contacts: { some: { email } } };
  const member = await prisma.application.findFirst({ where: { ...where, status: "paid" }, orderBy: { createdAt: "asc" } })
    ?? await prisma.application.findFirst({ where, orderBy: { createdAt: "asc" } });
  if (!member) return null;
  // The Lead and Co-lead may edit the submission; members 3-6 can only view it.
  const lead = await prisma.applicationContact.findFirst({ where: { applicationId: member.id, email, role: { in: ["founder", "cofounder"] } }, select: { id: true } });
  return { a: member, owner: false, canEdit: !!lead };
}

/** Serves a stored deck: R2-hosted ones redirect to their public URL, older ones come from the database. */
export function deckResponse(f: { bytes: Uint8Array<ArrayBufferLike> | null; publicUrl: string | null; filename: string; contentType: string }): Response {
  if (f.publicUrl) return Response.redirect(f.publicUrl, 302);
  if (!f.bytes) return json({ error: "not_found" }, 404);
  return new Response(f.bytes as BodyInit, {
    headers: { "content-type": f.contentType, "content-disposition": `attachment; filename="${f.filename.replace(/[^\w.\- ]/g, "_")}"`, "x-content-type-options": "nosniff" },
  });
}

/** GET /api/me/deck — the team's pitch deck, for the owner or any listed team member. */
export async function downloadMyDeck(email: string): Promise<Response> {
  const found = await applicationFor(email);
  const f = found && await prisma.applicationFile.findUnique({ where: { applicationId: found.a.id } });
  return f ? deckResponse(f) : json({ error: "not_found" }, 404);
}

type Person = { name?: string; email?: string; phone?: string; gender?: string; courseYear?: string };
type TeamData = Record<string, Person | undefined> & { founder?: Person };
const ROLES: [string, string][] = [["founder", "Lead"], ["cofounder", "Co-lead"], ["member3", "Member 3"], ["member4", "Member 4"], ["member5", "Member 5"], ["member6", "Member 6"]];
const teamMembers = (d: TeamData | null) =>
  ROLES.flatMap(([k, label]) => (d?.[k]?.email ? [{ role: label, name: d[k]!.name ?? "", email: d[k]!.email!, courseYear: d[k]!.courseYear ?? "" }] : []));

/** GET /api/me/application — everything the website needs to route the user (register → pay → portal). */
export async function getMyApplication(ownerEmail: string): Promise<Response> {
  const found = await applicationFor(ownerEmail);
  if (!found) return json({ error: "not_found" }, 404);
  const { a, owner, canEdit } = found;

  const deck = await prisma.applicationFile.findUnique({ where: { applicationId: a.id }, select: { filename: true, size: true, publicUrl: true } });
  const video = await prisma.applicationVideo.findUnique({ where: { applicationId: a.id }, select: { filename: true, size: true, publicUrl: true } });
  const last = await prisma.payment.findFirst({ where: { applicationId: a.id }, orderBy: { occurredAt: "desc" }, select: { eventType: true, occurredAt: true } });
  const idea = {
    theme: a.theme, ideaTitle: a.ideaTitle, problemStatement: a.problemStatement,
    ideaSummary: a.ideaSummary, pitchVideoLink: a.pitchVideoLink,
  };
  const data = a.data as TeamData | null;
  // The video can be a link or an uploaded file.
  const { pitchVideoLink: _link, ...rest } = idea;
  const complete = Object.values(rest).every(Boolean) && !!deck && (!!idea.pitchVideoLink || !!video);
  const open = Date.now() <= config.ideaEditDeadline.getTime();

  return json({
    reference: a.reference,
    track: a.track,
    referralCode: a.referralCode,
    status: a.status,
    amountDue: a.amountDue,
    createdAt: a.createdAt,
    paidAt: a.paidAt,
    team: { teamName: a.teamName, institution: a.institution },
    // Used by the website to build the (encrypted) GEvents payment link.
    founderEmail: data?.founder?.email ?? null,
    founder: data?.founder
      ? { name: data.founder.name ?? null, email: data.founder.email ?? null, phone: data.founder.phone ?? null, gender: data.founder.gender ?? null }
      : null,
    lastPayment: last ? { type: last.eventType, at: last.occurredAt } : null,
    idea,
    deck: deck ? { filename: deck.filename, size: deck.size, url: deck.publicUrl } : null,
    video: video ? { filename: video.filename, size: video.size, url: video.publicUrl } : null,
    videoUploadAvailable: storageEnabled(),
    ideaComplete: complete,
    submittedAt: a.submittedAt,
    ideaUpdatedAt: a.ideaUpdatedAt,
    ideaEditDeadline: config.ideaEditDeadline,
    // Payment is the LAST step now: teams fill in and submit their idea first, then pay. Only the deadline and the role limit editing.
    canEditIdea: canEdit && open,
    viewerRole: owner ? "owner" : canEdit ? "lead" : "member",
    ownerEmail: canEdit ? null : a.ownerEmail,
    members: teamMembers(data),
  });
}

/** Shared gate for every edit: who may edit, and before the deadline (payment is no longer needed first). */
async function editable(email: string) {
  const found = await applicationFor(email);
  if (!found) return { err: json({ error: "not_found" }, 404) };
  if (!found.canEdit) return { err: json({ error: "read_only", message: "Only the Lead, Co-lead or registering account can edit." }, 403) };
  if (Date.now() > config.ideaEditDeadline.getTime()) return { err: json({ error: "deadline_passed", deadline: config.ideaEditDeadline }, 403) };
  return { a: found.a };
}

/** What is still missing before a team can submit. Empty = ready. */
async function missingForSubmit(id: string): Promise<Record<string, string>> {
  const [a, deck, video] = await Promise.all([
    prisma.application.findUniqueOrThrow({ where: { id } }),
    prisma.applicationFile.findUnique({ where: { applicationId: id }, select: { applicationId: true } }),
    prisma.applicationVideo.findUnique({ where: { applicationId: id }, select: { applicationId: true } }),
  ]);
  const m: Record<string, string> = {};
  if (!a.theme || !a.ideaTitle || !a.problemStatement || !a.ideaSummary) m.details = "Save your idea details";
  if (!deck) m.pitchDeck = "Upload your pitch deck";
  if (!a.pitchVideoLink && !video) m.pitchVideo = "Add a video link or upload a video";
  return m;
}

/** After any edit: a submitted team that is no longer complete goes back to draft, so "submitted" always means complete. */
async function dropSubmissionIfIncomplete(id: string) {
  if (Object.keys(await missingForSubmit(id)).length) await prisma.application.updateMany({ where: { id, submittedAt: { not: null } }, data: { submittedAt: null } });
}

/** PUT /api/me/idea (multipart: `data` JSON) — the idea details only. The deck and video are saved separately. */
export async function saveIdea(req: Request, ownerEmail: string): Promise<Response> {
  const gate = await editable(ownerEmail);
  if (gate.err) return gate.err;
  const a = gate.a;

  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: "expected_multipart" }, 400);
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? ""));
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = ideaSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const i = parsed.data;
  await prisma.application.update({
    where: { id: a.id },
    data: {
      theme: i.theme, ideaTitle: i.ideaTitle, problemStatement: i.problemStatement, ideaSummary: i.ideaSummary,
      ...(i.pitchVideoLink !== undefined ? { pitchVideoLink: i.pitchVideoLink || null } : {}), ideaUpdatedAt: new Date(),
    },
  });
  await dropSubmissionIfIncomplete(a.id);
  return getMyApplication(ownerEmail);
}

/** PUT /api/me/deck (multipart `pitchDeck`, PDF/PPT/PPTX, max 10 MB). Goes to R2 when configured, else Postgres. */
export async function saveDeck(req: Request, email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  const a = gate.a;
  const form = await req.formData().catch(() => null);
  const deck = form?.get("pitchDeck");
  if (!(deck instanceof File) || deck.size === 0) return json({ error: "validation", errors: { pitchDeck: "required" } }, 422);
  if (deck.size > config.maxDeckBytes) return json({ error: "validation", errors: { pitchDeck: "too_large" } }, 422);
  if (!/\.(pdf|pptx?)$/i.test(deck.name)) return json({ error: "validation", errors: { pitchDeck: "bad_type" } }, 422);

  const bytes = new Uint8Array(await deck.arrayBuffer());
  const contentType = deck.type || "application/octet-stream";
  // To R2 first (when configured); the row then records the key and the public URL instead of the bytes.
  let stored: { objectKey: string | null; publicUrl: string | null } = { objectKey: null, publicUrl: null };
  if (storageEnabled()) {
    const objectKey = deckKey(a.reference, deck.name);
    await putObject(objectKey, bytes, contentType, deck.name);
    stored = { objectKey, publicUrl: publicUrlFor(objectKey) };
  }
  const previous = await prisma.applicationFile.findUnique({ where: { applicationId: a.id }, select: { objectKey: true } });
  try {
    const file = { filename: deck.name, contentType, size: deck.size, bytes: stored.objectKey ? null : bytes, ...stored };
    await prisma.applicationFile.upsert({ where: { applicationId: a.id }, create: { applicationId: a.id, ...file }, update: file });
    await prisma.application.update({ where: { id: a.id }, data: { ideaUpdatedAt: new Date() } });
  } catch (e) {
    await deleteObject(stored.objectKey); // the row never saw it: don't leave an orphan behind
    throw e;
  }
  if (previous?.objectKey && previous.objectKey !== stored.objectKey) await deleteObject(previous.objectKey);
  return getMyApplication(email);
}

/** POST /api/me/submit — the final step: everything must be in. Editing stays open until the deadline. */
export async function submitIdea(email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  const missing = await missingForSubmit(gate.a.id);
  if (Object.keys(missing).length) return json({ error: "incomplete", errors: missing }, 422);
  await prisma.application.update({ where: { id: gate.a.id }, data: { submittedAt: gate.a.submittedAt ?? new Date() } });
  return getMyApplication(email);
}

const VIDEO_EXT = /\.(mp4|m4v|mov|webm)$/i;

/** GET /api/applications/:reference — minimal status by reference (internal). */
export async function getApplicationStatus(referenceParam: string): Promise<Response> {
  const reference = normalizeReference(referenceParam);
  if (!reference) return json({ error: "invalid_reference" }, 400);
  const row = await prisma.application.findUnique({ where: { reference } });
  if (!row) return json({ error: "not_found" }, 404);
  return json({ reference: row.reference, track: row.track, status: row.status, amountDue: row.amountDue, createdAt: row.createdAt, paidAt: row.paidAt });
}

/**
 * PUT /api/me/video (multipart: optional `pitchVideoLink` text and/or `pitchVideo` file, max 25 MB). The file goes to R2.
 * A link alone is fine; so is a file alone.
 */
export async function saveVideo(req: Request, email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  const a = gate.a;
  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: "expected_multipart" }, 400);

  const file = form.get("pitchVideo");
  const hasFile = file instanceof File && file.size > 0;
  const linkRaw = form.get("pitchVideoLink");
  const link = typeof linkRaw === "string" ? linkRaw.trim() : undefined;
  const errors: Record<string, string> = {};
  if (link) {
    const ok = z.string().max(255).pipe(z.url()).safeParse(link);
    if (!ok.success) errors.pitchVideoLink = "Enter a valid link (YouTube, Drive…)";
  }
  if (hasFile) {
    if (!storageEnabled()) return json({ error: "video_upload_unavailable" }, 503);
    if (file.size > config.maxVideoBytes) errors.pitchVideo = "too_large";
    else if (!VIDEO_EXT.test(file.name) || (file.type && !file.type.startsWith("video/"))) errors.pitchVideo = "bad_type";
  }
  if (!hasFile && link === undefined) errors.pitchVideo = "Choose a video file or paste a link";
  if (Object.keys(errors).length) return json({ error: "validation", errors }, 422);

  let objectKey: string | null = null;
  let previousKey: string | undefined;
  if (hasFile) {
    const contentType = file.type || (/\.webm$/i.test(file.name) ? "video/webm" : /\.mov$/i.test(file.name) ? "video/quicktime" : "video/mp4");
    objectKey = videoKey(a.reference, file.name);
    await putObject(objectKey, new Uint8Array(await file.arrayBuffer()), contentType, file.name, { inline: true });
    previousKey = (await prisma.applicationVideo.findUnique({ where: { applicationId: a.id }, select: { objectKey: true } }))?.objectKey;
    const row = { filename: file.name, contentType, size: file.size, objectKey, publicUrl: publicUrlFor(objectKey), uploadedAt: new Date() };
    try {
      await prisma.applicationVideo.upsert({ where: { applicationId: a.id }, create: { applicationId: a.id, ...row }, update: row });
    } catch (e) {
      await deleteObject(objectKey);
      throw e;
    }
  }
  await prisma.application.update({ where: { id: a.id }, data: { ...(link !== undefined ? { pitchVideoLink: link || null } : {}), ideaUpdatedAt: new Date() } });
  if (previousKey && previousKey !== objectKey) await deleteObject(previousKey);
  await dropSubmissionIfIncomplete(a.id);
  return getMyApplication(email);
}

/** DELETE /api/me/video — removes the uploaded video file (a pasted link is separate). */
export async function removeVideo(email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  const v = await prisma.applicationVideo.findUnique({ where: { applicationId: gate.a.id } });
  if (v) {
    await prisma.applicationVideo.delete({ where: { applicationId: gate.a.id } });
    await deleteObject(v.objectKey);
  }
  await dropSubmissionIfIncomplete(gate.a.id);
  return getMyApplication(email);
}

/**
 * GET /api/me/payment: has this Google account already paid on GEvents without a team to attach it to? That happens when people
 * pay from a link that did not come through our site (e.g. a poster). The website uses it to put "Pay now" first in the stepper.
 */
export async function getMyPendingPayment(email: string): Promise<Response> {
  const rows = await prisma.$queryRaw<{ amount: number | null; occurred_at: Date }[]>`
    select pm.amount, pm.occurred_at
    from payments pm join payment_events e on e.event_id = pm.event_id
    where pm.event_type = 'payment.succeeded' and pm.application_id is null and pm.reviewed_at is null
      and pm.match_status <> 'matched' and lower(e.payload->'payer'->>'email') = ${email}
    order by pm.occurred_at desc limit 1`;
  return json({ pending: rows[0] ? { amount: rows[0].amount, occurredAt: rows[0].occurred_at } : null });
}

/** The account's stored referral, but only while the code is still valid (issued and active). */
async function validAccountReferral(email: string): Promise<string | null> {
  const r = await prisma.accountReferral.findUnique({ where: { email } });
  if (!r) return null;
  const rc = await prisma.referralCode.findUnique({ where: { code: r.code } });
  return rc?.active ? r.code : null;
}

/** GET /api/me/referral: the code to prefill on the registration form. */
export async function getMyReferral(email: string): Promise<Response> {
  return json({ code: await validAccountReferral(email) });
}

/**
 * PUT /api/me/referral {code}: link the code a visitor arrived with to their account. The first valid code wins, so a later
 * link click never replaces it. Unknown or inactive codes are ignored (`linked: false`), and the site then drops them.
 */
export async function setMyReferral(req: Request, email: string): Promise<Response> {
  const body = await req.json().catch(() => null) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return json({ linked: false, code: await validAccountReferral(email) });
  const rc = await prisma.referralCode.findUnique({ where: { code } });
  if (!rc?.active) return json({ linked: false, code: await validAccountReferral(email) });

  const current = await validAccountReferral(email);
  if (current) return json({ linked: false, code: current }); // first valid code wins
  await prisma.accountReferral.upsert({ where: { email }, create: { email, code }, update: { code } });
  return json({ linked: true, code });
}

// ---------- chunked video upload (up to config.maxVideoBytes, sent in parts so no single request is huge) ----------
const PART_BYTES = 8 * 1024 * 1024; // the website cuts the file into parts of this size (R2 needs >= 5 MiB except for the last)
const MAX_PARTS = 12;

const videoMime = (name: string, given: string) => given || (/\.webm$/i.test(name) ? "video/webm" : /\.mov$/i.test(name) ? "video/quicktime" : "video/mp4");

/** POST /api/me/video/start {filename, size, type}: begins an upload and says how big each part must be. */
export async function startVideoUpload(req: Request, email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  if (!storageEnabled()) return json({ error: "video_upload_unavailable" }, 503);
  const b = await req.json().catch(() => null) as { filename?: unknown; size?: unknown; type?: unknown } | null;
  const filename = typeof b?.filename === "string" ? b.filename : "";
  const size = typeof b?.size === "number" ? b.size : 0;
  const type = typeof b?.type === "string" ? b.type : "";
  if (!size || size < 1) return json({ error: "validation", errors: { pitchVideo: "Choose a video file" } }, 422);
  if (size > config.maxVideoBytes) return json({ error: "validation", errors: { pitchVideo: "too_large" } }, 422);
  if (!VIDEO_EXT.test(filename) || (type && !type.startsWith("video/"))) return json({ error: "validation", errors: { pitchVideo: "bad_type" } }, 422);
  if (Math.ceil(size / PART_BYTES) > MAX_PARTS) return json({ error: "validation", errors: { pitchVideo: "too_large" } }, 422);

  const key = videoKey(gate.a.reference, filename);
  const uploadId = await createMultipart(key, videoMime(filename, type), filename, { inline: true });
  return json({ key, uploadId, partBytes: PART_BYTES });
}

/** PUT /api/me/video/part?key=&uploadId=&n= (raw bytes of one part). Returns the part's etag. */
export async function putVideoPart(req: Request, url: URL, email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  const key = url.searchParams.get("key") ?? "", uploadId = url.searchParams.get("uploadId") ?? "", n = Number(url.searchParams.get("n"));
  if (!isOwnVideoKey(key, gate.a.reference)) return json({ error: "forbidden" }, 403);
  if (!uploadId || !Number.isInteger(n) || n < 1 || n > MAX_PARTS) return json({ error: "bad_request" }, 400);
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.length === 0 || bytes.length > PART_BYTES + 1024 * 1024) return json({ error: "bad_part_size" }, 413);
  return json({ etag: await uploadPart(key, uploadId, n, bytes) });
}

/** POST /api/me/video/complete {key, uploadId, filename, type, parts:[{n, etag}]}: joins the parts and saves the video on the team. */
export async function completeVideoUpload(req: Request, email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  const a = gate.a;
  const b = await req.json().catch(() => null) as { key?: string; uploadId?: string; filename?: string; type?: string; parts?: { n: number; etag: string }[] } | null;
  const key = b?.key ?? "", uploadId = b?.uploadId ?? "", filename = b?.filename ?? "", parts = b?.parts ?? [];
  if (!isOwnVideoKey(key, a.reference) || !uploadId || !parts.length || parts.length > MAX_PARTS) return json({ error: "bad_request" }, 400);
  if (!parts.every((p) => Number.isInteger(p.n) && p.n >= 1 && typeof p.etag === "string" && p.etag.length < 100)) return json({ error: "bad_request" }, 400);

  await completeMultipart(key, uploadId, parts);
  const size = await objectSize(key);
  if (size === null || size > config.maxVideoBytes) {
    await deleteObject(key);
    return json({ error: "validation", errors: { pitchVideo: "too_large" } }, 422);
  }
  const contentType = videoMime(filename, b?.type ?? "");
  const previous = await prisma.applicationVideo.findUnique({ where: { applicationId: a.id }, select: { objectKey: true } });
  const row = { filename: filename || "video", contentType, size, objectKey: key, publicUrl: publicUrlFor(key), uploadedAt: new Date() };
  try {
    await prisma.applicationVideo.upsert({ where: { applicationId: a.id }, create: { applicationId: a.id, ...row }, update: row });
    await prisma.application.update({ where: { id: a.id }, data: { ideaUpdatedAt: new Date() } });
  } catch (e) {
    await deleteObject(key);
    throw e;
  }
  if (previous && previous.objectKey !== key) await deleteObject(previous.objectKey);
  await dropSubmissionIfIncomplete(a.id);
  return getMyApplication(email);
}

/** POST /api/me/video/abort {key, uploadId}: throws away an upload that failed half way. */
export async function abortVideoUpload(req: Request, email: string): Promise<Response> {
  const gate = await editable(email);
  if (gate.err) return gate.err;
  const b = await req.json().catch(() => null) as { key?: string; uploadId?: string } | null;
  if (b?.key && b.uploadId && isOwnVideoKey(b.key, gate.a.reference)) await abortMultipart(b.key, b.uploadId);
  return json({ ok: true });
}
