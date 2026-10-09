import { assertEquals } from "@std/assert";
import { signForTest, verifySignature } from "./signature.ts";

const secret = "s3cret";
const body = JSON.stringify({ hello: "world" });
const now = 1_800_000_000_000;
const ts = String(Math.floor(now / 1000));
const base = { rawBody: body, secrets: [secret], windowSeconds: 300, nowMs: now };

Deno.test("accepts a correct signature", async () => {
  const sig = "sha256=" + await signForTest(secret, `${ts}.${body}`);
  assertEquals(await verifySignature({ ...base, timestamp: ts, signature: sig }), "ok");
});

Deno.test("accepts any secret during rotation", async () => {
  const sig = "sha256=" + await signForTest("old", `${ts}.${body}`);
  assertEquals(await verifySignature({ ...base, secrets: [secret, "old"], timestamp: ts, signature: sig }), "ok");
});

Deno.test("rejects tampered body, wrong secret, missing headers, stale timestamp", async () => {
  const good = "sha256=" + await signForTest(secret, `${ts}.${body}`);
  assertEquals(await verifySignature({ ...base, rawBody: body + " ", timestamp: ts, signature: good }), "invalid");
  const bad = "sha256=" + await signForTest("nope", `${ts}.${body}`);
  assertEquals(await verifySignature({ ...base, timestamp: ts, signature: bad }), "invalid");
  assertEquals(await verifySignature({ ...base, timestamp: null, signature: good }), "missing");
  const oldTs = String(Math.floor(now / 1000) - 301);
  const oldSig = "sha256=" + await signForTest(secret, `${oldTs}.${body}`);
  assertEquals(await verifySignature({ ...base, timestamp: oldTs, signature: oldSig }), "stale");
});
