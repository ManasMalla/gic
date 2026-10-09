import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/auth/origin";
import { SESSION_COOKIE } from "@/lib/auth/session";

// POST only (a form button), so a stray link/prefetch can't sign someone out.
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", requestOrigin(req)), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
