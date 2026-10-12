import { config } from "./config.ts";
import type { Tx } from "./db.ts";
import type { Track } from "./fees.ts";
import { type AppRow, decide, type MatchResult } from "./matcher.ts";
import { decryptPaymentLink } from "./paylink.ts";
import { normalizeReference } from "./reference.ts";
import type { WebhookPayload } from "./schema.ts";

/**
 * "junior"/"main" in any case, or GEvents' own option names ("Main Track UG Current Students and 2025 Passouts",
 * "Junior Track School students Class 10 12"). Anything else (e.g. "Test") is unknown, so it cannot block a match.
 */
export const normTrack = (t?: string | null): Track | null => {
  const v = t?.trim().toLowerCase() ?? "";
  if (v === "junior" || v.startsWith("junior track")) return "junior";
  if (v === "main" || v.startsWith("main track")) return "main";
  return null;
};

// deno-lint-ignore no-explicit-any
const toApp = (r: any): AppRow => ({ id: r.id, reference: r.reference, track: r.track, status: r.status, amountDue: r.amountDue });
const clean = (e?: string | null) => e?.trim().toLowerCase() || null;

/** Emails a payment can be matched on: the payer's, plus the authenticated one from our payment-link token if GEvents echoed it. */
export async function paymentEmails(p: WebhookPayload, event: { id: string }) {
  const tokenStr = p.registration?.data ?? p.data ?? null;
  const link = tokenStr && config.paymentLinkKey
    ? await decryptPaymentLink(tokenStr, config.paymentLinkKey, { maxAgeSeconds: config.paymentLinkMaxAgeSeconds })
    : null;
  if (tokenStr && !link) console.warn(JSON.stringify({ severity: "WARNING", msg: "payment-link token present but not valid", event_id: event.id, keyConfigured: !!config.paymentLinkKey }));
  return { link, emails: [...new Set([clean(link?.email), clean(p.payer?.email)].filter((e): e is string => !!e))] };
}

/** The txn id we store for a payment: GEvents may omit transaction_id, so fall back through the other ids it sends. */
export const transactionIdOf = (p: WebhookPayload) =>
  p.payment.transaction_id || p.payment.gateway_payment_id || p.payment.gateway_order_id || p.payment.receipt_number || p.event_id;

/**
 * Finds the application a payment belongs to and decides (see matcher.ts). Locks the candidate rows first, then reads them
 * again, so two payments for one team run one after the other and the second sees "already paid".
 */
export async function matchPayment(tx: Tx, p: WebhookPayload, emails: string[], linkTrack: Track | null): Promise<MatchResult> {
  const txnId = transactionIdOf(p);
  const referenceProvided = typeof p.reference === "string" && p.reference.trim() !== "";
  const reference = normalizeReference(p.reference);

  const candidates = async () => ({
    refRow: reference ? await tx.application.findUnique({ where: { reference } }) : null,
    txnRow: (await tx.payment.findFirst({
      where: { transactionId: txnId, applicationId: { not: null } }, orderBy: { createdAt: "asc" }, include: { application: true },
    }))?.application ?? null,
    founderRows: emails.length ? await tx.application.findMany({ where: { contacts: { some: { role: "founder", email: { in: emails } } } } }) : [],
    emailRows: emails.length ? await tx.application.findMany({ where: { contacts: { some: { email: { in: emails } } } } }) : [],
  });
  const first = await candidates();
  const lockIds = [...new Set([first.refRow, first.txnRow, ...first.founderRows, ...first.emailRows].flatMap((r) => (r ? [r.id] : [])))].sort();
  for (const id of lockIds) await tx.$queryRaw`select id from applications where id = ${id}::uuid for update`;
  const { refRow, txnRow, founderRows, emailRows } = lockIds.length ? await candidates() : first;

  return decide({
    eventType: p.event_type,
    referenceProvided,
    reference,
    track: normTrack(p.registration?.track) ?? linkTrack,
    amount: p.payment.amount,
    byTransaction: txnRow ? toApp(txnRow) : null,
    byReference: refRow ? toApp(refRow) : null,
    byFounderEmail: founderRows.map(toApp),
    byEmail: emailRows.map(toApp),
  });
}
