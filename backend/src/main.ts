import { dismissPayment, assignPayment, listPayments } from "./admin.ts";
import { createApplication, getApplicationStatus, getMyApplication, saveIdea } from "./applications.ts";
import { config } from "./config.ts";
import { migrate, sql } from "./db.ts";
import { json } from "./http.ts";
import { safeEqual } from "./signature.ts";
import { handleGeventsWebhook } from "./webhook.ts";

const bearer = (req: Request) => req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
const authed = (given: string, expected: string) => given.length > 0 && safeEqual(given, expected);

export async function route(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname: path } = url;
  const m = req.method;

  // NB: Cloud Run reserves /healthz on *.run.app URLs (Google answers it), so expose /api/health as well.
  if (path === "/healthz" || path === "/api/health") {
    await sql`select 1`;
    return json({ ok: true });
  }

  // Public, authenticated by HMAC signature inside the handler.
  if (m === "POST" && path === "/api/webhooks/gevents/payment") return handleGeventsWebhook(req);

  // Called only by our Next.js server. It has already verified the user's Google identity and passes
  // the verified email in `x-user-email`; the internal token proves the call really comes from our server.
  if (path.startsWith("/api/applications") || path.startsWith("/api/me/")) {
    if (!authed(req.headers.get("x-internal-token") ?? "", config.internalToken)) return json({ error: "unauthorized" }, 401);

    const mm = path.match(/^\/api\/applications\/([^/]+)$/);
    if (m === "GET" && mm) return getApplicationStatus(decodeURIComponent(mm[1]));

    const email = (req.headers.get("x-user-email") ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "user_required" }, 401);

    if (m === "POST" && path === "/api/applications") return createApplication(req, email);
    if (m === "GET" && path === "/api/me/application") return getMyApplication(email);
    if (m === "PUT" && path === "/api/me/idea") return saveIdea(req, email);
  }

  // Organisers.
  if (path.startsWith("/api/admin/")) {
    if (!authed(bearer(req), config.adminToken)) return json({ error: "unauthorized" }, 401);
    if (m === "GET" && path === "/api/admin/payments") return listPayments(url);
    const a = path.match(/^\/api\/admin\/payments\/([0-9a-f-]{36})\/(assign|dismiss)$/);
    if (m === "POST" && a) return a[2] === "assign" ? assignPayment(a[1], req) : dismissPayment(a[1], req);
  }

  return json({ error: "not_found" }, 404);
}

if (import.meta.main) {
  await migrate();
  Deno.serve({ port: config.port }, async (req) => {
    try {
      return await route(req);
    } catch (e) {
      console.error(JSON.stringify({ msg: "unhandled", error: String(e), stack: (e as Error).stack }));
      return json({ error: "internal" }, 500);
    }
  });
}
