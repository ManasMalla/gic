import { tracks } from "@/content/tracks";
import { encryptPaymentLink, type PayerProfile } from "@/lib/paylink";

/**
 * Payment hand-off to GITAM GEvents.
 *
 * Our app owns the application (account, team, idea, files); GEvents only collects the fee and then calls our
 * webhook (see docs/gevents-payment-webhook.md). We do NOT send our reference. Instead the founder's email and the
 * track travel in ONE encrypted parameter, `data` (AES-256-GCM, see lib/paylink.ts), so no personal data sits in the
 * URL in clear text. The token also carries the lead's name, mobile, organization (institution) and gender so GEvents can
 * pre-fill its form. GEvents keeps the founder email on its form and sends it back in the webhook
 * (`payer.email`), which is what we match on. GEvents may also echo `data` back (`registration.data`).
 *
 * Server-only (reads PAYMENT_LINK_KEY). When CATs support another hand-off, change ONLY this file.
 */
const DEFAULT_URL = "https://gevents.gitam.edu/registration/ODkyMg==";

/**
 * GEvents' own form limits (read from its page): name <= 50 chars, organization <= 100 chars, mobile = digits only.
 * Our form allows longer values, so the pre-fill copy inside the token is fitted to what GEvents will accept.
 * (GEvents also strips non letters/spaces from name and organization itself; we do not rewrite those characters.)
 */
const fit = (v: string | undefined, max: number) => v?.trim().slice(0, max).trim() || undefined;

export function paymentUrl(o?: { email: string; track: "junior" | "main" } & PayerProfile): string {
  const url = new URL(process.env.GEVENTS_REGISTRATION_URL ?? DEFAULT_URL);
  if (o) {
    url.searchParams.set(
      "data",
      encryptPaymentLink({
        ...o,
        name: fit(o.name, 50),
        organization: fit(o.organization, 100),
        mobile: o.mobile?.replace(/\D/g, "") || undefined,
      }),
    );
  }
  return url.toString();
}

export function feeFor(track: "junior" | "main"): number {
  return tracks.find((t) => t.id === track)!.fee;
}
