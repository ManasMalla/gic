import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { backend } from "@/lib/backend";

export type Role = "super_admin" | "admin" | "core";
export type Me = { email: string; role: Role; permissions: string[] };

export const ROLE_LABEL: Record<Role, string> = { super_admin: "Super admin", admin: "Admin", core: "Core team" };

/** The signed-in user and their staff role (null = signed in but not staff). Redirects to sign-in when anonymous. */
export async function requireStaff(next = "/admin") {
  const user = await getSession();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  const res = await backend("/api/staff/me", user.email);
  if (res.status === 403) return { user, me: null as Me | null };
  if (!res.ok) throw new Error(`backend /api/staff/me -> ${res.status}`);
  return { user, me: (await res.json()) as Me | null };
}

export const can = (me: Me, permission: string) => me.permissions.includes(permission);

/** GET (or any method) against /api/staff/* as the signed-in staff member. Throws on unexpected statuses. */
export async function staffJson<T>(email: string, path: string, init?: RequestInit): Promise<T> {
  const res = await backend(`/api/staff${path}`, email, init);
  if (!res.ok) throw new Error(`backend /api/staff${path} -> ${res.status}`);
  return (await res.json()) as T;
}
