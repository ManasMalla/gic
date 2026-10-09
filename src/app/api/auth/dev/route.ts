import { connection, NextResponse } from "next/server";
import { devLoginEnabled } from "@/lib/auth/env";
import { requestOrigin, safeNext } from "@/lib/auth/origin";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

// Local testing only. See devLoginEnabled(): never available on Cloud Run.
export async function GET(req: Request) {
  await connection(); // always run at request time: never prerender at build (env flags/cookies must be read live)
  if (!devLoginEnabled()) return new NextResponse("Not found", { status: 404 });
  const origin = requestOrigin(req);
  const p = new URL(req.url).searchParams;
  const email = (p.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.redirect(new URL("/signin?error=email", origin));
  const res = NextResponse.redirect(new URL(safeNext(p.get("next")), origin));
  res.cookies.set(SESSION_COOKIE, await signSession({ email, name: email.split("@")[0] }), sessionCookieOptions(origin.startsWith("https:")));
  return res;
}
