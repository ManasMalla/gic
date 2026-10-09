import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { requireEnv } from "./env";

export const SESSION_COOKIE = "gic_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = { email: string; name: string; picture?: string };

const key = () => {
  const secret = requireEnv("SESSION_SECRET");
  if (secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
};

/** Signed (HS256) session token. Contains only identity, never anything the user could escalate. */
export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ name: user.name, picture: user.picture })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email.toLowerCase())
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key());
}

export function sessionCookieOptions(secure: boolean) {
  return { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge: MAX_AGE_SECONDS };
}

/** Reads the current user. Must run behind <Suspense> (it reads cookies at request time). */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { email: payload.sub, name: String(payload.name ?? payload.sub), picture: payload.picture ? String(payload.picture) : undefined };
  } catch {
    return null; // expired, tampered, or signed with an old secret
  }
}

/** Short-lived cookie that carries OAuth state/nonce/PKCE verifier between the redirect and the callback. */
export const OAUTH_COOKIE = "gic_oauth";
export async function signOAuthState(v: { state: string; nonce: string; verifier: string; next: string }) {
  return new SignJWT(v).setProtectedHeader({ alg: "HS256" }).setExpirationTime("10m").sign(key());
}
export async function readOAuthState(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload as unknown as { state: string; nonce: string; verifier: string; next: string };
  } catch {
    return null;
  }
}
