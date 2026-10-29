"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { backend } from "@/lib/backend";

/** Every action re-checks the session; the BACKEND decides what the role may do (403 = not allowed). */
async function call(path: string, method: string, body?: unknown) {
  const user = await getSession();
  if (!user) redirect("/signin?next=/admin");
  const res = await backend(`/api/staff${path}`, user.email, {
    method,
    ...(body !== undefined ? { headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const msg = (r: { status: number; data: { errors?: Record<string, string>; message?: string; error?: string } }) =>
  r.status === 403 ? "You don't have permission to do that."
    : Object.values(r.data.errors ?? {})[0] ?? r.data.message ?? r.data.error ?? "Something went wrong.";

function done(path: string, ok: boolean, text: string): never {
  revalidatePath("/admin", "layout");
  // A "#anchor" must stay at the very end of the URL, after the query string.
  const [base, hash] = path.split("#");
  redirect(`${base}${base.includes("?") ? "&" : "?"}${ok ? "notice" : "error"}=${encodeURIComponent(text)}${hash ? `#${hash}` : ""}`);
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createReferral(fd: FormData) {
  const r = await call("/referrals", "POST", { label: str(fd, "label"), code: str(fd, "code") });
  done("/admin/referrals", r.ok, r.ok ? `Created ${r.data.code}` : msg(r));
}
export async function updateReferral(fd: FormData) {
  const code = str(fd, "code");
  const r = await call(`/referrals/${encodeURIComponent(code)}`, "PATCH", { label: str(fd, "label"), active: fd.get("active") === "on" });
  done("/admin/referrals", r.ok, r.ok ? `Saved ${code}` : msg(r));
}
export async function deleteReferral(fd: FormData) {
  const code = str(fd, "code");
  const r = await call(`/referrals/${encodeURIComponent(code)}`, "DELETE");
  done("/admin/referrals", r.ok, r.ok ? `Deleted ${code}` : msg(r));
}

export async function saveApplication(fd: FormData) {
  const ref = str(fd, "reference");
  const nullable = (k: string) => str(fd, k) || null;
  const r = await call(`/applications/${encodeURIComponent(ref)}`, "PATCH", {
    teamName: str(fd, "teamName"), institution: str(fd, "institution"), status: str(fd, "status"),
    referralCode: nullable("referralCode"), theme: nullable("theme"), ideaTitle: nullable("ideaTitle"),
    problemStatement: nullable("problemStatement"), ideaSummary: nullable("ideaSummary"), pitchVideoLink: nullable("pitchVideoLink"),
  });
  done(`/admin/applications/${ref}`, r.ok, r.ok ? "Saved" : msg(r));
}
export async function deleteApplication(fd: FormData) {
  const ref = str(fd, "reference");
  const r = await call(`/applications/${encodeURIComponent(ref)}`, "DELETE");
  done(r.ok ? "/admin/applications" : `/admin/applications/${ref}`, r.ok, r.ok ? `Deleted ${ref}` : msg(r));
}
export async function createApplication(fd: FormData) {
  const person = (p: string) => ({ name: str(fd, `${p}Name`), courseYear: str(fd, `${p}Course`), email: str(fd, `${p}Email`), phone: str(fd, `${p}Phone`), gender: str(fd, `${p}Gender`) });
  const blank = { name: "", courseYear: "", email: "", phone: "", gender: "" };
  const r = await call("/applications", "POST", {
    ownerEmail: str(fd, "ownerEmail"), track: str(fd, "track"), teamName: str(fd, "teamName"), institution: str(fd, "institution"),
    address: str(fd, "address"), cityState: str(fd, "cityState"), referralCode: str(fd, "referralCode"),
    founder: person("founder"), cofounder: person("cofounder"), member3: blank, member4: blank, member5: blank, member6: blank,
  });
  if (r.ok) done(`/admin/applications/${r.data.reference}`, true, "Created");
  done("/admin/applications", false, msg(r));
}

export async function setRole(fd: FormData) {
  const r = await call("/users", "PUT", { email: str(fd, "email"), role: str(fd, "role") });
  done("/admin/team", r.ok, r.ok ? "Role saved" : msg(r));
}
export async function removeUser(fd: FormData) {
  const email = str(fd, "email");
  const r = await call(`/users/${encodeURIComponent(email)}`, "DELETE");
  done("/admin/team", r.ok, r.ok ? `Removed ${email}` : msg(r));
}

export async function assignPayment(fd: FormData) {
  const r = await call(`/payments/${str(fd, "id")}/assign`, "POST", { reference: str(fd, "reference"), note: str(fd, "note") });
  done("/admin/payments", r.ok, r.ok ? `Assigned to ${r.data.reference}` : r.data.error === "invalid_reference" ? "That isn't a valid reference (it looks like GIC26-XXXXXXXX-X)." : r.data.error === "application_not_found" ? "No application has that reference." : msg(r));
}
export async function dismissPayment(fd: FormData) {
  const r = await call(`/payments/${str(fd, "id")}/dismiss`, "POST", { note: str(fd, "note") });
  done("/admin/payments", r.ok, r.ok ? "Dismissed" : msg(r));
}
export async function reconcilePayments() {
  const r = await call("/payments/reconcile", "POST");
  done("/admin/payments", r.ok, r.ok ? `Re-ran matching: ${r.data.matched} payment(s) matched to a team.` : msg(r));
}

const SLOTS = ["founder", "cofounder", "member3", "member4", "member5", "member6"] as const;
const SLOT_LABEL: Record<string, string> = { founder: "Lead", cofounder: "Co-lead", member3: "Member 3", member4: "Member 4", member5: "Member 5", member6: "Member 6" };

/** Saves the people on a team. A member slot left empty removes that member. The backend validates and enforces the role (admins only). */
export async function saveMembers(fd: FormData) {
  const ref = str(fd, "reference");
  const body = Object.fromEntries(SLOTS.map((k) => [k, {
    name: str(fd, `${k}.name`), email: str(fd, `${k}.email`), phone: str(fd, `${k}.phone`), courseYear: str(fd, `${k}.courseYear`), gender: str(fd, `${k}.gender`),
  }]));
  const r = await call(`/applications/${encodeURIComponent(ref)}/members`, "PATCH", body);
  if (r.status === 422 && r.data.errors) {
    const [field, message] = Object.entries(r.data.errors as Record<string, string>)[0];
    const [slot, what] = field.split(".");
    done(`/admin/applications/${ref}#members`, false, `${SLOT_LABEL[slot] ?? slot}, ${what}: ${message}`);
  }
  const extra = r.ok && r.data.warnings?.length ? ` Note: ${(r.data.warnings as string[]).join("; ")}.` : "";
  done(`/admin/applications/${ref}#members`, r.ok, r.ok ? `Team members saved.${extra}` : msg(r));
}
