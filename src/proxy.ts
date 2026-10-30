import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic gate: if there is no session cookie at all, send people to sign in before the page renders.
 * This is only a convenience. Real authorisation happens where data is read (server components /
 * actions call getSession(), and the backend scopes every query to the verified email).
 */
export function proxy(req: NextRequest) {
  if (req.cookies.has("gic_session")) return NextResponse.next();
  const next = req.nextUrl.pathname + req.nextUrl.search;
  return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(next)}`, req.url));
}

export const config = {
  matcher: [
    // Server Actions (form submissions, including the deck and video uploads) check the session themselves, so the gate skips
    // them: it would otherwise buffer the whole upload just to look at a cookie.
    { source: "/admin/:path*", missing: [{ type: "header", key: "next-action" }] },
    { source: "/portal/:path*", missing: [{ type: "header", key: "next-action" }] },
    "/register/payment",
    "/register/payment-status",
  ],
};
