import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminFrame, btn, btnDanger, input, NoAccess, td, th } from "@/components/admin/frame";
import { createReferral, deleteReferral, updateReferral } from "../actions";
import { can, requireStaff, staffJson } from "@/lib/staff";

export const metadata: Metadata = { title: "Referral codes", robots: { index: false } };
type Code = { code: string; label: string; active: boolean; createdAt: string; registrations?: number; paid?: number };

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  return <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { notice, error } = await searchParams;
  const { user, me } = await requireStaff("/admin/referrals");
  if (!me) return <NoAccess email={user.email} />;
  const { codes } = await staffJson<{ codes: Code[] }>(user.email, "/referrals");
  const manage = can(me, "referralsManage");

  return (
    <AdminFrame me={me} active="referrals" title="Referral codes" notice={notice} error={error}>
      <form action={createReferral} className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-white p-5">
        <label className="text-sm font-semibold">Issued to / note
          <input name="label" maxLength={100} placeholder="e.g. VIT campus ambassador" className={`${input} mt-1 block w-72`} />
        </label>
        <label className="text-sm font-semibold">Custom code (optional)
          <input name="code" maxLength={30} placeholder="auto-generated" className={`${input} mt-1 block w-48 font-mono uppercase`} />
        </label>
        <button className={btn}>Generate code</button>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[40rem]">
          <thead><tr><th className={th}>Code</th><th className={th}>Note</th><th className={th}>Created</th>{manage && <><th className={th}>Registrations</th><th className={th}>Paid</th><th className={th}>Active</th><th className={th} /></>}</tr></thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code} className="border-t border-line">
                <td className={`${td} font-mono font-bold`}>{c.code}</td>
                {manage ? (
                  <>
                    <td className={td} colSpan={1}>
                      <form id={`f-${c.code}`} action={updateReferral}><input type="hidden" name="code" value={c.code} />
                        <input name="label" defaultValue={c.label} maxLength={100} className={`${input} w-56`} /></form>
                    </td>
                    <td className={td}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className={td}>{c.registrations}</td><td className={td}>{c.paid}</td>
                    <td className={td}><input form={`f-${c.code}`} type="checkbox" name="active" defaultChecked={c.active} aria-label={`${c.code} active`} className="size-4 accent-brand" /></td>
                    <td className={`${td} whitespace-nowrap`}>
                      <button form={`f-${c.code}`} className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/10">Save</button>
                      <form action={deleteReferral} className="inline"><input type="hidden" name="code" value={c.code} /><ConfirmButton message={`Delete ${c.code}? Teams already registered with it keep their record, but new sign-ups can no longer use it.`} className={btnDanger}>Delete</ConfirmButton></form>
                    </td>
                  </>
                ) : (
                  <><td className={td}>{c.label || "—"}</td><td className={td}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td></>
                )}
              </tr>
            ))}
            {codes.length === 0 && <tr><td className={td} colSpan={7}>No codes yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {!manage && <p className="mt-4 text-sm text-muted">You can see the codes you created. Usage numbers are visible to admins only.</p>}
    </AdminFrame>
  );
}
