import { NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";

const MAX_PART_BYTES = 9 * 1024 * 1024; // the browser sends parts of 8 MB; anything much bigger is not ours

// One part of a chunked video upload (raw bytes). Each request stays far below Cloud Run's ~32 MiB request limit.
export async function PUT(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_PART_BYTES) return NextResponse.json({ error: "bad_part_size" }, { status: 413 });
  const bytes = await req.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_PART_BYTES) return NextResponse.json({ error: "bad_part_size" }, { status: 413 });
  const query = new URL(req.url).search;
  const res = await backend(`/api/me/video/part${query}`, user.email, { method: "PUT", body: bytes });
  const data = await res.json().catch(() => ({ error: "bad_gateway" }));
  return NextResponse.json(data, { status: res.status, headers: { "cache-control": "no-store" } });
}
