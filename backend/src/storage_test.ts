import { assert, assertEquals, assertMatch } from "@std/assert";

// A tiny fake of R2's S3 API: records what we send, so we can check keys, signing and cleanup without the real bucket.
Deno.test("R2 storage: puts under gic/decks/<ref>/, signs requests, returns the public URL, deletes", async () => {
  const seen: { method: string; path: string; auth: string | null; type: string | null; disp: string | null; bytes: number }[] = [];
  const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
    seen.push({ method: req.method, path: new URL(req.url).pathname, auth: req.headers.get("authorization"), type: req.headers.get("content-type"), disp: req.headers.get("content-disposition"), bytes: (await req.arrayBuffer()).byteLength });
    return new Response(null, { status: req.method === "PUT" ? 200 : 204 });
  });
  Deno.env.set("R2_ENDPOINT", `http://127.0.0.1:${server.addr.port}`);
  for (const [k, v] of Object.entries({ DATABASE_URL: "postgres://x:y@h/d", GEVENTS_WEBHOOK_SECRETS: "s", INTERNAL_API_TOKEN: "i", ADMIN_API_TOKEN: "a" })) if (!Deno.env.get(k)) Deno.env.set(k, v);

  const { config } = await import("./config.ts");
  config.r2 = { accountId: "acct123", accessKeyId: "AKTEST", secretAccessKey: "sktest", bucket: "bucket1", publicBaseUrl: "https://files.example.com", prefix: "gic" };
  const { storageEnabled, deckKey, publicUrlFor, putObject, deleteObject } = await import("./storage.ts");
  assertEquals(storageEnabled(), true);
  const key = deckKey("GIC26-ABCDEFGH-1", "My Deck (final).pdf");
  assertMatch(key, /^gic\/decks\/GIC26-ABCDEFGH-1\/[0-9a-f-]{36}-My_Deck__final_.pdf$/);
  assertEquals(publicUrlFor(key), `https://files.example.com/${key}`);

  await putObject(key, new Uint8Array(2048), "application/pdf", "My Deck (final).pdf");
  await deleteObject(key);
  await deleteObject(null); // nothing to do, must not call out
  await server.shutdown();

  assertEquals(seen.map((s) => s.method), ["PUT", "DELETE"]);
  assertEquals(seen[0].path, `/bucket1/${key}`);
  assertEquals([seen[0].type, seen[0].bytes], ["application/pdf", 2048]);
  assert(seen[0].disp?.startsWith('attachment; filename="My_Deck__final_.pdf"'), String(seen[0].disp));
  assertMatch(seen[0].auth ?? "", /^AWS4-HMAC-SHA256 Credential=AKTEST\//);
});
