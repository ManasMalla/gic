import { assertEquals } from "@std/assert";
import { diagnoseSignature, signForTest, verifySignature } from "./signature.ts";

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

Deno.test("diagnoseSignature names the mistake that WOULD have produced the received signature", async () => {
  const mk = async (msg: string) => "sha256=" + await signForTest(secret, msg);
  const common = { rawBody: body, timestamp: ts, secrets: [secret] };
  assertEquals((await diagnoseSignature({ ...common, signature: await mk(body) })).join("|").includes("body only"), true);
  assertEquals((await diagnoseSignature({ ...common, signature: await mk(ts + body) })).join("|").includes("no dot"), true);
  assertEquals((await diagnoseSignature({ ...common, signature: await mk(`${ts}.${body}\n`) })).join("|").includes("trailing newline"), true);
  // the PHP json_encode "\/" escaping mistake
  const slashBody = JSON.stringify({ url: "https://x.y/z" });
  const phpSig = "sha256=" + await signForTest(secret, `${ts}.${slashBody.replaceAll("/", "\\/")}`);
  assertEquals((await diagnoseSignature({ rawBody: slashBody, timestamp: ts, signature: phpSig, secrets: [secret] })).join("|").includes("PHP json_encode"), true);
  // a secret with a stray newline on the sender's side
  const strayNl = "sha256=" + await signForTest(secret + "\n", `${ts}.${body}`);
  assertEquals((await diagnoseSignature({ ...common, signature: strayNl })).join("|").includes("stray whitespace"), true);
});

Deno.test("diagnoseSignature returns nothing for a different secret (and never leaks it)", async () => {
  const sig = "sha256=" + await signForTest("some-other-secret", `${ts}.${body}`);
  assertEquals(await diagnoseSignature({ rawBody: body, timestamp: ts, signature: sig, secrets: [secret] }), []);
  assertEquals(await diagnoseSignature({ rawBody: body, timestamp: null, signature: null, secrets: [secret] }), []);
});
