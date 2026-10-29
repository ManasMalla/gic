import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";

// Identity comes ONLY from the signed session cookie. A JSON body is required, so a cross-site form can't trigger the PUT.
async function proxy(method: "GET" | "PUT", body?: string) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const res = await backend("/api/me/referral", user.email, { method, ...(body ? { headers: { "content-type": "application/json" }, body } : {}) });
  const data = await res.json().catch(() => ({ error: "bad_gateway" }));
  return NextResponse.json(data, { status: res.status, headers: { "cache-control": "no-store" } });
}

export const GET = () => proxy("GET");

export async function PUT(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "json_required" }, { status: 415 });
  const body = await req.text();
  if (body.length > 200) return NextResponse.json({ error: "too_large" }, { status: 413 });
  return proxy("PUT", body);
}
