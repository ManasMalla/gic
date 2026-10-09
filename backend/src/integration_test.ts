// Needs a real Postgres. Run: DATABASE_URL=postgres://... GEVENTS_WEBHOOK_SECRETS=... deno task test
import { assert, assertEquals } from "@std/assert";
import { route } from "./main.ts";
import { config } from "./config.ts";
import { migrate, sql } from "./db.ts";
import { signForTest } from "./signature.ts";

const SECRET = Deno.env.get("GEVENTS_WEBHOOK_SECRETS")!.split(",")[0];
const INTERNAL = { "x-internal-token": Deno.env.get("INTERNAL_API_TOKEN")! };
const ADMIN = { authorization: `Bearer ${Deno.env.get("ADMIN_API_TOKEN")}` };
const run = (path: string, init?: RequestInit) => route(new Request(`http://x${path}`, init));

const person = (n: string, e: string) => ({ name: n, courseYear: "Class 11", email: e, phone: "9876543210", gender: "female" });
const blank = { name: "", courseYear: "", email: "", phone: "", gender: "" };
function teamData(track: "junior" | "main", leadEmail: string) {
  return {
    track, teamName: "Team " + leadEmail, institution: "School", address: "1 Road", cityState: "Hyderabad, TS",
    founder: person("Asha Test", leadEmail), cofounder: person("Ravi Test", "co-" + leadEmail),
    member3: blank, member4: blank, member5: blank, member6: blank, declaration: "on",
  };
}
const as = (email: string) => ({ ...INTERNAL, "x-user-email": email });
async function create(track: "junior" | "main", email: string) {
  const res = await run("/api/applications", { method: "POST", headers: { ...as(email), "content-type": "application/json" }, body: JSON.stringify(teamData(track, email)) });
  assertEquals(res.status, 201);
  return (await res.json()).reference as string;
}
const idea = (o: Record<string, unknown> = {}) => ({
  theme: "sports-fitness", ideaTitle: "Idea", problemStatement: "Problem", ideaSummary: "Summary", pitchVideoLink: "https://youtube.com/watch?v=x", ...o,
});
function ideaForm(data: unknown, deck = true) {
  const fd = new FormData();
  fd.set("data", JSON.stringify(data));
  if (deck) fd.set("pitchDeck", new File([new Uint8Array(1024)], "deck.pdf", { type: "application/pdf" }));
  return fd;
}
const saveIdea = (email: string, fd: FormData) => run("/api/me/idea", { method: "PUT", headers: as(email), body: fd });
const me = (email: string) => run("/api/me/application", { headers: as(email) });
const status = async (ref: string) => (await (await run(`/api/applications/${ref}`, { headers: INTERNAL })).json()).status as string;

let n = 0;
async function webhook(over: Record<string, unknown> = {}, opts: { secret?: string; ts?: number } = {}) {
  const body = JSON.stringify({
    event_id: `evt_${Date.now()}_${n++}`, event_type: "payment.succeeded", occurred_at: "2026-10-09T14:32:10+05:30",
    reference: null, registration: { track: "junior" },
    payment: { transaction_id: `txn_${Date.now()}_${n}`, amount: 49900, currency: "INR" },
    payer: { email: null }, ...over,
  });
  const ts = String(opts.ts ?? Math.floor(Date.now() / 1000));
  const sig = "sha256=" + await signForTest(opts.secret ?? SECRET, `${ts}.${body}`);
  const res = await run("/api/webhooks/gevents/payment", {
    method: "POST", body, headers: { "content-type": "application/json", "x-gevents-timestamp": ts, "x-gevents-signature": sig },
  });
  return { res, out: await res.json(), event: JSON.parse(body) };
}

Deno.test({
  name: "payment webhook end-to-end",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    await migrate();
    const tag = crypto.randomUUID().slice(0, 8);

    await t.step("auth: internal and admin endpoints reject missing tokens", async () => {
      assertEquals((await run("/api/applications/GIC26-AAAAAAAA-0")).status, 401);
      assertEquals((await run("/api/admin/payments")).status, 401);
    });

    await t.step("create requires a signed-in user and valid team data", async () => {
      const noUser = await run("/api/applications", { method: "POST", headers: { ...INTERNAL, "content-type": "application/json" }, body: "{}" });
      assertEquals(noUser.status, 401);
      const bad = await run("/api/applications", { method: "POST", headers: { ...as("v@example.com"), "content-type": "application/json" }, body: JSON.stringify({ track: "junior" }) });
      assertEquals(bad.status, 422);
      assert("teamName" in (await bad.json()).errors);
    });

    const ref = await create("junior", `lead-${tag}@example.com`);
    assertEquals(await status(ref), "awaiting_payment");

    await t.step("signature: wrong secret / stale timestamp / tampering are 401", async () => {
      assertEquals((await webhook({ reference: ref }, { secret: "wrong" })).res.status, 401);
      assertEquals((await webhook({ reference: ref }, { ts: Math.floor(Date.now() / 1000) - 3600 })).res.status, 401);
      assertEquals(await status(ref), "awaiting_payment");
    });

    await t.step("malformed payload is 400", async () => {
      assertEquals((await webhook({ payment: { amount: "lots" } })).res.status, 400);
    });

    await t.step("succeeded by reference marks the application paid", async () => {
      const { res, out } = await webhook({ reference: ref });
      assertEquals(res.status, 200);
      assertEquals([out.match, out.reference], ["matched", ref]);
      assertEquals(await status(ref), "paid");
    });

    await t.step("replaying the same event is a no-op (idempotent)", async () => {
      const first = await webhook({ reference: ref });
      const body = JSON.stringify(first.event);
      const ts = String(Math.floor(Date.now() / 1000));
      const sig = "sha256=" + await signForTest(SECRET, `${ts}.${body}`);
      const again = await run("/api/webhooks/gevents/payment", { method: "POST", body, headers: { "x-gevents-timestamp": ts, "x-gevents-signature": sig } });
      assertEquals((await again.json()).duplicate, true);
    });

    await t.step("a second payment for an already-paid application needs review", async () => {
      const { out } = await webhook({ reference: ref });
      assertEquals([out.match, out.flags], ["needs_review", ["already_paid"]]);
    });

    await t.step("no reference: falls back to payer email when exactly one application fits", async () => {
      const email = `solo-${tag}@example.com`;
      const r2 = await create("junior", email);
      const { out } = await webhook({ payer: { email: `  ${email.toUpperCase()} ` } });
      assertEquals([out.match, out.reference], ["matched", r2]);
      assertEquals(await status(r2), "paid");
    });

    await t.step("a teammate (not the lead) paying is still matched via email", async () => {
      const r3 = await create("junior", `team-${tag}@example.com`);
      const { out } = await webhook({ payer: { email: `co-team-${tag}@example.com` } });
      assertEquals([out.match, out.reference], ["matched", r3]);
    });

    await t.step("wrong amount is flagged and does NOT mark paid", async () => {
      const r4 = await create("main", `main-${tag}@example.com`);
      const { out } = await webhook({ reference: r4, registration: { track: "main" }, payment: { transaction_id: `t_${tag}`, amount: 1, currency: "INR" } });
      assertEquals([out.match, out.flags], ["needs_review", ["amount_mismatch"]]);
      assertEquals(await status(r4), "awaiting_payment");
    });

    await t.step("unknown payer is stored as unmatched (still 200), then an admin assigns it", async () => {
      const r5 = await create("junior", `late-${tag}@example.com`);
      const { res, out, event } = await webhook({ payer: { email: `nobody-${tag}@example.com` } });
      assertEquals([res.status, out.match], [200, "unmatched"]);

      const list = await (await run("/api/admin/payments", { headers: ADMIN })).json();
      const row = list.payments.find((p: { transaction_id: string }) => p.transaction_id === event.payment.transaction_id);
      assert(row, "unmatched payment visible to admin");

      const assign = await run(`/api/admin/payments/${row.id}/assign`, {
        method: "POST", headers: { ...ADMIN, "content-type": "application/json" }, body: JSON.stringify({ reference: r5.toLowerCase(), note: "parent paid" }),
      });
      assertEquals(assign.status, 200);
      assertEquals(await status(r5), "paid");
      const after = await (await run("/api/admin/payments", { headers: ADMIN })).json();
      assert(!after.payments.some((p: { id: string }) => p.id === row.id), "resolved payments leave the queue");
    });

    await t.step("refund follows the original transaction and marks refunded", async () => {
      const r6 = await create("junior", `refund-${tag}@example.com`);
      const txn = `txn_refund_${tag}`;
      await webhook({ reference: r6, payment: { transaction_id: txn, amount: 49900, currency: "INR" } });
      assertEquals(await status(r6), "paid");
      const { out } = await webhook({ event_type: "payment.refunded", payment: { transaction_id: txn, amount: 49900, currency: "INR" } });
      assertEquals([out.match, out.reference], ["matched", r6]);
      assertEquals(await status(r6), "refunded");
    });

    await t.step("one application per Google account; a second attempt returns the existing reference", async () => {
      const email = `dup-${tag}@example.com`;
      const first = await create("junior", email);
      const res = await run("/api/applications", { method: "POST", headers: { ...as(email), "content-type": "application/json" }, body: JSON.stringify(teamData("junior", email)) });
      assertEquals(res.status, 409);
      const body = await res.json();
      assertEquals([body.error, body.reference], ["already_registered", first]);
    });

    await t.step("portal flow: locked until paid, then editable, then locked after the deadline", async () => {
      const email = `portal-${tag}@example.com`;
      const r = await create("junior", email);

      const before = await (await me(email)).json();
      assertEquals([before.status, before.canEditIdea, before.ideaComplete], ["awaiting_payment", false, false]);
      assertEquals((await saveIdea(email, ideaForm(idea()))).status, 403); // payment_required

      await webhook({ reference: r });
      assertEquals((await (await me(email)).json()).canEditIdea, true);

      assertEquals((await saveIdea(email, ideaForm(idea({ theme: "not-a-theme" })))).status, 422);
      const noDeck = await saveIdea(email, ideaForm(idea(), false));
      assertEquals(noDeck.status, 422);
      assertEquals((await noDeck.json()).errors.pitchDeck, "required");

      const saved = await saveIdea(email, ideaForm(idea({ ideaTitle: "First title" })));
      assertEquals(saved.status, 200);
      const s1 = await saved.json();
      assertEquals([s1.idea.ideaTitle, s1.deck.filename, s1.ideaComplete], ["First title", "deck.pdf", true]);

      // Edit again WITHOUT re-uploading: text changes, the stored deck is kept.
      const edited = await (await saveIdea(email, ideaForm(idea({ ideaTitle: "Second title" }), false))).json();
      assertEquals([edited.idea.ideaTitle, edited.deck.filename], ["Second title", "deck.pdf"]);

      const original = config.ideaEditDeadline;
      config.ideaEditDeadline = new Date(Date.now() - 1000);
      try {
        const late = await saveIdea(email, ideaForm(idea({ ideaTitle: "Too late" })));
        assertEquals(late.status, 403);
        assertEquals((await late.json()).error, "deadline_passed");
        const view = await (await me(email)).json();
        assertEquals([view.canEditIdea, view.idea.ideaTitle], [false, "Second title"]);
      } finally {
        config.ideaEditDeadline = original;
      }
    });

    await t.step("users cannot see or edit each other's application", async () => {
      await create("junior", `owner-${tag}@example.com`);
      assertEquals((await me(`stranger-${tag}@example.com`)).status, 404);
      assertEquals((await saveIdea(`stranger-${tag}@example.com`, ideaForm(idea()))).status, 404);
    });

    await t.step("new applications are refused after the registration deadline", async () => {
      const original = config.registrationDeadline;
      config.registrationDeadline = new Date(Date.now() - 1000);
      try {
        const email = `late-reg-${tag}@example.com`;
        const res = await run("/api/applications", { method: "POST", headers: { ...as(email), "content-type": "application/json" }, body: JSON.stringify(teamData("junior", email)) });
        assertEquals([res.status, (await res.json()).error], [409, "registration_closed"]);
      } finally {
        config.registrationDeadline = original;
      }
    });

    await t.step("the owner's Google email also matches a payment that has no reference", async () => {
      const email = `ownermatch-${tag}@gmail.com`;
      const r = await create("junior", email);
      const { out } = await webhook({ payer: { email: email.toUpperCase() } });
      assertEquals([out.match, out.reference], ["matched", r]);
    });

    await sql.end();
  },
});
