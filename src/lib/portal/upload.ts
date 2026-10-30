import type { MyApplication } from "@/lib/backend";

export type VideoUploadResult = { ok: true; application: MyApplication } | { ok: false; message: string };

const MB = 1024 * 1024;
const jsonOf = async (res: Response) => res.json().catch(() => ({} as Record<string, unknown>));
const post = (path: string, body: unknown) => fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

/** Friendly text for the problems the server can name. */
function explain(status: number, data: Record<string, unknown>): string {
  const code = (data.errors as Record<string, string> | undefined)?.pitchVideo ?? (data.error as string | undefined);
  if (code === "too_large") return "Video must be under 50 MB";
  if (code === "bad_type") return "Video must be MP4, MOV or WebM";
  if (status === 401) return "Your session expired. Please sign in again.";
  if (status === 403) return "Only the Lead, Co-lead or registering account can change the video, and only before the deadline.";
  if (status === 503) return "Video upload isn't available right now. Please paste a link instead.";
  return "We couldn't upload your video. Please try again, or paste a link instead.";
}

/**
 * Uploads a video in parts of 8 MB (a single request to our host cannot be bigger than ~32 MB, so a 50 MB file has to be sent
 * in pieces). Each part is retried a few times, which also makes slow or flaky mobile connections far more forgiving.
 */
export async function uploadVideoInParts(file: File, onProgress: (percent: number) => void): Promise<VideoUploadResult> {
  let session: { key: string; uploadId: string } | null = null;
  try {
    const startRes = await post("/api/me/video/start", { filename: file.name, size: file.size, type: file.type });
    const start = await jsonOf(startRes);
    if (!startRes.ok) return { ok: false, message: explain(startRes.status, start) };
    session = { key: start.key as string, uploadId: start.uploadId as string };
    const partBytes = (start.partBytes as number) || 8 * MB;

    const parts: { n: number; etag: string }[] = [];
    for (let n = 1, offset = 0; offset < file.size; n++, offset += partBytes) {
      const chunk = file.slice(offset, Math.min(offset + partBytes, file.size));
      let etag: string | null = null;
      for (let attempt = 1; attempt <= 4 && !etag; attempt++) {
        try {
          const res = await fetch(`/api/me/video/part?${new URLSearchParams({ ...session, n: String(n) })}`, { method: "PUT", body: chunk });
          const data = await jsonOf(res);
          if (res.ok && typeof data.etag === "string") etag = data.etag;
          else if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) throw new Error(explain(res.status, data));
        } catch (e) {
          if (e instanceof Error && !(e instanceof TypeError)) throw e; // a refusal from the server: do not retry
        }
        if (!etag && attempt < 4) await new Promise((r) => setTimeout(r, 800 * attempt));
      }
      if (!etag) throw new Error("The connection kept dropping. Please try again, or paste a link instead.");
      parts.push({ n, etag });
      onProgress(Math.min(99, Math.round((Math.min(offset + partBytes, file.size) / file.size) * 100)));
    }

    const doneRes = await post("/api/me/video/complete", { ...session, filename: file.name, type: file.type, parts });
    const done = await jsonOf(doneRes);
    if (!doneRes.ok) throw new Error(explain(doneRes.status, done));
    onProgress(100);
    return { ok: true, application: done as unknown as MyApplication };
  } catch (e) {
    if (session) void post("/api/me/video/abort", session).catch(() => {}); // tidy up the half-finished upload
    return { ok: false, message: e instanceof Error ? e.message : "We couldn't upload your video. Please try again." };
  }
}
