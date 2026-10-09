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

async function hmacBase64(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message)))));
}

/**
 * For a signature that failed verification: which common construction mistakes WOULD have produced the signature we
 * received? Returns human-readable names only (never secrets or computed signatures). Empty = none match, which
 * usually means GEvents is signing with a different secret. Diagnostic only: these variants are never accepted.
 */
export async function diagnoseSignature(o: { rawBody: string; timestamp: string | null; signature: string | null; secrets: string[] }): Promise<string[]> {
  if (!o.timestamp || !o.signature) return [];
  const given = o.signature.replace(/^sha256=/i, "").trim();
  const ts = o.timestamp, body = o.rawBody;
  const inputs: Record<string, string> = {
    "signed the body only (no timestamp prefix)": body,
    "signed timestamp+body (no dot)": `${ts}${body}`,
    "signed timestamp:body (colon)": `${ts}:${body}`,
    "signed body.timestamp (reversed)": `${body}.${ts}`,
    "signed timestamp.body plus a trailing newline": `${ts}.${body}\n`,
    "signed body plus a trailing newline": `${body}\n`,
    "signed a body with '/' escaped as '\\/' (PHP json_encode default)": `${ts}.${body.replaceAll("/", "\\/")}`,
    "signed the spec string (timestamp.body)": `${ts}.${body}`,
  };
  const keys = [...new Set(o.secrets.flatMap((k) => [k, k.trim(), `${k}\n`]))];
  const hits = new Set<string>();
  for (const [name, msg] of Object.entries(inputs)) {
    for (const k of keys) {
      const stray = k !== o.secrets.find((s) => s === k) ? " (secret had stray whitespace)" : "";
      if (safeEqual(await hmacHex(k, msg), given.toLowerCase())) hits.add(name + stray);
      if (safeEqual(await hmacBase64(k, msg), given)) hits.add(`${name} (digest sent as BASE64 instead of hex)${stray}`);
    }
  }
  return [...hits];
}
