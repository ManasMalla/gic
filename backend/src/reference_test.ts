import { assertEquals, assertNotEquals } from "@std/assert";
import { generateReference, normalizeReference } from "./reference.ts";

Deno.test("generated references validate and are unique", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const r = generateReference();
    assertEquals(normalizeReference(r), r);
    seen.add(r);
  }
  assertEquals(seen.size, 500);
});

Deno.test("tolerates case, spaces, missing dashes and look-alike letters", () => {
  const r = generateReference();
  assertEquals(normalizeReference(r.toLowerCase()), r);
  assertEquals(normalizeReference(r.replaceAll("-", " ")), r);
  assertEquals(normalizeReference(r.replaceAll("-", "")), r);
});

Deno.test("rejects a single mistyped character (check digit)", () => {
  const r = generateReference();
  const body = r.split("-")[1];
  const alt = body[0] === "A" ? "B" : "A";
  const typo = r.replace(body, alt + body.slice(1));
  assertNotEquals(typo, r);
  assertEquals(normalizeReference(typo), null);
});

Deno.test("rejects junk", () => {
  for (const v of ["", "GIC26", "XYZ-12345678-A", null, 42, "GIC26-SHORT-X"]) assertEquals(normalizeReference(v), null);
});
