import { assert, assertEquals } from "@std/assert";
import { redactHeaders, signatureHints, truncate } from "./debuglog.ts";

Deno.test("redacts OUR credentials but keeps the webhook's own security headers", () => {
  const h = redactHeaders(new Headers({
    authorization: "Bearer secret", cookie: "gic_session=abc", "x-internal-token": "tok", "x-user-email": "a@b.co",
    "x-gevents-signature": "sha256=abc", "x-gevents-timestamp": "1790000000", "content-type": "application/json", "user-agent": "GEvents/1.0",
  }));
  for (const k of ["authorization", "cookie", "x-internal-token", "x-user-email"]) assertEquals(h[k], "[redacted]");
  assertEquals(h["x-gevents-signature"], "sha256=abc");
  assertEquals(h["x-gevents-timestamp"], "1790000000");
  assertEquals(h["user-agent"], "GEvents/1.0");
});

Deno.test("hints name the usual mistakes", () => {
  const now = 1_790_000_000;
  const hex64 = "a".repeat(64);
  assertEquals(signatureHints(String(now), `sha256=${hex64}`, now), []);
  assert(signatureHints(String(now * 1000), `sha256=${hex64}`, now).some((h) => h.includes("MILLISECONDS")));
  assert(signatureHints(String(now - 4000), `sha256=${hex64}`, now).some((h) => h.includes("away from now")));
  assert(signatureHints(String(now), "sha256=short", now).some((h) => h.includes("not 64 hex")));
  assert(signatureHints(String(now), hex64, now).some((h) => h.includes("no 'sha256=' prefix")));
  assert(signatureHints(null, null, now).length === 2);
  assert(signatureHints("12ab", `sha256=${hex64}`, now).some((h) => h.includes("not an integer")));
});

Deno.test("truncates huge bodies", () => {
  assertEquals(truncate("abc", 10), "abc");
  assert(truncate("x".repeat(100), 10).includes("[truncated 90 chars]"));
});
