import { z } from "zod";

// Authoritative server-side validation of an application (the website validates too, but never trust a client).
const GENDERS = ["female", "male", "other", "prefer-not-to-say"] as const;
const THEMES = ["planet-sustainability", "bio-economy", "deeptech-manufacturing", "sports-fitness", "d2c-consumer"] as const;

const text = (max: number) => z.string().trim().min(1).max(max);
const email = z.string().trim().toLowerCase().max(100).pipe(z.email());
const phone = z.string().trim().regex(/^\d{10,15}$/);
const person = z.object({ name: text(100), courseYear: text(100), email, phone, gender: z.enum(GENDERS) });
const optionalPerson = z.object({
  name: z.string().trim().max(100),
  courseYear: z.string().trim().max(100),
  email: z.union([z.literal(""), email]),
  phone: z.union([z.literal(""), phone]),
  gender: z.union([z.literal(""), z.enum(GENDERS)]),
});

// Step 1 (before payment): who the team is.
export const teamSchema = z.object({
  track: z.enum(["junior", "main"]),
  teamName: text(100),
  institution: text(150),
  address: text(200),
  cityState: text(100),
  founder: person,
  cofounder: person,
  member3: optionalPerson,
  member4: optionalPerson,
  member5: optionalPerson,
  member6: optionalPerson,
  declaration: z.literal("on"),
  remarks: z.string().trim().max(100).optional(),
});
export type TeamInput = z.infer<typeof teamSchema>;

// Step 2 (after payment, in the portal): the idea. Editable until the deadline.
export const ideaSchema = z.object({
  theme: z.enum(THEMES),
  ideaTitle: text(150),
  problemStatement: text(300),
  ideaSummary: text(600),
  pitchVideoLink: z.string().trim().max(255).pipe(z.url()),
});
export type IdeaInput = z.infer<typeof ideaSchema>;

export const webhookSchema = z.object({
  event_id: z.string().min(1).max(100),
  event_type: z.enum(["payment.succeeded", "payment.failed", "payment.refunded"]),
  occurred_at: z.iso.datetime({ offset: true }),
  reference: z.string().nullish(),
  // `registration.data` (or top-level `data`): GEvents may echo back the opaque token we put in the payment URL.
  registration: z.object({ track: z.string().nullish(), data: z.string().nullish() }).loose().nullish(),
  data: z.string().nullish(),
  payment: z.object({
    // GEvents may send null here (seen in its first live test): we fall back to other ids (see webhook.ts).
    transaction_id: z.string().max(100).nullish(),
    gateway_payment_id: z.string().max(100).nullish(),
    gateway_order_id: z.string().max(100).nullish(),
    receipt_number: z.string().max(100).nullish(),
    amount: z.number().int().nonnegative(),
    currency: z.string().length(3),
  }).loose(),
  payer: z.object({ email: z.string().nullish(), phone: z.string().nullish() }).loose().nullish(),
}).loose();
export type WebhookPayload = z.infer<typeof webhookSchema>;
