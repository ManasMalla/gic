// Needs a real Postgres (like integration_test). R2 is faked in memory so uploads/deletes can be checked.
import { assert, assertEquals } from "@std/assert";

Deno.test({
  name: "deck, video and submit: each saved on its own, R2 cleanup, 25 MB cap, link-or-video rule",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    const objects = new Map<string, number>();
    const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
      const key = new URL(req.url).pathname;
      if (req.method === "PUT") objects.set(key, (await req.arrayBuffer()).byteLength);
      if (req.method === "DELETE") objects.delete(key);
      return new Response(null, { status: 200 });
    });
    Deno.env.set("R2_ENDPOINT", `http://127.0.0.1:${server.addr.port}`);
    const { config } = await import("./config.ts");
    config.r2 = { accountId: "a", accessKeyId: "k", secretAccessKey: "s", bucket: "b", publicBaseUrl: "https://files.example.com", prefix: "gic" };
    const { route } = await import("./main.ts");
    const { migrate, prisma } = await import("./db.ts");
    await migrate();

    const vids = () => [...objects].filter(([k]) => k.includes("/videos/"));
    const decks = () => [...objects].filter(([k]) => k.includes("/decks/"));
    const INTERNAL = { "x-internal-token": Deno.env.get("INTERNAL_API_TOKEN")! };
    const owner = `vid-${crypto.randomUUID().slice(0, 8)}@example.com`;
    const run = (path: string, init: RequestInit = {}) => route(new Request(`http://x${path}`, { ...init, headers: { ...INTERNAL, "x-user-email": owner, ...init.headers } }));
    const app = await prisma.application.create({
      data: { reference: `GIC26-VID${crypto.randomUUID().slice(0, 5).toUpperCase()}-X`, ownerEmail: owner, track: "junior", teamName: "Vid", institution: "S", data: {}, amountDue: 49900, status: "paid",
              contacts: { create: [{ role: "owner", email: owner }, { role: "founder", email: owner }] } },
    });
    const form = (o: Record<string, string | File>) => { const fd = new FormData(); for (const [k, v] of Object.entries(o)) fd.set(k, v); return fd; };
    const file = (name: string, bytes: number, type: string) => new File([new Uint8Array(bytes)], name, { type });
    const details = () => run("/api/me/idea", { method: "PUT", body: form({ data: JSON.stringify({ theme: "sports-fitness", ideaTitle: "T", problemStatement: "P", ideaSummary: "S" }) }) });
    const deck = (name = "d.pdf", bytes = 100) => run("/api/me/deck", { method: "PUT", body: form({ pitchDeck: file(name, bytes, "application/pdf") }) });
    const video = (o: { link?: string; name?: string; bytes?: number; type?: string }) =>
      run("/api/me/video", { method: "PUT", body: form({ ...(o.link !== undefined ? { pitchVideoLink: o.link } : {}), ...(o.name ? { pitchVideo: file(o.name, o.bytes ?? 10, o.type ?? "video/mp4") } : {}) }) });
    const submit = () => run("/api/me/submit", { method: "POST" });

    await t.step("submit needs details, deck and a video link or file", async () => {
      let r = await submit();
      assertEquals([r.status, Object.keys((await r.json()).errors).sort()], [422, ["details", "pitchDeck", "pitchVideo"]]);
      assertEquals((await details()).status, 200);
      assertEquals((await deck()).status, 200);
      assertEquals(decks().length, 1);
      r = await submit();
      assertEquals([r.status, Object.keys((await r.json()).errors)], [422, ["pitchVideo"]]);
      assertEquals((await video({ link: "not a url" })).status, 422);
      assertEquals((await video({ link: "https://youtu.be/x" })).status, 200); // a link alone is enough
      const done = await (await submit()).json();
      assert(done.submittedAt);
    });
    await t.step("rejects too big and wrong video types", async () => {
      const big = await video({ name: "big.mp4", bytes: 25 * 1024 * 1024 + 1 });
      assertEquals([big.status, (await big.json()).errors.pitchVideo], [422, "too_large"]);
      const bad = await video({ name: "clip.exe", bytes: 1000, type: "application/octet-stream" });
      assertEquals([bad.status, (await bad.json()).errors.pitchVideo], [422, "bad_type"]);
      assertEquals(vids().length, 0);
    });
    await t.step("accepts up to 25 MB under gic/videos/<ref>/ and exposes the public URL", async () => {
      const ok = await video({ name: "pitch.mp4", bytes: 25 * 1024 * 1024 });
      assertEquals(ok.status, 200);
      const me = await ok.json();
      assert(me.video.url.startsWith(`https://files.example.com/gic/videos/${app.reference}/`), me.video.url);
      assertEquals(vids().map(([, n]) => n), [25 * 1024 * 1024]);
    });
    await t.step("replace deletes the old object; removing the last video+link sends the team back to draft", async () => {
      const first = vids()[0][0];
      assertEquals((await video({ name: "second.webm", bytes: 5000, type: "video/webm" })).status, 200);
      assertEquals(vids().length, 1);
      assert(!objects.has(first));
      // clear the link: the file still counts, so it stays submitted
      assertEquals((await (await video({ link: "" })).json()).submittedAt !== null, true);
      // now remove the file: neither link nor file is left -> back to draft
      const gone = await (await run("/api/me/video", { method: "DELETE" })).json();
      assertEquals([gone.video, gone.submittedAt], [null, null]);
      assertEquals(vids().length, 0);
      assertEquals((await submit()).status, 422);
    });
    await t.step("replacing the deck deletes the old deck object", async () => {
      const before = decks()[0][0];
      assertEquals((await deck("v2.pdf", 300)).status, 200);
      assertEquals(decks().length, 1);
      assert(!objects.has(before));
    });
    await t.step("a non-lead member cannot upload or submit", async () => {
      const member = `m-${owner}`;
      await prisma.applicationContact.create({ data: { applicationId: app.id, role: "member3", email: member } });
      const h = { "x-user-email": member };
      assertEquals((await run("/api/me/video", { method: "PUT", body: form({ pitchVideo: file("a.mp4", 10, "video/mp4") }), headers: h })).status, 403);
      assertEquals((await run("/api/me/deck", { method: "PUT", body: form({ pitchDeck: file("a.pdf", 10, "application/pdf") }), headers: h })).status, 403);
      assertEquals((await run("/api/me/submit", { method: "POST", headers: h })).status, 403);
    });
    config.r2 = null;
    Deno.env.delete("R2_ENDPOINT");
    await prisma.$disconnect();
    await server.shutdown();
  },
});
