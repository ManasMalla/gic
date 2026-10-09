import { config } from "./config.ts";
import { sql } from "./db.ts";
import { json } from "./http.ts";
import { type AppRow, decide, type MatchInput } from "./matcher.ts";
import { normalizeReference } from "./reference.ts";
import { type WebhookPayload, webhookSchema } from "./schema.ts";
import { verifySignature } from "./signature.ts";

// deno-lint-ignore no-explicit-any
const toApp = (r: any): AppRow => ({ id: r.id, reference: r.reference, track: r.track, status: r.status, amountDue: r.amount_due });

/**
 * POST /api/webhooks/gevents/payment
 * 401 bad/missing/stale signature · 400 malformed · 200 accepted (also for duplicates, so GEvents stops retrying).
 * Anything we cannot match is still stored and answered with 200: the money must never be "lost" by a 4xx.
 */
export async function handleGeventsWebhook(req: Request): Promise<Response> {
  const rawBody = await req.text();

  const sig = await verifySignature({
    rawBody,
    timestamp: req.headers.get("x-gevents-timestamp"),
    signature: req.headers.get("x-gevents-signature"),
    secrets: config.webhookSecrets,
    windowSeconds: config.replayWindowSeconds,
  });
  if (sig !== "ok") {
    console.warn(JSON.stringify({ msg: "webhook rejected", reason: sig }));
    return json({ error: `signature_${sig}` }, 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_payload", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, 400);
  const p: WebhookPayload = parsed.data;

  const outcome = await sql.begin(async (tx) => {
    // Idempotency: the event id is the primary key. A replay inserts nothing.
    const inserted = await tx`insert into payment_events (event_id, event_type, payload)
      values (${p.event_id}, ${p.event_type}, ${tx.json(body as never)}) on conflict (event_id) do nothing returning event_id`;
    if (inserted.length === 0) return { duplicate: true as const };

    const reference = normalizeReference(p.reference);
    const email = p.payer?.email?.trim().toLowerCase() || null;

    const [refRow] = reference
      ? await tx`select * from applications where reference = ${reference} for update`
      : [];
    const [txnRow] = await tx`
      select a.* from payments pm join applications a on a.id = pm.application_id
      where pm.transaction_id = ${p.payment.transaction_id} order by pm.created_at limit 1 for update of a`;
    const emailRows = email
      ? await tx`select distinct a.* from applications a join application_contacts c on c.application_id = a.id where c.email = ${email}`
      : [];

    const input: MatchInput = {
      eventType: p.event_type,
      reference,
      track: p.registration?.track ?? null,
      amount: p.payment.amount,
      byTransaction: txnRow ? toApp(txnRow) : null,
      byReference: refRow ? toApp(refRow) : null,
      byEmail: emailRows.map(toApp),
    };
    const result = decide(input);

    await tx`insert into payments (event_id, event_type, transaction_id, application_id, match_status, match_method, flags, amount, currency, occurred_at)
      values (${p.event_id}, ${p.event_type}, ${p.payment.transaction_id}, ${result.application?.id ?? null}, ${result.status},
              ${result.method}, ${result.flags}, ${p.payment.amount}, ${p.payment.currency}, ${p.occurred_at})`;

    // Only a clean match changes an application's state.
    if (result.status === "matched" && result.application) {
      if (p.event_type === "payment.succeeded") {
        await tx`update applications set status = 'paid', paid_at = ${p.occurred_at} where id = ${result.application.id} and status = 'awaiting_payment'`;
      } else if (p.event_type === "payment.refunded") {
        await tx`update applications set status = 'refunded' where id = ${result.application.id} and status = 'paid'`;
      }
    }
    return { duplicate: false as const, match: result.status, flags: result.flags, reference: result.application?.reference ?? null };
  });

  console.log(JSON.stringify({ msg: "webhook processed", event_id: p.event_id, type: p.event_type, ...outcome }));
  return json({ status: "ok", ...outcome }, 200);
}
