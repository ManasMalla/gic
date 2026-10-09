"use server";

import { backend, type MyApplication } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";
import type { FieldErrors } from "@/lib/registration/schema";
import { ideaSchema, parseIdeaForm, validateDeck } from "@/lib/portal/schema";
import { toFieldErrors } from "@/lib/registration/schema";

export type SaveIdeaState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors; message?: string }
  | { status: "saved"; savedAt: number; application: MyApplication };

/** Saves (or edits) the idea. The backend enforces "paid" + "before deadline"; we validate here for fast feedback. */
export async function saveIdea(_prev: SaveIdeaState, formData: FormData): Promise<SaveIdeaState> {
  const user = await getSession();
  if (!user) return { status: "error", errors: {}, message: "Your session expired. Please sign in again." };

  const parsed = ideaSchema.safeParse(parseIdeaForm(formData));
  const errors: FieldErrors = parsed.success ? {} : toFieldErrors(parsed.error);
  const deck = formData.get("pitchDeck");
  const hasExisting = formData.get("hasExistingDeck") === "1";
  const deckError = validateDeck(deck instanceof File ? deck : null, hasExisting);
  if (deckError) errors.pitchDeck = deckError;
  if (!parsed.success || deckError) return { status: "error", errors, message: "Please fix the highlighted fields." };

  const out = new FormData();
  out.set("data", JSON.stringify(parsed.data));
  if (deck instanceof File && deck.size > 0) out.set("pitchDeck", deck);

  try {
    const res = await backend("/api/me/idea", user.email, { method: "PUT", body: out });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { status: "saved", savedAt: Date.now(), application: body as MyApplication };
    if (res.status === 403 && body.error === "deadline_passed") return { status: "error", errors: {}, message: "The deadline for editing your idea has passed." };
    if (res.status === 403 && body.error === "payment_required") return { status: "error", errors: {}, message: "Your payment hasn't been confirmed yet." };
    if (res.status === 422) return { status: "error", errors: body.errors ?? {}, message: "Please fix the highlighted fields." };
    console.error("saveIdea: backend responded", res.status);
  } catch (e) {
    console.error("saveIdea failed", (e as Error).message);
  }
  return { status: "error", errors: {}, message: "We couldn't save your idea. Please try again." };
}
