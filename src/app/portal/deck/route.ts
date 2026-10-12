import { connection } from "next/server";
import { getSession } from "@/lib/auth/session";
import { backend } from "@/lib/backend";

/** The signed-in team's own pitch deck (owner or any listed member). The backend scopes it to the verified email. */
export async function GET() {
  await connection();
  const user = await getSession();
  if (!user) return new Response("Sign in first", { status: 401 });
  const res = await backend("/api/me/deck", user.email);
  if (!res.ok) return new Response("No deck", { status: 404 });
  return new Response(res.body, {
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": res.headers.get("content-disposition") ?? "attachment",
      "x-content-type-options": "nosniff", "cache-control": "private, no-store",
    },
  });
}
