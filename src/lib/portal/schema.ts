import { z } from "zod";
import { themes } from "@/content/themes";

export const MAX_DECK_BYTES = 10 * 1024 * 1024;
export const DECK_TYPES = [".pdf", ".ppt", ".pptx"];
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
export const VIDEO_TYPES = [".mp4", ".m4v", ".mov", ".webm"];

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

export const ideaSchema = z.object({
  theme: z.enum(themes.map((t) => t.id) as [string, ...string[]], "Choose a theme"),
  ideaTitle: text("Idea / venture title", 150),
  problemStatement: text("Problem statement", 300),
  ideaSummary: text("Idea summary", 600),
  // Optional: the video can be a link here OR an uploaded file; the backend checks that one exists when the team submits.
  pitchVideoLink: z.union([z.literal(""), z.string().trim().max(255).pipe(z.url("Enter a valid link (YouTube, Drive…)"))]),
});
export type IdeaInput = z.infer<typeof ideaSchema>;

export function parseIdeaForm(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "");
  return { theme: get("theme"), ideaTitle: get("ideaTitle"), problemStatement: get("problemStatement"), ideaSummary: get("ideaSummary"), pitchVideoLink: get("pitchVideoLink") };
}

/** `hasExisting`: a deck is already stored, so a new upload is optional when editing. */
export function validateDeck(file: File | null, hasExisting: boolean): string | null {
  if (!file || file.size === 0) return hasExisting ? null : "Upload your pitch deck";
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  if (!DECK_TYPES.includes(ext)) return "Deck must be a PDF, PPT or PPTX";
  if (file.size > MAX_DECK_BYTES) return "Deck must be under 10 MB";
  return null;
}

export function validateVideo(file: File | null): string | null {
  if (!file || file.size === 0) return "Choose a video file";
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  if (!VIDEO_TYPES.includes(ext)) return "Video must be MP4, MOV or WebM";
  if (file.size > MAX_VIDEO_BYTES) return "Video must be under 25 MB";
  return null;
}
