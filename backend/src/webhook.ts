import { config } from "./config.ts";
import { sql } from "./db.ts";
import { json } from "./http.ts";
import { redactHeaders, sha256Hex, signatureHints, truncate } from "./debuglog.ts";
import { type AppRow, decide, type MatchInput } from "./matcher.ts";
import { decryptPaymentLink } from "./paylink.ts";
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
  const timestamp = req.headers.get("x-gevents-timestamp");
  const signature = req.headers.get("x-gevents-signature");
  const nowSec = Math.floor(Date.now() / 1000);

  // Debug log #1: everything that hit us, BEFORE verification, so rejected calls can be diagnosed too.
  try {
    console.log(JSON.stringify({
      severity: "INFO",
      msg: "webhook hit",
      method: req.method,
      path: new URL(req.url).pathname,
      clientIp: req.headers.get("x-forwarded-for") ?? null,
      securityHeaders: {
        "x-gevents-signature": signature,
        "x-gevents-timestamp": timestamp,
        timestampSkewSeconds: timestamp && /^\d+$/.test(timestamp) ? nowSec - Number(timestamp) : null,
      },
      bodyBytes: new TextEncoder().encode(rawBody).length,
      bodySha256: await sha256Hex(rawBody),
      ...(config.webhookDebugLog ? { headers: redactHeaders(req.headers), body: truncate(rawBody) } : {}),
    }));
  } catch (e) {
    console.error(JSON.stringify({ msg: "webhook debug log failed", error: String(e) }));
  }

  const sig = await verifySignature({
    rawBody,
    timestamp,
    signature,
    secrets: config.webhookSecrets,
    windowSeconds: config.replayWindowSeconds,
  });
  console.log(JSON.stringify({
    severity: sig === "ok" ? "INFO" : "WARNING",
    msg: "webhook signature check",
    result: sig,
    secretsConfigured: config.webhookSecrets.length,
    ...(sig === "ok" ? {} : { hints: signatureHints(timestamp, signature, nowSec) }),
  }));
  if (sig !== "ok") return json({ error: `signature_${sig}` }, 401);

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.warn(JSON.stringify({ severity: "WARNING", msg: "webhook body is not valid JSON" }));
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    console.warn(JSON.stringify({ severity: "WARNING", msg: "webhook payload rejected", issues }));
    return json({ error: "invalid_payload", issues }, 400);
  }
  const p: WebhookPayload = parsed.data;

  const outcome = await sql.begin(async (tx) => {
    // Idempotency: the event id is the primary key. A replay inserts nothing.
    const inserted = await tx`insert into payment_events (event_id, event_type, payload)
      values (${p.event_id}, ${p.event_type}, ${tx.json(body as never)}) on conflict (event_id) do nothing returning event_id`;
    if (inserted.length === 0) return { duplicate: true as const };

    const referenceProvided = typeof p.reference === "string" && p.reference.trim() !== "";
    const reference = normalizeReference(p.reference);

    // The payment-link token we put in the GEvents URL, if GEvents echoed it back. Authenticated (AES-GCM), so
    // its email/track are trustworthy even if the payer typed a different email on the GEvents form.
    const tokenStr = p.registration?.data ?? p.data ?? null;
    const link = tokenStr && config.paymentLinkKey
      ? await decryptPaymentLink(tokenStr, config.paymentLinkKey, { maxAgeSeconds: config.paymentLinkMaxAgeSeconds })
      : null;
    if (tokenStr && !link) console.warn(JSON.stringify({ severity: "WARNING", msg: "payment-link token present but not valid", event_id: p.event_id, keyConfigured: !!config.paymentLinkKey }));

    const clean = (e?: string | null) => e?.trim().toLowerCase() || null;
    const emails = [...new Set([clean(link?.email), clean(p.payer?.email)].filter((e): e is string => !!e))];

    const [refRow] = reference
      ? await tx`select * from applications where reference = ${reference} for update`
      : [];
    const [txnRow] = await tx`
      select a.* from payments pm join applications a on a.id = pm.application_id
      where pm.transaction_id = ${p.payment.transaction_id} order by pm.created_at limit 1 for update of a`;
    const founderRows = emails.length
      ? await tx`select distinct a.* from applications a join application_contacts c on c.application_id = a.id
                 where c.role = 'founder' and c.email = any(${emails})`
      : [];
    const emailRows = emails.length
      ? await tx`select distinct a.* from applications a join application_contacts c on c.application_id = a.id
                 where c.email = any(${emails})`
      : [];

    const input: MatchInput = {
      eventType: p.event_type,
      referenceProvided,
      reference,
      track: p.registration?.track ?? link?.track ?? null,
      amount: p.payment.amount,
      byTransaction: txnRow ? toApp(txnRow) : null,
      byReference: refRow ? toApp(refRow) : null,
      byFounderEmail: founderRows.map(toApp),
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
    return { duplicate: false as const, match: result.status, method: result.method, flags: result.flags, reference: result.application?.reference ?? null };
  });

  console.log(JSON.stringify({ severity: "INFO", msg: "webhook processed", event_id: p.event_id, type: p.event_type, ...outcome }));
  return json({ status: "ok", ...outcome }, 200);
}
