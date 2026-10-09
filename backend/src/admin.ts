import { sql } from "./db.ts";
import { json } from "./http.ts";
import { normalizeReference } from "./reference.ts";

/** GET /api/admin/payments?status=needs_review,unmatched — payments a human must look at. */
export async function listPayments(url: URL): Promise<Response> {
  const wanted = (url.searchParams.get("status") ?? "needs_review,unmatched").split(",");
  const rows = await sql`
    select pm.id, pm.event_type, pm.transaction_id, pm.match_status, pm.match_method, pm.flags, pm.amount, pm.currency,
           pm.occurred_at, pm.reviewed_at, pm.review_note, a.reference as application_reference,
           e.payload->'payer' as payer, e.payload->>'reference' as reported_reference
    from payments pm
    join payment_events e on e.event_id = pm.event_id
    left join applications a on a.id = pm.application_id
    where pm.match_status = any(${wanted}) and pm.reviewed_at is null
    order by pm.occurred_at desc limit 200`;
  return json({ payments: rows });
}

/** POST /api/admin/payments/:id/assign {reference, note?} — a human decides which application this payment belongs to. */
export async function assignPayment(id: string, req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({})) as { reference?: string; note?: string };
  const reference = normalizeReference(body.reference);
  if (!reference) return json({ error: "invalid_reference" }, 400);

  return await sql.begin(async (tx) => {
    const [pm] = await tx`select * from payments where id = ${id} for update`;
    if (!pm) return json({ error: "payment_not_found" }, 404);
    const [app] = await tx`select * from applications where reference = ${reference} for update`;
    if (!app) return json({ error: "application_not_found" }, 404);

    await tx`update payments set application_id = ${app.id}, match_status = 'matched', match_method = 'manual',
             reviewed_at = now(), review_note = ${body.note ?? null} where id = ${id}`;
    if (pm.event_type === "payment.succeeded") {
      await tx`update applications set status = 'paid', paid_at = ${pm.occurred_at} where id = ${app.id} and status = 'awaiting_payment'`;
    } else if (pm.event_type === "payment.refunded") {
      await tx`update applications set status = 'refunded' where id = ${app.id} and status = 'paid'`;
    }
    return json({ ok: true, reference });
  }) as Response;
}

/** POST /api/admin/payments/:id/dismiss {note} — acknowledged, no application (e.g. test payment, handled by refund). */
export async function dismissPayment(id: string, req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({})) as { note?: string };
  const r = await sql`update payments set reviewed_at = now(), review_note = ${body.note ?? null} where id = ${id} returning id`;
  return r.length ? json({ ok: true }) : json({ error: "payment_not_found" }, 404);
}
