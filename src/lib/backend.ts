import "server-only";

export type MyApplication = {
  reference: string;
  track: "junior" | "main";
  status: "awaiting_payment" | "paid" | "refunded";
  amountDue: number; // paise
  createdAt: string;
  paidAt: string | null;
  team: { teamName: string; institution: string };
  founderEmail: string | null;
  founder: { name: string | null; email: string | null; phone: string | null; gender: string | null } | null;
  lastPayment: { type: "payment.succeeded" | "payment.failed" | "payment.refunded"; at: string } | null;
  idea: { theme: string | null; ideaTitle: string | null; problemStatement: string | null; ideaSummary: string | null; pitchVideoLink: string | null };
  deck: { filename: string; size: number } | null;
  ideaComplete: boolean;
  ideaUpdatedAt: string | null;
  ideaEditDeadline: string;
  canEditIdea: boolean;
};

const base = () => {
  const url = process.env.BACKEND_URL;
  const token = process.env.INTERNAL_API_TOKEN;
  if (!url || !token) throw new Error("BACKEND_URL and INTERNAL_API_TOKEN must be set");
  return { url, token };
};

/** Calls the Deno backend on behalf of a signed-in user. `email` MUST come from a verified session, never from request input. */
export function backend(path: string, email: string, init: RequestInit = {}) {
  const { url, token } = base();
  return fetch(new URL(path, url), {
    ...init,
    cache: "no-store",
    headers: { ...init.headers, "x-internal-token": token, "x-user-email": email },
  });
}

export async function fetchMyApplication(email: string): Promise<MyApplication | null> {
  const res = await backend("/api/me/application", email);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`backend /api/me/application -> ${res.status}`);
  return (await res.json()) as MyApplication;
}
