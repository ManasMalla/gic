import { FEES_PAISE, type Track } from "./fees.ts";

export type AppRow = { id: string; reference: string; track: Track; status: "awaiting_payment" | "paid" | "refunded"; amountDue: number };

export type MatchInput = {
  eventType: "payment.succeeded" | "payment.failed" | "payment.refunded";
  /** True when the webhook carried a reference at all (we no longer send one, but GEvents may still echo it). */
  referenceProvided: boolean;
  /** Canonical reference if provided AND it passed the check digit; otherwise null. */
  reference: string | null;
  /** From the payload, or from the decrypted payment-link token. */
  track: Track | null;
  amount: number | null;
  /** Application previously linked to the same GEvents transaction (used for refunds/failures). */
  byTransaction: AppRow | null;
  byReference: AppRow | null;
  /** Applications whose FOUNDER (team lead) email equals the email on the payment. */
  byFounderEmail: AppRow[];
  /** Applications where ANY team member / the Google account owner has that email. */
  byEmail: AppRow[];
};

export type Flag =
  | "reference_invalid"
  | "reference_not_found"
  | "amount_mismatch"
  | "track_mismatch"
  | "already_paid"
  | "ambiguous_email"
  | "no_candidate";

export type MatchResult = {
  status: "matched" | "needs_review" | "unmatched";
  method: "reference" | "transaction" | "founder_email" | "email" | null;
  application: AppRow | null;
  flags: Flag[];
};

/**
 * Pure decision logic, no I/O. Rules, strongest signal first:
 *  1. transaction id seen before (refunds follow the original payment)
 *  2. a reference, if GEvents still sends one (check digit verified)
 *  3. the FOUNDER's email + track + exact fee, when exactly ONE awaiting-payment application fits
 *  4. any team member's email, same conditions
 * We never guess: anything uncertain becomes `needs_review`/`unmatched` for a human.
 */
export function decide(i: MatchInput): MatchResult {
  const flags: Flag[] = [];
  let app: AppRow | null = null;
  let method: MatchResult["method"] = null;

  if (i.byTransaction) {
    app = i.byTransaction;
    method = "transaction";
  } else if (i.byReference) {
    app = i.byReference;
    method = "reference";
  } else {
    if (i.referenceProvided) flags.push(i.reference ? "reference_not_found" : "reference_invalid");

    if (i.eventType === "payment.succeeded") {
      const fits = (a: AppRow) => a.status === "awaiting_payment" && (i.track === null || a.track === i.track) && a.amountDue === i.amount;
      const founder = i.byFounderEmail.filter(fits);
      const anyone = i.byEmail.filter(fits);

      if (founder.length === 1) {
        app = founder[0];
        method = "founder_email";
        flags.length = 0; // matched without a reference: that is the normal path now, not a problem
      } else if (founder.length > 1) {
        flags.push("ambiguous_email");
      } else if (anyone.length === 1) {
        app = anyone[0];
        method = "email";
        flags.length = 0;
      } else if (anyone.length > 1) {
        flags.push("ambiguous_email");
      } else {
        flags.push("no_candidate");
      }
    } else {
      flags.push("no_candidate");
    }
  }

  if (!app) {
    return { status: flags.includes("ambiguous_email") ? "needs_review" : "unmatched", method: null, application: null, flags };
  }

  // Sanity checks on a match, only meaningful for money coming in.
  if (i.eventType === "payment.succeeded") {
    if (i.amount !== null && i.amount !== FEES_PAISE[app.track]) flags.push("amount_mismatch");
    if (i.track !== null && i.track !== app.track) flags.push("track_mismatch");
    if (app.status === "paid") flags.push("already_paid");
  }

  return { status: flags.length ? "needs_review" : "matched", method, application: app, flags };
}
