import { assertEquals } from "@std/assert";
import { type AppRow, decide, type MatchInput } from "./matcher.ts";

const app = (o: Partial<AppRow> = {}): AppRow => ({ id: "a1", reference: "GIC26-AAAAAAAA-0", track: "junior", status: "awaiting_payment", amountDue: 49_900, ...o });
const input = (o: Partial<MatchInput> = {}): MatchInput => ({
  eventType: "payment.succeeded", referenceProvided: false, reference: null, track: "junior", amount: 49_900,
  byTransaction: null, byReference: null, byFounderEmail: [], byEmail: [], ...o,
});

Deno.test("reference match with correct amount is a clean match", () => {
  const r = decide(input({ referenceProvided: true, reference: "GIC26-AAAAAAAA-0", byReference: app() }));
  assertEquals([r.status, r.method, r.flags], ["matched", "reference", []]);
});

Deno.test("reference match but wrong amount needs review (never auto-pay)", () => {
  const r = decide(input({ referenceProvided: true, reference: "x", byReference: app(), amount: 69_900 }));
  assertEquals(r.status, "needs_review");
  assertEquals(r.flags, ["amount_mismatch"]);
  assertEquals(r.application?.id, "a1");
});

Deno.test("track mismatch and already-paid are flagged", () => {
  assertEquals(decide(input({ byReference: app(), track: "main" })).flags, ["track_mismatch"]);
  assertEquals(decide(input({ byReference: app({ status: "paid" }) })).flags, ["already_paid"]);
});

Deno.test("no reference needed: the founder's email + track + fee matches exactly one application", () => {
  const r = decide(input({ byFounderEmail: [app()], byEmail: [app()] }));
  assertEquals([r.status, r.method, r.flags], ["matched", "founder_email", []]);
});

Deno.test("a founder match beats a teammate match on another application", () => {
  const r = decide(input({ byFounderEmail: [app({ id: "a1" })], byEmail: [app({ id: "a1" }), app({ id: "a2" })] }));
  assertEquals([r.status, r.method, r.application?.id], ["matched", "founder_email", "a1"]);
});

Deno.test("falls back to any team member's email when no founder matches", () => {
  const r = decide(input({ byEmail: [app()] }));
  assertEquals([r.status, r.method, r.flags], ["matched", "email", []]);
});

Deno.test("two applications share the founder email: needs review, never guesses", () => {
  const r = decide(input({ byFounderEmail: [app({ id: "a1" }), app({ id: "a2" })] }));
  assertEquals([r.status, r.application, r.flags], ["needs_review", null, ["ambiguous_email"]]);
});

Deno.test("two teammates' applications for the same email is ambiguous", () => {
  const r = decide(input({ byEmail: [app({ id: "a1" }), app({ id: "a2" })] }));
  assertEquals([r.status, r.application, r.flags], ["needs_review", null, ["ambiguous_email"]]);
});

Deno.test("already-paid or wrong-track applications are not candidates", () => {
  assertEquals(decide(input({ byFounderEmail: [app({ status: "paid" })] })).status, "unmatched");
  assertEquals(decide(input({ byFounderEmail: [app({ track: "main", amountDue: 69_900 })] })).status, "unmatched");
});

Deno.test("an unknown track in the payload does not block an email match", () => {
  assertEquals(decide(input({ track: null, byFounderEmail: [app()] })).method, "founder_email");
});

Deno.test("nothing found is unmatched, not an error", () => {
  const r = decide(input());
  assertEquals([r.status, r.application, r.flags], ["unmatched", null, ["no_candidate"]]);
});

Deno.test("refund follows the original transaction", () => {
  const r = decide(input({ eventType: "payment.refunded", byTransaction: app({ status: "paid" }), amount: 49_900 }));
  assertEquals([r.status, r.method], ["matched", "transaction"]);
});

Deno.test("failed payment never matches by email guess", () => {
  assertEquals(decide(input({ eventType: "payment.failed", byFounderEmail: [app()], byEmail: [app()] })).status, "unmatched");
});

Deno.test("a reference that was sent but is malformed/unknown is still flagged when nothing else matches", () => {
  assertEquals(decide(input({ referenceProvided: true, reference: null })).flags, ["reference_invalid", "no_candidate"]);
  assertEquals(decide(input({ referenceProvided: true, reference: "GIC26-AAAAAAAA-0" })).flags, ["reference_not_found", "no_candidate"]);
});
