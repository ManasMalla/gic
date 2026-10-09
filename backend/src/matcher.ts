import { FEES_PAISE, type Track } from "./fees.ts";

export type AppRow = { id: string; reference: string; track: Track; status: "awaiting_payment" | "paid" | "refunded"; amountDue: number };

export type MatchInput = {
  eventType: "payment.succeeded" | "payment.failed" | "payment.refunded";
  /** Canonical reference if it was present AND passed the check digit; otherwise null. */
  reference: string | null;
  track: Track | null;
  amount: number | null;
  /** Application previously linked to the same GEvents transaction (used for refunds/failures). */
  byTransaction: AppRow | null;
  byReference: AppRow | null;
  /** Applications whose team includes the payer's email. */
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
  method: "reference" | "transaction" | "email" | null;
  application: AppRow | null;
  flags: Flag[];
};

/**
 * Pure decision logic, no I/O. Rules, strongest signal first:
 *  1. transaction id seen before (refunds follow the original payment)
 *  2. our reference (check digit verified)
 *  3. payer email + track + exact fee, only when exactly ONE awaiting-payment application fits
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
    flags.push(i.reference ? "reference_not_found" : "reference_invalid");
    if (i.eventType === "payment.succeeded") {
      const fits = i.byEmail.filter(
        (a) => a.status === "awaiting_payment" && (i.track === null || a.track === i.track) && a.amountDue === i.amount,
      );
      if (fits.length === 1) {
        app = fits[0];
        method = "email";
        // Matched without our reference: remove the "reference_*" flag, it is not a problem any more.
        flags.splice(0, flags.length);
      } else if (fits.length > 1) {
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
