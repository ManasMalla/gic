import "server-only";

/**
 * The public origin the browser used (https://gic.gitam.edu, a *.run.app URL, or localhost).
 * Cloud Run/LB sit in front of Next, so we trust forwarded headers, but only for origins in
 * APP_ALLOWED_ORIGINS (comma-separated) to rule out Host-header injection into the OAuth redirect URI.
 */
export function requestOrigin(req: Request): string {
  const h = req.headers;
  const url = new URL(req.url);
  const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() ?? url.protocol.replace(":", "");
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? url.host).split(",")[0].trim();
  const origin = `${proto}://${host}`;

  const allowed = (process.env.APP_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(origin)) throw new Error(`Origin not allowed: ${origin}`);
  return origin;
}

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next: string | null | undefined, fallback = "/register"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
