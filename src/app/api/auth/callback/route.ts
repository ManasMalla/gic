import { connection, NextResponse } from "next/server";
import { exchangeAndVerify } from "@/lib/auth/google";
import { requestOrigin, safeNext } from "@/lib/auth/origin";
import { OAUTH_COOKIE, readOAuthState, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

export async function GET(req: Request) {
  await connection(); // always run at request time: never prerender at build (env flags/cookies must be read live)
  const origin = requestOrigin(req);
  const url = new URL(req.url);
  const fail = (reason: string) => {
    const r = NextResponse.redirect(new URL(`/signin?error=${reason}`, origin));
    r.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
    return r;
  };

  if (url.searchParams.get("error")) return fail("cancelled");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = req.headers.get("cookie")?.split(/;\s*/).find((c) => c.startsWith(`${OAUTH_COOKIE}=`))?.slice(OAUTH_COOKIE.length + 1);
  const saved = await readOAuthState(cookie);
  if (!code || !state || !saved || saved.state !== state) return fail("state");

  try {
    const user = await exchangeAndVerify({ origin, code, verifier: saved.verifier, nonce: saved.nonce });
    const res = NextResponse.redirect(new URL(safeNext(saved.next), origin));
    res.cookies.set(SESSION_COOKIE, await signSession(user), sessionCookieOptions(origin.startsWith("https:")));
    res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
    return res;
  } catch (e) {
    console.error("google sign-in failed:", (e as Error).message); // never log tokens
    return fail("failed");
  }
}
