"use server";

import { feeFor, paymentUrl } from "@/lib/gevents";
import { getRepository } from "@/lib/registration/repository";
import {
  registrationSchema, parseFormData, toFieldErrors, validateDeck, type FieldErrors,
} from "@/lib/registration/schema";

export type RegisterState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors; message?: string }
  | { status: "success"; reference: string; fee: number; paymentUrl: string };

export async function submitRegistration(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registrationSchema.safeParse(parseFormData(formData));
  const errors: FieldErrors = parsed.success ? {} : toFieldErrors(parsed.error);

  const deck = formData.get("pitchDeck");
  const deckError = validateDeck(deck instanceof File ? deck : null);
  if (deckError) errors.pitchDeck = deckError;

  if (!parsed.success || deckError) {
    return { status: "error", errors, message: "Please fix the highlighted fields." };
  }

  try {
    const saved = await getRepository().create(parsed.data, deck as File);
    return { status: "success", reference: saved.reference, fee: feeFor(parsed.data.track), paymentUrl: paymentUrl() };
  } catch (e) {
    console.error("registration failed", e);
    return { status: "error", errors: {}, message: "We couldn't save your application. Please try again." };
  }
}
