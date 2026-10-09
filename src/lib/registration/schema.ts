import { z } from "zod";

export const TRACKS = ["junior", "main"] as const;
export const GENDERS = ["female", "male", "other", "prefer-not-to-say"] as const;

// Field rules mirror the original GEvents form (lengths, allowed characters) and the backend schema.
const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);
const name = (label: string) => text(label, 100).regex(/^[A-Za-z .'-]+$/, "Letters and spaces only");
const email = z.string().trim().toLowerCase().max(100).pipe(z.email("Enter a valid email address"));
const phone = z.string().trim().regex(/^\d{10,15}$/, "Enter 10–15 digits");

const member = z.object({
  name: name("Name"),
  courseYear: text("Course & year", 100),
  email,
  phone,
  gender: z.enum(GENDERS, "Select a gender"),
});

const optionalMember = z.object({
  name: z.string().trim().max(100).regex(/^[A-Za-z .'-]*$/, "Letters and spaces only"),
  courseYear: z.string().trim().max(100),
  email: z.union([z.literal(""), email]),
  phone: z.union([z.literal(""), phone]),
  gender: z.union([z.literal(""), z.enum(GENDERS)]),
});

// Step 1 of the journey: the team. The idea (theme, title, deck…) is written later, in the portal, after payment.
export const stepSchemas = {
  team: z.object({
    track: z.enum(TRACKS, "Choose a track"),
    teamName: text("Team name", 100),
    institution: text("Institution", 150),
    address: text("Address", 200),
    cityState: text("City & state", 100),
  }),
  members: z.object({
    founder: member,
    cofounder: member,
    member3: optionalMember,
    member4: optionalMember,
    member5: optionalMember, // Main Track only (teams of up to 6)
    member6: optionalMember,
  }),
  confirm: z.object({
    declaration: z.literal("on", "You must accept the declaration"),
    remarks: z.string().trim().max(100).optional(),
  }),
} as const;

export const teamSchema = z.object({ ...stepSchemas.team.shape, ...stepSchemas.members.shape, ...stepSchemas.confirm.shape });

export type TeamInput = z.infer<typeof teamSchema>;
export type StepId = keyof typeof stepSchemas;
export type FieldErrors = Record<string, string>;

const memberKeys = ["name", "courseYear", "email", "phone", "gender"] as const;

/** Reads the flat HTML form fields (e.g. `founder.name`) into the nested shape the schema expects. */
export function parseFormData(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "");
  const mem = (p: string) => Object.fromEntries(memberKeys.map((k) => [k, get(`${p}.${k}`)]));
  return {
    track: get("track"),
    teamName: get("teamName"),
    institution: get("institution"),
    address: get("address"),
    cityState: get("cityState"),
    founder: mem("founder"),
    cofounder: mem("cofounder"),
    member3: mem("member3"),
    member4: mem("member4"),
    member5: mem("member5"),
    member6: mem("member6"),
    declaration: get("declaration"),
    remarks: get("remarks"),
  };
}

/** Turns zod issues into { "founder.email": "message" } so inputs can look up their error by name. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export function validateStep(step: StepId, fd: FormData): FieldErrors {
  const r = stepSchemas[step].safeParse(parseFormData(fd));
  return r.success ? {} : toFieldErrors(r.error);
}
