import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";

// Polled by the payment-status page. Identity comes ONLY from the signed session cookie.
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const res = await backend("/api/me/application", user.email);
  const body = await res.json().catch(() => ({ error: "bad_gateway" }));
  return NextResponse.json(body, { status: res.status, headers: { "cache-control": "no-store" } });
}
