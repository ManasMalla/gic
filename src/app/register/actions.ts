"use server";

import { backend } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";
import { parseFormData, teamSchema, toFieldErrors, type FieldErrors } from "@/lib/registration/schema";

export type RegisterState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors; message?: string }
  | { status: "success" | "exists"; reference: string };

/** Step 1: saves the team for the signed-in Google account. Payment comes next. */
export async function registerTeam(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const user = await getSession();
  if (!user) return { status: "error", errors: {}, message: "Your session expired. Please sign in again." };

  const parsed = teamSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { status: "error", errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  try {
    const res = await backend("/api/applications", user.email, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 201) return { status: "success", reference: body.reference };
    if (res.status === 409 && body.error === "already_registered") return { status: "exists", reference: body.reference };
    if (res.status === 409 && body.error === "registration_closed") return { status: "error", errors: {}, message: "Registration is now closed." };
    if (res.status === 422) return { status: "error", errors: body.errors ?? {}, message: "Please fix the highlighted fields." };
    console.error("registerTeam: backend responded", res.status);
  } catch (e) {
    console.error("registerTeam failed", (e as Error).message);
  }
  return { status: "error", errors: {}, message: "We couldn't save your team. Please try again." };
}
