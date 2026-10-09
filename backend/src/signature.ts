const enc = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export type SignatureResult = "ok" | "missing" | "stale" | "invalid";

/**
 * Verifies `X-GEvents-Signature: sha256=<hex>` = HMAC_SHA256(secret, `${timestamp}.${rawBody}`).
 * Any configured secret may match (supports rotation).
 */
export async function verifySignature(opts: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
  secrets: string[];
  windowSeconds: number;
  nowMs?: number;
}): Promise<SignatureResult> {
  const { rawBody, timestamp, signature, secrets, windowSeconds } = opts;
  if (!timestamp || !signature) return "missing";
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return "invalid";
  const nowSec = Math.floor((opts.nowMs ?? Date.now()) / 1000);
  if (Math.abs(nowSec - ts) > windowSeconds) return "stale";

  const given = signature.replace(/^sha256=/, "").toLowerCase();
  for (const secret of secrets) {
    if (safeEqual(await hmacHex(secret, `${timestamp}.${rawBody}`), given)) return "ok";
  }
  return "invalid";
}

export const signForTest = hmacHex;
