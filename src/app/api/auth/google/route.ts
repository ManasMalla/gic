import { connection, NextResponse } from "next/server";
import { googleConfigured } from "@/lib/auth/env";
import { buildAuthUrl, pkceChallenge, randomToken } from "@/lib/auth/google";
import { requestOrigin, safeNext } from "@/lib/auth/origin";
import { OAUTH_COOKIE, signOAuthState } from "@/lib/auth/session";

export async function GET(req: Request) {
  await connection(); // always run at request time: never prerender at build (env flags/cookies must be read live)
  const origin = requestOrigin(req);
  const next = safeNext(new URL(req.url).searchParams.get("next"));
  if (!googleConfigured()) return NextResponse.redirect(new URL(`/signin?error=not_configured&next=${encodeURIComponent(next)}`, origin));

  const state = randomToken(), nonce = randomToken(), verifier = randomToken(48);
  const res = NextResponse.redirect(buildAuthUrl({ origin, state, nonce, challenge: await pkceChallenge(verifier) }));
  res.cookies.set(OAUTH_COOKIE, await signOAuthState({ state, nonce, verifier, next }), {
    httpOnly: true, sameSite: "lax", secure: origin.startsWith("https:"), path: "/api/auth", maxAge: 600,
  });
  return res;
}
