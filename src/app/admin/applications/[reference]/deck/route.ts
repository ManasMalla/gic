import { connection } from "next/server";
import { getSession } from "@/lib/auth/session";
import { backend } from "@/lib/backend";

/** Streams a team's pitch deck to signed-in staff. The backend enforces the role (403 otherwise). */
export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  await connection();
  const user = await getSession();
  if (!user) return new Response("Sign in first", { status: 401 });
  const { reference } = await params;
  const res = await backend(`/api/staff/applications/${encodeURIComponent(reference)}/deck`, user.email);
  if (!res.ok) return new Response(res.status === 404 ? "No deck" : "Not allowed", { status: res.status === 404 ? 404 : 403 });
  return new Response(res.body, {
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": res.headers.get("content-disposition") ?? "attachment",
      "x-content-type-options": "nosniff", "cache-control": "private, no-store",
    },
  });
}
