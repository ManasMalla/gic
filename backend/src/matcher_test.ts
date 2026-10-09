import { assertEquals } from "@std/assert";
import { type AppRow, decide, type MatchInput } from "./matcher.ts";

const app = (o: Partial<AppRow> = {}): AppRow => ({ id: "a1", reference: "GIC26-AAAAAAAA-0", track: "junior", status: "awaiting_payment", amountDue: 49_900, ...o });
const input = (o: Partial<MatchInput> = {}): MatchInput => ({
  eventType: "payment.succeeded", reference: null, track: "junior", amount: 49_900,
  byTransaction: null, byReference: null, byEmail: [], ...o,
});

Deno.test("reference match with correct amount is a clean match", () => {
  const r = decide(input({ reference: "GIC26-AAAAAAAA-0", byReference: app() }));
  assertEquals([r.status, r.method, r.flags], ["matched", "reference", []]);
});

Deno.test("reference match but wrong amount needs review (never auto-pay)", () => {
  const r = decide(input({ reference: "x", byReference: app(), amount: 69_900 }));
  assertEquals(r.status, "needs_review");
  assertEquals(r.flags, ["amount_mismatch"]);
  assertEquals(r.application?.id, "a1");
});

Deno.test("track mismatch and already-paid are flagged", () => {
  assertEquals(decide(input({ byReference: app(), track: "main" })).flags, ["track_mismatch"]);
  assertEquals(decide(input({ byReference: app({ status: "paid" }) })).flags, ["already_paid"]);
});

Deno.test("no reference: exactly one awaiting application for the payer email matches", () => {
  const r = decide(input({ byEmail: [app()] }));
  assertEquals([r.status, r.method, r.flags], ["matched", "email", []]);
});

Deno.test("no reference: two candidate applications is ambiguous", () => {
  const r = decide(input({ byEmail: [app({ id: "a1" }), app({ id: "a2" })] }));
  assertEquals([r.status, r.application, r.flags], ["needs_review", null, ["reference_invalid", "ambiguous_email"]]);
});

Deno.test("no reference: already-paid or wrong-track applications are not candidates", () => {
  assertEquals(decide(input({ byEmail: [app({ status: "paid" })] })).status, "unmatched");
  assertEquals(decide(input({ byEmail: [app({ track: "main", amountDue: 69_900 })] })).status, "unmatched");
});

Deno.test("nothing found is unmatched, not an error", () => {
  const r = decide(input());
  assertEquals([r.status, r.application, r.flags], ["unmatched", null, ["reference_invalid", "no_candidate"]]);
});

Deno.test("refund follows the original transaction", () => {
  const r = decide(input({ eventType: "payment.refunded", byTransaction: app({ status: "paid" }), amount: 49_900 }));
  assertEquals([r.status, r.method], ["matched", "transaction"]);
});

Deno.test("failed payment never matches by email guess", () => {
  assertEquals(decide(input({ eventType: "payment.failed", byEmail: [app()] })).status, "unmatched");
});
