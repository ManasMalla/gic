import { AwsClient } from "aws4fetch";
import { config } from "./config.ts";

/**
 * Pitch deck / video storage on Cloudflare R2 (S3 API, SigV4). Everything lives under `<bucket>/<prefix>/` (prefix = "gic").
 * Settings are read on each call (not at import) so tests can switch R2 on or off.
 */
const r2 = () => config.r2;
export const storageEnabled = () => r2() !== null;

let cached: { id: string; client: AwsClient } | null = null;
function client() {
  const c = r2()!;
  const id = `${c.accessKeyId}:${c.secretAccessKey}`;
  if (cached?.id !== id) cached = { id, client: new AwsClient({ accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey, service: "s3", region: "auto" }) };
  return cached.client;
}

// R2_ENDPOINT only exists so tests can point at a local fake; in production it is derived from the account id.
const endpoint = () => Deno.env.get("R2_ENDPOINT") ?? `https://${r2()!.accountId}.r2.cloudflarestorage.com`;
const url = (key: string) => `${endpoint()}/${r2()!.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;

const safeName = (n: string) => n.replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_").slice(0, 80) || "deck";

/** Unguessable keys: public URLs are only as private as their key. */
const keyFor = (kind: "decks" | "videos") => (reference: string, filename: string) =>
  `${r2()!.prefix}/${kind}/${reference}/${crypto.randomUUID()}-${safeName(filename)}`;
export const deckKey = keyFor("decks");
export const videoKey = keyFor("videos");

/** The public download URL stored in the database for an object key. */
export const publicUrlFor = (key: string) => `${r2()!.publicBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

export async function putObject(key: string, bytes: Uint8Array, contentType: string, filename: string, opts: { inline?: boolean } = {}) {
  const res = await client().fetch(url(key), {
    method: "PUT",
    body: bytes as BodyInit,
    headers: { "content-type": contentType, "content-disposition": `${opts.inline ? "inline" : "attachment"}; filename="${safeName(filename)}"` },
  });
  if (!res.ok) throw new Error(`R2 put ${res.status}`);
}

/** Best effort: a leftover object is harmless, a failed delete must never fail the request. */
export async function deleteObject(key: string | null | undefined) {
  if (!r2() || !key) return;
  try {
    const res = await client().fetch(url(key), { method: "DELETE" });
    if (!res.ok && res.status !== 404) console.warn(JSON.stringify({ severity: "WARNING", msg: "R2 delete failed", status: res.status, key }));
  } catch (e) {
    console.warn(JSON.stringify({ severity: "WARNING", msg: "R2 delete failed", error: String(e), key }));
  }
}
