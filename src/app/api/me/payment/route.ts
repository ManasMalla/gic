import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";

// Used by the payment-status page to see whether this account paid before it registered a team. Identity comes ONLY from the session cookie.
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const res = await backend("/api/me/payment", user.email);
  const body = await res.json().catch(() => ({ error: "bad_gateway" }));
  return NextResponse.json(body, { status: res.status, headers: { "cache-control": "no-store" } });
}
