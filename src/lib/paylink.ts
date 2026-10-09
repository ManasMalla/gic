import { createCipheriv, randomBytes } from "node:crypto";

// Payment-link token. SERVER-ONLY: it reads PAYMENT_LINK_KEY. Never import this from a client component.
//
// Format (kept byte-for-byte compatible with backend/src/paylink.ts and the PHP example in the docs):
//   "v1." + base64url(iv[12]) + "." + base64url(ciphertext || authTag[16])
//   plaintext = JSON {"e": email, "t": track, "iat": unix seconds, optional "n": name, "m": mobile, "o": organization, "g": gender}
//   AAD = "gic-pay-v1"      AES-256-GCM
const AAD = Buffer.from("gic-pay-v1");

/** Optional details so GEvents can pre-fill its registration form. Not used for matching. */
export type PayerProfile = { name?: string; mobile?: string; organization?: string; gender?: string };

export function encryptPaymentLink(
  p: { email: string; track: "junior" | "main" } & PayerProfile,
  keyB64 = process.env.PAYMENT_LINK_KEY,
  nowSec = Math.floor(Date.now() / 1000),
): string {
  if (!keyB64) throw new Error("PAYMENT_LINK_KEY is not set");
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) throw new Error("PAYMENT_LINK_KEY must be 32 bytes (base64)");

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(AAD);
  const ct = Buffer.concat([
    cipher.update(
      JSON.stringify({
        e: p.email.trim().toLowerCase(), t: p.track, iat: nowSec,
        ...(p.name ? { n: p.name } : {}), ...(p.mobile ? { m: p.mobile } : {}),
        ...(p.organization ? { o: p.organization } : {}), ...(p.gender ? { g: p.gender } : {}),
      }),
      "utf8",
    ),
    cipher.final(),
    cipher.getAuthTag(), // WebCrypto/PHP expect the tag appended to the ciphertext
  ]);
  return `v1.${iv.toString("base64url")}.${ct.toString("base64url")}`;
}
