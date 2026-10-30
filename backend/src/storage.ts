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

// ---------- multipart upload (S3 API): lets big files arrive in small requests ----------
// A single request to Cloud Run is capped at ~32 MiB, so a 50 MB video is sent in parts of a few MB and R2 joins them.

const xmlTag = (xml: string, tag: string) => xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1] ?? null;

export async function createMultipart(key: string, contentType: string, filename: string, opts: { inline?: boolean } = {}): Promise<string> {
  const res = await client().fetch(`${url(key)}?uploads`, {
    method: "POST",
    headers: { "content-type": contentType, "content-disposition": `${opts.inline ? "inline" : "attachment"}; filename="${safeName(filename)}"` },
  });
  const id = res.ok ? xmlTag(await res.text(), "UploadId") : null;
  if (!id) throw new Error(`R2 create multipart ${res.status}`);
  return id;
}

/** Uploads one part (parts other than the last must be at least 5 MiB). Returns the part's ETag. */
export async function uploadPart(key: string, uploadId: string, partNumber: number, bytes: Uint8Array): Promise<string> {
  const res = await client().fetch(`${url(key)}?partNumber=${partNumber}&uploadId=${encodeURIComponent(uploadId)}`, { method: "PUT", body: bytes as BodyInit });
  const etag = res.headers.get("etag");
  if (!res.ok || !etag) throw new Error(`R2 upload part ${res.status}`);
  return etag;
}

export async function completeMultipart(key: string, uploadId: string, parts: { n: number; etag: string }[]) {
  const body = `<CompleteMultipartUpload>${[...parts].sort((a, b) => a.n - b.n).map((p) => `<Part><PartNumber>${p.n}</PartNumber><ETag>${p.etag}</ETag></Part>`).join("")}</CompleteMultipartUpload>`;
  const res = await client().fetch(`${url(key)}?uploadId=${encodeURIComponent(uploadId)}`, { method: "POST", body, headers: { "content-type": "application/xml" } });
  const text = await res.text();
  if (!res.ok || text.includes("<Error>")) throw new Error(`R2 complete multipart ${res.status}`);
}

/** Best effort, like deleteObject: abandoned parts cost storage but must never fail a request. */
export async function abortMultipart(key: string, uploadId: string) {
  if (!r2()) return;
  try {
    await client().fetch(`${url(key)}?uploadId=${encodeURIComponent(uploadId)}`, { method: "DELETE" });
  } catch (e) {
    console.warn(JSON.stringify({ severity: "WARNING", msg: "R2 abort multipart failed", error: String(e), key }));
  }
}

/** Size in bytes of a stored object, or null if it isn't there. */
export async function objectSize(key: string): Promise<number | null> {
  const res = await client().fetch(url(key), { method: "HEAD" });
  const len = res.headers.get("content-length");
  return res.ok && len ? Number(len) : null;
}

/** True when `key` is under this team's own video folder (so one team can never touch another's uploads). */
export const isOwnVideoKey = (key: string, reference: string) => key.startsWith(`${r2()!.prefix}/videos/${reference}/`) && !key.includes("..");
