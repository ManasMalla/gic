import { tracks } from "@/content/tracks";
import { encryptPaymentLink } from "@/lib/paylink";

/**
 * Payment hand-off to GITAM GEvents.
 *
 * Our app owns the application (account, team, idea, files); GEvents only collects the fee and then calls our
 * webhook (see docs/gevents-payment-webhook.md). We do NOT send our reference. Instead the founder's email and the
 * track travel in ONE encrypted parameter, `data` (AES-256-GCM, see lib/paylink.ts), so no personal data sits in the
 * URL in clear text. GEvents pre-fills/keeps the founder email on its form and sends it back in the webhook
 * (`payer.email`), which is what we match on. GEvents may also echo `data` back (`registration.data`).
 *
 * Server-only (reads PAYMENT_LINK_KEY). When CATs support another hand-off, change ONLY this file.
 */
const DEFAULT_URL = "https://gevents.gitam.edu/registration/ODkyMg==";

export function paymentUrl(o?: { email: string; track: "junior" | "main" }): string {
  const url = new URL(process.env.GEVENTS_REGISTRATION_URL ?? DEFAULT_URL);
  if (o) url.searchParams.set("data", encryptPaymentLink(o));
  return url.toString();
}

export function feeFor(track: "junior" | "main"): number {
  return tracks.find((t) => t.id === track)!.fee;
}
