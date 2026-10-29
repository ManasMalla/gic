import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminFrame, btn, select, btnDanger, input, NoAccess, td, th } from "@/components/admin/frame";
import { removeUser, setRole } from "../actions";
import { can, requireStaff, ROLE_LABEL, staffJson, type Role } from "@/lib/staff";

export const metadata: Metadata = { title: "Team & roles", robots: { index: false } };
type User = { email: string; role: Role; locked: boolean; createdBy?: string | null };

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  return <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { notice, error } = await searchParams;
  const { user, me } = await requireStaff("/admin/team");
  if (!me) return <NoAccess email={user.email} />;
  if (!can(me, "roles")) return <NoAccess email={`${user.email} (only super admins manage roles)`} />;
  const { users } = await staffJson<{ users: User[] }>(user.email, "/users");

  return (
    <AdminFrame me={me} active="team" title="Team & roles" notice={notice} error={error}>
      <div className="grid gap-3 text-sm text-muted sm:grid-cols-3">
        <p><strong className="text-ink">Super admin</strong> — everything, and assigns roles.</p>
        <p><strong className="text-ink">Admin</strong> — all counts, referral codes, applications and submissions (view, edit, delete).</p>
        <p><strong className="text-ink">Core team</strong> — creates referral codes and sees registrations per track only.</p>
      </div>
      <form action={setRole} className="mt-8 flex flex-wrap items-end gap-3 rounded-card border border-line bg-white p-5">
        <label className="text-sm font-semibold">Google account email
          <input name="email" type="email" required placeholder="name@example.com" className={`${input} mt-1 block w-72`} />
        </label>
        <label className="text-sm font-semibold">Role
          <select name="role" defaultValue="core" className={`${select} mt-1 block`}>
            <option value="core">Core team</option><option value="admin">Admin</option><option value="super_admin">Super admin</option>
          </select>
        </label>
        <button className={btn}>Add / change role</button>
      </form>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[32rem]">
          <thead><tr><th className={th}>Email</th><th className={th}>Role</th><th className={th} /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-t border-line">
                <td className={`${td} break-all`}>{u.email}</td>
                <td className={td}>{ROLE_LABEL[u.role]}{u.locked && <span className="ml-2 text-xs text-muted">(set in server config)</span>}</td>
                <td className={td}>{!u.locked && u.email !== user.email && (
                  <form action={removeUser}><input type="hidden" name="email" value={u.email} /><ConfirmButton message={`Remove ${u.email}'s access?`} className={btnDanger}>Remove access</ConfirmButton></form>
                )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminFrame>
  );
}
