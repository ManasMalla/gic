import { assertEquals, assertNotEquals } from "@std/assert";
import { decryptPaymentLink, encryptPaymentLink } from "./paylink.ts";

const KEY = "Z2ljLXRlc3Qta2V5LTAxMjM0NTY3ODlhYmNkZWYhISE="; // 32 bytes, base64 (test only)
const OTHER_KEY = btoa("another-test-key-0123456789abcd"); // also 32 bytes

// Produced by the website's real Node code (src/lib/paylink.ts) with iat=1790000000. If this ever fails,
// the website and the backend (and the PHP example given to CATs) no longer agree on the format.
const NODE_TOKEN = "v1.I4-CR28FM3IiDmnP.-JBu8vmhqAEiVYCJWXPvgCcR0xBCbz-Vu0yepq6SNUjjVrg5Pb4ZoecMhZLYPUSmRJRXUG8Lq5xnE1CUegfXLJRkihNYW5k";

Deno.test("decrypts a token produced by the website's Node code (cross-runtime compatibility)", async () => {
  const link = await decryptPaymentLink(NODE_TOKEN, KEY, { nowSec: 1790000100 });
  assertEquals(link, { email: "founder@example.com", track: "main", iat: 1790000000 });
});

Deno.test("round-trips and never puts the email in clear text", async () => {
  const t = await encryptPaymentLink({ email: "Lead@Example.com", track: "junior" }, KEY);
  assertEquals(t.includes("lead"), false);
  assertEquals(t.startsWith("v1."), true);
  const link = await decryptPaymentLink(t, KEY);
  assertEquals([link?.email, link?.track], ["lead@example.com", "junior"]);
});

Deno.test("every token is different (random IV)", async () => {
  const a = await encryptPaymentLink({ email: "a@b.co", track: "main" }, KEY);
  const b = await encryptPaymentLink({ email: "a@b.co", track: "main" }, KEY);
  assertNotEquals(a, b);
});

Deno.test("rejects tampering, wrong key, malformed input and expired tokens", async () => {
  const t = await encryptPaymentLink({ email: "a@b.co", track: "main" }, KEY, 1_000);
  const [v, iv, ct] = t.split(".");
  const flipped = ct.slice(0, -2) + (ct.endsWith("AA") ? "BB" : "AA");
  assertEquals(await decryptPaymentLink(`${v}.${iv}.${flipped}`, KEY), null);
  assertEquals(await decryptPaymentLink(t, OTHER_KEY), null);
  for (const bad of [undefined, null, 42, "", "v1", "v2.a.b", "garbage"]) assertEquals(await decryptPaymentLink(bad, KEY), null);
  assertEquals(await decryptPaymentLink(t, KEY, { maxAgeSeconds: 60, nowSec: 1_000 + 61 }), null);
  assertEquals((await decryptPaymentLink(t, KEY, { maxAgeSeconds: 60, nowSec: 1_000 + 59 }))?.email, "a@b.co");
});

// Produced by the website's real Node code WITH the optional pre-fill fields (name, mobile, organization, gender).
const NODE_TOKEN_WITH_PROFILE = "v1.hJ519ZWnSTBFB4y5.XOQOkcDI-41uozmG0qKkm3STQZ5LuHmQGzsoABRF8SD-UYguXqqjUg7quTF64UckqNIXuMihRWAhepZKeQQ1JT3Z6bthN5J45qxciQeSTxiWqGIYs-tLM3pkN9bIQYf8mN6eLSC-LiR39T_8vg6pjrTVKAjon-28I1xf1MjLTJtw9rcdK1-B";

Deno.test("decrypts the extended token (name, mobile, organization, gender) made by the website's Node code", async () => {
  const link = await decryptPaymentLink(NODE_TOKEN_WITH_PROFILE, KEY, { nowSec: 1790000100 });
  assertEquals(link, {
    email: "founder@example.com", track: "main", iat: 1790000000,
    name: "Test Person", mobile: "9876543210", organization: "Test School", gender: "male",
  });
});

Deno.test("older tokens without the optional fields still decrypt (no undefined keys added)", async () => {
  const link = await decryptPaymentLink(NODE_TOKEN, KEY, { nowSec: 1790000100 });
  assertEquals(Object.keys(link!).sort(), ["email", "iat", "track"]);
});

Deno.test("round-trips the profile fields and keeps them unreadable in the token", async () => {
  const t = await encryptPaymentLink({ email: "a@b.co", track: "junior", name: "Asha Test", mobile: "9000000000", organization: "Hill School", gender: "female" }, KEY);
  for (const secret of ["Asha", "9000000000", "Hill", "female", "a@b.co"]) assertEquals(t.includes(secret), false);
  assertEquals((await decryptPaymentLink(t, KEY))?.organization, "Hill School");
});
