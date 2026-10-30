"use server";

import { backend, type MyApplication } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";
import type { FieldErrors } from "@/lib/registration/schema";
import { ideaSchema, parseIdeaForm, validateDeck, validateVideo } from "@/lib/portal/schema";
import { toFieldErrors } from "@/lib/registration/schema";

export type SaveIdeaState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors; message?: string }
  | { status: "saved"; savedAt: number; application: MyApplication };

const gateMessage = (status: number, body: { error?: string }) => {
  if (status === 403 && body.error === "deadline_passed") return "The deadline for editing your idea has passed.";
  if (status === 403 && body.error === "payment_required") return "Your payment hasn't been confirmed yet.";
  if (status === 403) return "Only the Lead, Co-lead or registering account can make changes.";
  return null;
};

/** Step 1: saves (or edits) the idea details. The deck and video are saved by their own buttons. */
export async function saveIdea(_prev: SaveIdeaState, formData: FormData): Promise<SaveIdeaState> {
  const user = await getSession();
  if (!user) return { status: "error", errors: {}, message: "Your session expired. Please sign in again." };

  const parsed = ideaSchema.safeParse(parseIdeaForm(formData));
  if (!parsed.success) return { status: "error", errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  const out = new FormData();
  out.set("data", JSON.stringify(parsed.data));
  try {
    const res = await backend("/api/me/idea", user.email, { method: "PUT", body: out });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { status: "saved", savedAt: Date.now(), application: body as MyApplication };
    const gate = gateMessage(res.status, body);
    if (gate) return { status: "error", errors: {}, message: gate };
    if (res.status === 422) return { status: "error", errors: body.errors ?? {}, message: "Please fix the highlighted fields." };
    console.error("saveIdea: backend responded", res.status);
  } catch (e) {
    console.error("saveIdea failed", (e as Error).message);
  }
  return { status: "error", errors: {}, message: "We couldn't save your idea. Please try again." };
}

/** Step 2: the pitch deck (PDF/PPT/PPTX, max 10 MB), saved on its own. */
export async function uploadDeck(_prev: SaveIdeaState, formData: FormData): Promise<SaveIdeaState> {
  const user = await getSession();
  if (!user) return { status: "error", errors: {}, message: "Your session expired. Please sign in again." };
  const deck = formData.get("pitchDeck");
  const err = validateDeck(deck instanceof File ? deck : null, false);
  if (err) return { status: "error", errors: { pitchDeck: err } };

  const out = new FormData();
  out.set("pitchDeck", deck as File);
  try {
    const res = await backend("/api/me/deck", user.email, { method: "PUT", body: out });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { status: "saved", savedAt: Date.now(), application: body as MyApplication };
    const gate = gateMessage(res.status, body);
    if (gate) return { status: "error", errors: {}, message: gate };
    const e = body.errors?.pitchDeck;
    return { status: "error", errors: e ? { pitchDeck: e === "too_large" ? "Deck must be under 10 MB" : e === "bad_type" ? "Deck must be a PDF, PPT or PPTX" : e } : {}, message: e ? undefined : "We couldn't save your deck. Please try again." };
  } catch (e) {
    console.error("uploadDeck failed", (e as Error).message);
    return { status: "error", errors: {}, message: "We couldn't save your deck. Please try again." };
  }
}

/** Final step: the backend checks that details, deck and a video link or file are all in. */
export async function submitIdea(_prev: SaveIdeaState): Promise<SaveIdeaState> {
  const user = await getSession();
  if (!user) return { status: "error", errors: {}, message: "Your session expired. Please sign in again." };
  try {
    const res = await backend("/api/me/submit", user.email, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { status: "saved", savedAt: Date.now(), application: body as MyApplication };
    const gate = gateMessage(res.status, body);
    if (gate) return { status: "error", errors: {}, message: gate };
    if (res.status === 422) return { status: "error", errors: body.errors ?? {}, message: Object.values(body.errors ?? {}).join(" · ") || "Something is still missing." };
  } catch (e) {
    console.error("submitIdea failed", (e as Error).message);
  }
  return { status: "error", errors: {}, message: "We couldn't submit. Please try again." };
}

const videoMessage = (status: number, body: { error?: string; errors?: Record<string, string> }) => {
  if (status === 403 && body.error === "deadline_passed") return "The deadline for editing your idea has passed.";
  if (status === 403 && body.error === "payment_required") return "Your payment hasn't been confirmed yet.";
  if (status === 403) return "Only the Lead, Co-lead or registering account can change the video.";
  if (status === 503) return "Video upload isn't available right now. Please paste a link instead.";
  const e = body.errors?.pitchVideo;
  if (e === "too_large") return "Video must be under 50 MB";
  if (e === "bad_type") return "Video must be MP4, MOV or WebM";
  return e ?? null;
};

/** Step 3: the pitch video: a link, a file (max 50 MB; the browser sends big files in parts, see lib/portal/upload.ts), or both, saved on its own so it never competes with the deck for the size limit. */
export async function saveVideo(_prev: SaveIdeaState, formData: FormData): Promise<SaveIdeaState> {
  const user = await getSession();
  if (!user) return { status: "error", errors: {}, message: "Your session expired. Please sign in again." };
  const file = formData.get("pitchVideo");
  const hasFile = file instanceof File && file.size > 0;
  const linkField = formData.get("pitchVideoLink");
  const link = typeof linkField === "string" ? linkField.trim() : undefined;
  const errors: FieldErrors = {};
  if (hasFile) {
    const e = validateVideo(file);
    if (e) errors.pitchVideo = e;
  }
  if (link && !/^https?:\/\/\S+$/i.test(link)) errors.pitchVideoLink = "Enter a valid link (YouTube, Drive…)";
  if (Object.keys(errors).length) return { status: "error", errors };

  const out = new FormData();
  if (link !== undefined) out.set("pitchVideoLink", link);
  if (hasFile) out.set("pitchVideo", file);
  try {
    const res = await backend("/api/me/video", user.email, { method: "PUT", body: out });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { status: "saved", savedAt: Date.now(), application: body as MyApplication };
    return { status: "error", errors: {}, message: videoMessage(res.status, body) ?? "We couldn't save your video. Please try again." };
  } catch (e) {
    console.error("saveVideo failed", (e as Error).message);
    return { status: "error", errors: {}, message: "We couldn't save your video. Please try again." };
  }
}

export async function removeVideo(_prev: SaveIdeaState): Promise<SaveIdeaState> {
  const user = await getSession();
  if (!user) return { status: "error", errors: {}, message: "Your session expired. Please sign in again." };
  const res = await backend("/api/me/video", user.email, { method: "DELETE" }).catch(() => null);
  const body = await res?.json().catch(() => ({}));
  if (res?.ok) return { status: "saved", savedAt: Date.now(), application: body as MyApplication };
  return { status: "error", errors: {}, message: (res && videoMessage(res.status, body)) || "We couldn't remove the video. Please try again." };
}

/** The final button: saves what is typed in the details form (including the video link), then submits. */
export async function saveAndSubmit(prev: SaveIdeaState, formData: FormData): Promise<SaveIdeaState> {
  const saved = await saveIdea(prev, formData);
  if (saved.status !== "saved") return saved;
  return submitIdea(prev);
}
