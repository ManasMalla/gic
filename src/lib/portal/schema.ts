import { z } from "zod";
import { themes } from "@/content/themes";

export const MAX_DECK_BYTES = 10 * 1024 * 1024;
export const DECK_TYPES = [".pdf", ".ppt", ".pptx"];

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

export const ideaSchema = z.object({
  theme: z.enum(themes.map((t) => t.id) as [string, ...string[]], "Choose a theme"),
  ideaTitle: text("Idea / venture title", 150),
  problemStatement: text("Problem statement", 300),
  ideaSummary: text("Idea summary", 600),
  pitchVideoLink: z.string().trim().max(255).pipe(z.url("Enter a valid link (YouTube, Drive…)")),
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
