import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";

// Chunked video upload, step "abort". Identity comes ONLY from the signed session cookie; the backend enforces the team and role.
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.text();
  if (body.length > 4000) return NextResponse.json({ error: "too_large" }, { status: 413 });
  const res = await backend("/api/me/video/abort", user.email, { method: "POST", headers: { "content-type": "application/json" }, body });
  const data = await res.json().catch(() => ({ error: "bad_gateway" }));
  return NextResponse.json(data, { status: res.status, headers: { "cache-control": "no-store" } });
}
