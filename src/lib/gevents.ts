import { tracks } from "@/content/tracks";

/**
 * Payment hand-off to GITAM GEvents.
 *
 * Our app owns the application (team, idea, files, accounts); GEvents only
 * collects the registration fee. The GEvents registration page takes no
 * prefilled data today, so we send people to it and show them their GIC
 * application reference to quote. When the GEvents team exposes a callback /
 * deep-link contract, change ONLY this file.
 */
const DEFAULT_URL = "https://gevents.gitam.edu/registration/ODkyMg==";

export function paymentUrl(): string {
  return process.env.GEVENTS_REGISTRATION_URL ?? DEFAULT_URL;
}

export function feeFor(track: "junior" | "main"): number {
  return tracks.find((t) => t.id === track)!.fee;
}
