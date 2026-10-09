// Payment-link token: AES-256-GCM over {email, track, iat}. It travels in the GEvents URL as `data=<token>`
// so the founder's email is never in the URL in clear text. The same format is implemented in the website
// (src/lib/paylink.ts, Node) and documented for CATs (docs/gevents-payment-webhook.md, PHP example).
//
//   token  = "v1." + base64url(iv[12]) + "." + base64url(ciphertext || tag[16])
//   plaintext = JSON {"e": "<email>", "t": "junior"|"main", "iat": <unix seconds>}
//   AAD    = "gic-pay-v1"      key = 32 random bytes, shared secret (standard base64 in env PAYMENT_LINK_KEY)
import type { Track } from "./fees.ts";

const enc = new TextEncoder();
const dec = new TextDecoder();
const AAD = enc.encode("gic-pay-v1");

const toB64Url = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const fromB64Url = (s: string) => {
  const b = atob(s.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};

function importKey(keyB64: string, usage: KeyUsage) {
  const raw = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  if (raw.length !== 32) throw new Error("PAYMENT_LINK_KEY must be 32 bytes (base64)");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [usage]);
}

export type PaymentLink = { email: string; track: Track; iat: number };

export async function encryptPaymentLink(p: { email: string; track: Track }, keyB64: string, nowSec = Math.floor(Date.now() / 1000)): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = enc.encode(JSON.stringify({ e: p.email.trim().toLowerCase(), t: p.track, iat: nowSec }));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: AAD }, await importKey(keyB64, "encrypt"), plain));
  return `v1.${toB64Url(iv)}.${toB64Url(ct)}`;
}

/** Returns null for anything malformed, tampered with, made with another key, or older than maxAgeSeconds. */
export async function decryptPaymentLink(
  token: unknown,
  keyB64: string,
  opts: { maxAgeSeconds?: number; nowSec?: number } = {},
): Promise<PaymentLink | null> {
  if (typeof token !== "string") return null;
  const [v, iv, ct] = token.split(".");
  if (v !== "v1" || !iv || !ct) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64Url(iv), additionalData: AAD },
      await importKey(keyB64, "decrypt"),
      fromB64Url(ct),
    );
    const o = JSON.parse(dec.decode(plain)) as { e?: unknown; t?: unknown; iat?: unknown };
    if (typeof o.e !== "string" || (o.t !== "junior" && o.t !== "main") || typeof o.iat !== "number") return null;
    const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
    if (opts.maxAgeSeconds && now - o.iat > opts.maxAgeSeconds) return null;
    return { email: o.e.toLowerCase(), track: o.t, iat: o.iat };
  } catch {
    return null;
  }
}
