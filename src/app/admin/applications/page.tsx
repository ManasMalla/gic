import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminFrame, btn, select, input, NoAccess, td, th } from "@/components/admin/frame";
import { createApplication } from "../actions";
import { requireStaff, staffJson } from "@/lib/staff";

export const metadata: Metadata = { title: "Applications", robots: { index: false } };
type Q = { q?: string; track?: string; status?: string; referral?: string; deck?: string; video?: string; submitted?: string; page?: string; notice?: string; error?: string };
type Row = { reference: string; track: string; status: string; teamName: string; institution: string; ownerEmail: string | null; theme: string | null; ideaTitle: string | null; referralCode: string | null; createdAt: string; hasDeck: boolean; hasVideoFile: boolean; hasVideoLink: boolean; submittedAt: string | null };

export default function Page({ searchParams }: { searchParams: Promise<Q> }) {
  return <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: Promise<Q> }) {
  const sp = await searchParams;
  const { user, me } = await requireStaff("/admin/applications");
  if (!me) return <NoAccess email={user.email} />;
  const qs = new URLSearchParams(Object.entries({ q: sp.q, track: sp.track, status: sp.status, referral: sp.referral, deck: sp.deck, video: sp.video, submitted: sp.submitted, page: sp.page }).filter(([, v]) => v) as [string, string][]);
  const data = await staffJson<{ total: number; page: number; pageSize: number; applications: Row[] }>(user.email, `/applications?${qs}`);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const link = (p: number) => `/admin/applications?${new URLSearchParams({ ...Object.fromEntries(qs), page: String(p) })}`;

  return (
    <AdminFrame me={me} active="applications" title={`Applications (${data.total})`} notice={sp.notice} error={sp.error}>
      <form className="flex flex-wrap items-end gap-3" action="/admin/applications">
        <input name="q" defaultValue={sp.q} placeholder="Search team, institution, email, reference…" className={`${input} w-80`} />
        <select name="track" defaultValue={sp.track ?? ""} className={select}><option value="">All tracks</option><option value="junior">Junior</option><option value="main">Senior</option></select>
        <select name="status" defaultValue={sp.status ?? ""} className={select}><option value="">All statuses</option><option value="awaiting_payment">Awaiting payment</option><option value="paid">Paid</option><option value="refunded">Refunded</option></select>
        <select name="deck" defaultValue={sp.deck ?? ""} className={select} aria-label="Pitch deck"><option value="">Deck: any</option><option value="yes">Deck uploaded</option><option value="no">No deck</option></select>
        <select name="video" defaultValue={sp.video ?? ""} className={select} aria-label="Pitch video"><option value="">Video: any</option><option value="any">Has a video (link or file)</option><option value="link">Video link</option><option value="file">Video file</option><option value="none">No video</option></select>
        <select name="submitted" defaultValue={sp.submitted ?? ""} className={select} aria-label="Submission"><option value="">Submission: any</option><option value="yes">Submitted</option><option value="no">Not submitted</option></select>
        <input name="referral" defaultValue={sp.referral} placeholder="Referral code" className={`${input} w-40 font-mono uppercase`} />
        <button className={btn}>Filter</button>
        {Object.entries({ q: sp.q, track: sp.track, status: sp.status, referral: sp.referral, deck: sp.deck, video: sp.video, submitted: sp.submitted }).some(([, v]) => v) && (
          <Link href="/admin/applications" className="text-sm font-semibold text-brand underline">Clear filters</Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[64rem]">
          <thead><tr><th className={th}>Team</th><th className={th}>Track</th><th className={th}>Status</th><th className={th}>Idea</th><th className={th}>Deck</th><th className={th}>Video</th><th className={th}>Submitted</th><th className={th}>Referral</th><th className={th}>Sign-in</th></tr></thead>
          <tbody>
            {data.applications.map((a) => (
              <tr key={a.reference} className="border-t border-line">
                <td className={td}><Link href={`/admin/applications/${a.reference}`} className="font-semibold text-brand underline">{a.teamName}</Link><div className="text-xs text-muted">{a.institution} · <span className="font-mono">{a.reference}</span></div></td>
                <td className={`${td} capitalize`}>{a.track}</td>
                <td className={td}>{a.status.replace("_", " ")}</td>
                <td className={td}>{a.ideaTitle ?? "—"}<div className="text-xs text-muted">{a.theme ?? ""}</div></td>
                <td className={td}>{a.hasDeck ? "✓" : "—"}</td><td className={td}>{a.hasVideoFile && a.hasVideoLink ? "link + file" : a.hasVideoFile ? "file" : a.hasVideoLink ? "link" : "—"}</td><td className={td}>{a.submittedAt ? "✓" : "—"}</td>
                <td className={`${td} font-mono`}>{a.referralCode ?? ""}</td>
                <td className={`${td} break-all`}>{a.ownerEmail}</td>
              </tr>
            ))}
            {data.applications.length === 0 && <tr><td className={td} colSpan={9}>Nothing matches.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <p className="mt-4 flex items-center gap-4 text-sm">
          {data.page > 1 && <Link href={link(data.page - 1)} className="font-semibold text-brand underline">← Previous</Link>}
          <span className="text-muted">Page {data.page} of {pages}</span>
          {data.page < pages && <Link href={link(data.page + 1)} className="font-semibold text-brand underline">Next →</Link>}
        </p>
      )}

      <details className="mt-12 rounded-card border border-line bg-white p-5">
        <summary className="cursor-pointer font-display text-xl font-bold">Add an application manually</summary>
        <form action={createApplication} className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field name="ownerEmail" label="Sign-in (owner) email" type="email" required />
          <label className="text-sm font-semibold">Track<select name="track" required className={`${select} mt-1 block w-full`}><option value="junior">Junior</option><option value="main">Senior</option></select></label>
          <Field name="teamName" label="Team name" required /><Field name="institution" label="Institution" required />
          <Field name="address" label="Address" required /><Field name="cityState" label="City & state" required />
          <Field name="referralCode" label="Referral code" />
          <span />
          {(["founder", "cofounder"] as const).map((p) => (
            <div key={p} className="space-y-3 rounded-xl border border-line p-4 sm:col-span-1">
              <p className="font-bold">{p === "founder" ? "Lead" : "Co-lead"}</p>
              <Field name={`${p}Name`} label="Name" required /><Field name={`${p}Course`} label="Course & year" required />
              <Field name={`${p}Email`} label="Email" type="email" required /><Field name={`${p}Phone`} label="Mobile (digits)" required />
              <label className="text-sm font-semibold">Gender<select name={`${p}Gender`} required className={`${select} mt-1 block w-full`}><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></label>
            </div>
          ))}
          <div className="sm:col-span-2"><button className={btn}>Create application</button></div>
        </form>
      </details>
    </AdminFrame>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="block text-sm font-semibold">{label}<input name={name} type={type} required={required} className={`${input} mt-1 block w-full`} /></label>;
}
