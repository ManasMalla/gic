// Debug logging for the GEvents webhook: what actually hit us, so integration problems with CATs can be
// diagnosed from Cloud Logging alone. Headers carrying OUR credentials are redacted; the webhook's own
// signature headers are logged on purpose (the signature is derived from the secret, it is not the secret).
const REDACT = new Set(["authorization", "cookie", "x-internal-token", "x-user-email", "proxy-authorization"]);
const MAX_BODY = 16 * 1024;

export function redactHeaders(h: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  h.forEach((v, k) => {
    out[k.toLowerCase()] = REDACT.has(k.toLowerCase()) ? "[redacted]" : v;
  });
  return out;
}

export async function sha256Hex(s: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return Array.from(d, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Human hints about the usual ways a signature header goes wrong. */
export function signatureHints(timestamp: string | null, signature: string | null, nowSec = Math.floor(Date.now() / 1000)): string[] {
  const hints: string[] = [];
  if (!timestamp) hints.push("missing x-gevents-timestamp");
  else if (!/^\d+$/.test(timestamp)) hints.push("timestamp is not an integer");
  else if (timestamp.length >= 13) hints.push("timestamp looks like MILLISECONDS; expected unix SECONDS");
  else if (Math.abs(nowSec - Number(timestamp)) > 300) hints.push(`timestamp is ${nowSec - Number(timestamp)}s away from now (window is 300s); check server clock`);
  if (!signature) hints.push("missing x-gevents-signature");
  else {
    const hex = signature.replace(/^sha256=/, "");
    if (!signature.startsWith("sha256=")) hints.push("signature has no 'sha256=' prefix (accepted, but check intent)");
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) hints.push(`signature is not 64 hex chars (got ${hex.length} chars)`);
  }
  return hints;
}

export function truncate(s: string, max = MAX_BODY): string {
  return s.length > max ? `${s.slice(0, max)}…[truncated ${s.length - max} chars]` : s;
}
