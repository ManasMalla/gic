import { tracks } from "@/content/tracks";

/**
 * Payment hand-off to GITAM GEvents.
 *
 * Our app owns the application (account, team, idea, files); GEvents only collects the fee and then
 * calls our webhook (see docs/gevents-payment-webhook.md). We pass our reference (and track) in the URL
 * so GEvents can echo it back. Until CATs support `ref`, the page ignores the extra parameters (harmless)
 * and we also show the reference so the team can quote it.
 */
const DEFAULT_URL = "https://gevents.gitam.edu/registration/ODkyMg==";

export function paymentUrl(o?: { reference: string; track: "junior" | "main" }): string {
  const url = new URL(process.env.GEVENTS_REGISTRATION_URL ?? DEFAULT_URL);
  if (o) {
    url.searchParams.set("ref", o.reference);
    url.searchParams.set("track", o.track);
  }
  return url.toString();
}

export function feeFor(track: "junior" | "main"): number {
  return tracks.find((t) => t.id === track)!.fee;
}
