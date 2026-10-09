import { config } from "./config.ts";
import { sql } from "./db.ts";
import { FEES_PAISE } from "./fees.ts";
import { json } from "./http.ts";
import { generateReference, normalizeReference } from "./reference.ts";
import { ideaSchema, teamSchema } from "./schema.ts";

const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) => {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[i.path.join(".")] ??= i.message;
  return out;
};

/** POST /api/applications (JSON) — step 1: the signed-in user registers their team. One application per Google account. */
export async function createApplication(req: Request, ownerEmail: string): Promise<Response> {
  if (Date.now() > config.registrationDeadline.getTime()) {
    return json({ error: "registration_closed", closedAt: config.registrationDeadline }, 409);
  }
  const body = await req.json().catch(() => null);
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) return json({ error: "validation", errors: issues(parsed.error) }, 422);
  const t = parsed.data;

  const [existing] = await sql`select reference, status from applications where owner_email = ${ownerEmail}`;
  if (existing) return json({ error: "already_registered", reference: existing.reference, status: existing.status }, 409);

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateReference();
    try {
      await sql.begin(async (tx) => {
        const [row] = await tx`
          insert into applications (reference, owner_email, track, team_name, institution, data, amount_due)
          values (${reference}, ${ownerEmail}, ${t.track}, ${t.teamName}, ${t.institution}, ${tx.json(t as never)}, ${FEES_PAISE[t.track]})
          returning id`;
        // Contacts power webhook matching: the owner's Google email plus every teammate's email.
        const contacts: [string, string, string][] = [["owner", ownerEmail, ""]];
        for (const [role, p] of [["founder", t.founder], ["cofounder", t.cofounder], ["member3", t.member3], ["member4", t.member4], ["member5", t.member5], ["member6", t.member6]] as const) {
          if (p.email) contacts.push([role, p.email.toLowerCase(), p.phone]);
        }
        for (const [role, email, phone] of contacts) {
          await tx`insert into application_contacts (application_id, role, email, phone) values (${row.id}, ${role}, ${email}, ${phone})`;
        }
      });
      return json({ reference, amountDue: FEES_PAISE[t.track], track: t.track }, 201);
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "23505") throw e;
      // 23505 = unique violation: either a reference collision (retry) or a concurrent double-submit by the same owner.
      const [again] = await sql`select reference, status from applications where owner_email = ${ownerEmail}`;
      if (again) return json({ error: "already_registered", reference: again.reference, status: again.status }, 409);
    }
  }
  return json({ error: "reference_collision" }, 500);
}

/** GET /api/me/application — everything the website needs to route the user (register → pay → portal). */
export async function getMyApplication(ownerEmail: string): Promise<Response> {
  const [a] = await sql`select * from applications where owner_email = ${ownerEmail}`;
  if (!a) return json({ error: "not_found" }, 404);

  const [deck] = await sql`select filename, size from application_files where application_id = ${a.id}`;
  const [last] = await sql`select event_type, occurred_at from payments where application_id = ${a.id} order by occurred_at desc limit 1`;
  const idea = {
    theme: a.theme, ideaTitle: a.idea_title, problemStatement: a.problem_statement,
    ideaSummary: a.idea_summary, pitchVideoLink: a.pitch_video_link,
  };
  const complete = Object.values(idea).every(Boolean) && !!deck;
  const open = Date.now() <= config.ideaEditDeadline.getTime();

  return json({
    reference: a.reference,
    track: a.track,
    status: a.status,
    amountDue: a.amount_due,
    createdAt: a.created_at,
    paidAt: a.paid_at,
    team: { teamName: a.team_name, institution: a.institution },
    // Used by the website to build the (encrypted) GEvents payment link.
    founderEmail: (a.data?.founder?.email as string | undefined) ?? null,
    founder: a.data?.founder
      ? { name: a.data.founder.name ?? null, email: a.data.founder.email ?? null, phone: a.data.founder.phone ?? null, gender: a.data.founder.gender ?? null }
      : null,
    lastPayment: last ? { type: last.event_type, at: last.occurred_at } : null,
    idea,
    deck: deck ? { filename: deck.filename, size: deck.size } : null,
    ideaComplete: complete,
    ideaUpdatedAt: a.idea_updated_at,
    ideaEditDeadline: config.ideaEditDeadline,
    canEditIdea: a.status === "paid" && open,
  });
}

/** PUT /api/me/idea (multipart: `data` JSON + optional `pitchDeck`) — only for paid teams, only before the deadline. */
export async function saveIdea(req: Request, ownerEmail: string): Promise<Response> {
  const [a] = await sql`select id, status from applications where owner_email = ${ownerEmail}`;
  if (!a) return json({ error: "not_found" }, 404);
  if (a.status !== "paid") return json({ error: "payment_required" }, 403);
  if (Date.now() > config.ideaEditDeadline.getTime()) return json({ error: "deadline_passed", deadline: config.ideaEditDeadline }, 403);

  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: "expected_multipart" }, 400);
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? ""));
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = ideaSchema.safeParse(raw);
  const errors = parsed.success ? {} : issues(parsed.error);

  const deck = form.get("pitchDeck");
  const hasNewDeck = deck instanceof File && deck.size > 0;
  const [existing] = await sql`select 1 as x from application_files where application_id = ${a.id}`;
  if (hasNewDeck) {
    if (deck.size > config.maxDeckBytes) (errors as Record<string, string>).pitchDeck = "too_large";
    else if (!/\.(pdf|pptx?)$/i.test(deck.name)) (errors as Record<string, string>).pitchDeck = "bad_type";
  } else if (!existing) {
    (errors as Record<string, string>).pitchDeck = "required";
  }
  if (!parsed.success || Object.keys(errors).length) return json({ error: "validation", errors }, 422);

  const i = parsed.data;
  await sql.begin(async (tx) => {
    await tx`update applications set theme = ${i.theme}, idea_title = ${i.ideaTitle}, problem_statement = ${i.problemStatement},
             idea_summary = ${i.ideaSummary}, pitch_video_link = ${i.pitchVideoLink}, idea_updated_at = now() where id = ${a.id}`;
    if (hasNewDeck) {
      const bytes = new Uint8Array(await deck.arrayBuffer());
      await tx`insert into application_files (application_id, filename, content_type, size, bytes)
               values (${a.id}, ${deck.name}, ${deck.type || "application/octet-stream"}, ${deck.size}, ${bytes})
               on conflict (application_id) do update set filename = excluded.filename, content_type = excluded.content_type,
               size = excluded.size, bytes = excluded.bytes`;
    }
  });
  return getMyApplication(ownerEmail);
}

/** GET /api/applications/:reference — minimal status by reference (internal). */
export async function getApplicationStatus(referenceParam: string): Promise<Response> {
  const reference = normalizeReference(referenceParam);
  if (!reference) return json({ error: "invalid_reference" }, 400);
  const [row] = await sql`select reference, track, status, amount_due, created_at, paid_at from applications where reference = ${reference}`;
  if (!row) return json({ error: "not_found" }, 404);
  return json({ reference: row.reference, track: row.track, status: row.status, amountDue: row.amount_due, createdAt: row.created_at, paidAt: row.paid_at });
}
