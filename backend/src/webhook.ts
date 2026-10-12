import { config } from "./config.ts";
import { Prisma } from "./generated/prisma/client.ts";
import { prisma } from "./db.ts";
import { json } from "./http.ts";
import { redactHeaders, sha256Hex, signatureHints, truncate } from "./debuglog.ts";
import { matchPayment, paymentEmails, transactionIdOf } from "./matching.ts";
import { type WebhookPayload, webhookSchema } from "./schema.ts";
import { diagnoseSignature, verifySignature } from "./signature.ts";

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
    let payload: unknown = undefined;
    try { payload = JSON.parse(rawBody); } catch { /* not JSON: the raw body below still shows what arrived */ }
    console.log(JSON.stringify({
      severity: "INFO",
      // `message` is what Cloud Logging shows on the collapsed line, so the call is readable without expanding the entry.
      message: `webhook hit ${req.method} ${new URL(req.url).pathname} | ts=${timestamp} sig=${signature} | body=${truncate(rawBody, 2000)}`,
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
      // `body` = the exact raw string received (what the signature covers); `payload` = the same, parsed, for easy reading/filtering.
      ...(config.webhookDebugLog ? { headers: redactHeaders(req.headers), body: truncate(rawBody), ...(payload !== undefined ? { payload } : {}) } : {}),
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
  // On failure, also say which common signing mistakes WOULD have produced the signature we received.
  const diagnosis = sig === "ok" ? [] : await diagnoseSignature({ rawBody, timestamp, signature, secrets: config.webhookSecrets });
  console.log(JSON.stringify({
    severity: sig === "ok" ? "INFO" : "WARNING",
    message: sig === "ok"
      ? "webhook signature check: ok"
      : `webhook signature check: ${sig.toUpperCase()} | ${diagnosis.length ? "matches if GEvents " + diagnosis.join(" OR ") : "no known variant matches: GEvents is most likely using a DIFFERENT SECRET (or hashing different bytes)"}`,
    msg: "webhook signature check",
    result: sig,
    secretsConfigured: config.webhookSecrets.length,
    ...(sig === "ok" ? {} : { hints: signatureHints(timestamp, signature, nowSec), diagnosis }),
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
    console.warn(JSON.stringify({ severity: "WARNING", message: `webhook payload rejected: ${issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`, msg: "webhook payload rejected", issues }));
    return json({ error: "invalid_payload", issues }, 400);
  }
  const p: WebhookPayload = parsed.data;

  const outcome = await prisma.$transaction(async (tx) => {
    // Idempotency: the event id is the primary key. A replay inserts nothing.
    const inserted = await tx.paymentEvent.createMany({
      data: [{ eventId: p.event_id, eventType: p.event_type, payload: body as Prisma.InputJsonValue }],
      skipDuplicates: true,
    });
    if (inserted.count === 0) return { duplicate: true as const };

    const txnId = transactionIdOf(p);
    // Authenticated email/track from our payment-link token (if echoed) plus the payer's email.
    const { link, emails } = await paymentEmails(p, { id: p.event_id });
    const result = await matchPayment(tx, p, emails, link?.track ?? null);

    const occurredAt = new Date(p.occurred_at);
    await tx.payment.create({
      data: {
        eventId: p.event_id, eventType: p.event_type, transactionId: txnId, applicationId: result.application?.id ?? null,
        matchStatus: result.status, matchMethod: result.method, flags: result.flags, amount: p.payment.amount,
        currency: p.payment.currency, occurredAt,
      },
    });

    // Only a clean match changes an application's state.
    if (result.status === "matched" && result.application) {
      if (p.event_type === "payment.succeeded") {
        await tx.application.updateMany({ where: { id: result.application.id, status: "awaiting_payment" }, data: { status: "paid", paidAt: occurredAt } });
      } else if (p.event_type === "payment.refunded") {
        await tx.application.updateMany({ where: { id: result.application.id, status: "paid" }, data: { status: "refunded" } });
      }
    }
    return { duplicate: false as const, match: result.status, method: result.method, flags: result.flags, reference: result.application?.reference ?? null };
  });

  console.log(JSON.stringify({ severity: "INFO", message: `webhook processed: ${p.event_type} -> ${"duplicate" in outcome && outcome.duplicate ? "duplicate (ignored)" : `${(outcome as {match?: string}).match}${(outcome as {method?: string | null}).method ? " via " + (outcome as {method?: string | null}).method : ""}`}`, msg: "webhook processed", event_id: p.event_id, type: p.event_type, ...outcome }));
  return json({ status: "ok", ...outcome }, 200);
}
