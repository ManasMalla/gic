import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { requireEnv } from "./env";

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const b64url = (buf: ArrayBuffer | Uint8Array) => Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).toString("base64url");

export const randomToken = (bytes = 32) => b64url(crypto.getRandomValues(new Uint8Array(bytes)));
export async function pkceChallenge(verifier: string) {
  return b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
}

export const redirectUri = (origin: string) => `${origin}/api/auth/callback`;

export function buildAuthUrl(o: { origin: string; state: string; nonce: string; challenge: string }) {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: redirectUri(o.origin),
    response_type: "code",
    scope: "openid email profile",
    state: o.state,
    nonce: o.nonce,
    code_challenge: o.challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return u.toString();
}

export type GoogleProfile = { email: string; name: string; picture?: string };

/** Exchanges the auth code, then verifies the ID token's signature, issuer, audience, expiry and nonce. */
export async function exchangeAndVerify(o: { origin: string; code: string; verifier: string; nonce: string }): Promise<GoogleProfile> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: o.code,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: redirectUri(o.origin),
      grant_type: "authorization_code",
      code_verifier: o.verifier,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token exchange failed (${res.status})`);
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("no id_token in response");

  const { payload } = await jwtVerify(id_token, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: requireEnv("GOOGLE_CLIENT_ID"),
  });
  if (payload.nonce !== o.nonce) throw new Error("nonce mismatch");
  if (payload.email_verified !== true || typeof payload.email !== "string") throw new Error("email not verified");
  return { email: payload.email.toLowerCase(), name: String(payload.name ?? payload.email), picture: typeof payload.picture === "string" ? payload.picture : undefined };
}
