import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminFrame, btn, select, btnDanger, input, NoAccess, td, th } from "@/components/admin/frame";
import { deleteApplication, saveApplication } from "../../actions";
import { backend } from "@/lib/backend";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Application", robots: { index: false } };
const THEMES = [["planet-sustainability", "Planet & Sustainability"], ["bio-economy", "Bio Economy & Agriculture"], ["deeptech-manufacturing", "DeepTech & Manufacturing"], ["sports-fitness", "Sports & Fitness"], ["d2c-consumer", "D2C & Consumer Brands"]];

type App = {
  reference: string; track: string; status: string; teamName: string; institution: string; ownerEmail: string | null; referralCode: string | null;
  theme: string | null; ideaTitle: string | null; problemStatement: string | null; ideaSummary: string | null; pitchVideoLink: string | null;
  createdAt: string; paidAt: string | null; submittedAt: string | null; amountDue: number; ideaUpdatedAt: string | null;
  contacts: { role: string; email: string; phone: string }[];
  file: { filename: string; size: number; publicUrl: string | null } | null;
  video: { filename: string; size: number; publicUrl: string } | null;
  payments: { id: string; type: string; transactionId: string | null; amount: number | null; status: string; occurredAt: string }[];
};

export default function Page({ params, searchParams }: { params: Promise<{ reference: string }>; searchParams: Promise<{ notice?: string; error?: string }> }) {
  return <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}><Body params={params} searchParams={searchParams} /></Suspense>;
}

async function Body({ params, searchParams }: { params: Promise<{ reference: string }>; searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { reference } = await params;
  const { notice, error } = await searchParams;
  const { user, me } = await requireStaff(`/admin/applications/${reference}`);
  if (!me) return <NoAccess email={user.email} />;
  const res = await backend(`/api/staff/applications/${encodeURIComponent(reference)}`, user.email);
  if (res.status === 404) notFound();
  if (res.status === 403) return <NoAccess email={user.email} />;
  if (!res.ok) throw new Error(`application -> ${res.status}`);
  const a = (await res.json()) as App;
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : "—");

  return (
    <AdminFrame me={me} active="applications" title={a.teamName} notice={notice} error={error}>
      <p className="mb-6 text-sm"><Link href="/admin/applications" className="font-semibold text-brand underline">← All applications</Link></p>
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <form action={saveApplication} className="space-y-4">
          <input type="hidden" name="reference" value={a.reference} />
          <div className="grid gap-4 sm:grid-cols-2">
            <T name="teamName" label="Team name" v={a.teamName} /><T name="institution" label="Institution" v={a.institution} />
            <label className="text-sm font-semibold">Status<select name="status" defaultValue={a.status} className={`${select} mt-1 block w-full`}><option value="awaiting_payment">Awaiting payment</option><option value="paid">Paid</option><option value="refunded">Refunded</option></select></label>
            <T name="referralCode" label="Referral code" v={a.referralCode ?? ""} mono />
          </div>
          <h2 className="pt-4 font-display text-2xl font-bold">Submission</h2>
          <label className="block text-sm font-semibold">Theme<select name="theme" defaultValue={a.theme ?? ""} className={`${select} mt-1 block w-full`}><option value="">— none —</option>{THEMES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <T name="ideaTitle" label="Idea title" v={a.ideaTitle ?? ""} />
          <A name="problemStatement" label="Problem statement" v={a.problemStatement ?? ""} />
          <A name="ideaSummary" label="Idea summary" v={a.ideaSummary ?? ""} rows={6} />
          <T name="pitchVideoLink" label="Pitch video link" v={a.pitchVideoLink ?? ""} />
          <div className="flex items-center gap-3 pt-2">
            <button className={btn}>Save changes</button>
          </div>
        </form>

        <aside className="space-y-6 self-start">
          <div className="rounded-card border border-line bg-white p-5 text-sm">
            <p className="font-mono font-bold text-brand">{a.reference}</p>
            <dl className="mt-3 space-y-2">
              <div><dt className="text-muted">Track</dt><dd className="font-semibold capitalize">{a.track} · ₹{a.amountDue / 100}</dd></div>
              <div><dt className="text-muted">Sign-in account</dt><dd className="break-all font-semibold">{a.ownerEmail ?? "—"}</dd></div>
              <div><dt className="text-muted">Registered</dt><dd>{fmt(a.createdAt)}</dd></div>
              <div><dt className="text-muted">Paid</dt><dd>{fmt(a.paidAt)}</dd></div>
              <div><dt className="text-muted">Submitted</dt><dd>{fmt(a.submittedAt)}</dd></div>
              <div><dt className="text-muted">Idea last edited</dt><dd>{fmt(a.ideaUpdatedAt)}</dd></div>
              <div><dt className="text-muted">Pitch deck</dt><dd>{a.file ? <a className="font-semibold text-brand underline" href={a.file.publicUrl ?? `/admin/applications/${a.reference}/deck`}>{a.file.filename} ({Math.round(a.file.size / 1024)} KB)</a> : "Not uploaded"}</dd></div>
              {a.video && <div><dt className="text-muted">Video file</dt><dd><a className="break-all font-semibold text-brand underline" href={a.video.publicUrl} target="_blank" rel="noopener noreferrer">{a.video.filename} ({Math.round(a.video.size / 1024 / 1024 * 10) / 10} MB)</a></dd></div>}
              {a.pitchVideoLink && <div><dt className="text-muted">Video</dt><dd><a className="break-all font-semibold text-brand underline" href={a.pitchVideoLink} target="_blank" rel="noopener noreferrer">{a.pitchVideoLink}</a></dd></div>}
            </dl>
          </div>
          <div className="rounded-card border border-line bg-white p-5 text-sm">
            <p className="font-bold">Contacts</p>
            <ul className="mt-2 space-y-1">{a.contacts.map((c, i) => <li key={i}><span className="text-muted">{c.role}</span> · <span className="break-all">{c.email}</span>{c.phone && ` · ${c.phone}`}</li>)}</ul>
          </div>
          <div className="rounded-card border border-line bg-white p-5 text-sm">
            <p className="font-bold">Payments</p>
            {a.payments.length ? <table className="mt-2 w-full"><thead><tr><th className={th}>When</th><th className={th}>₹</th><th className={th}>Event</th></tr></thead><tbody>{a.payments.map((p) => <tr key={p.id} className="border-t border-line"><td className={td}>{fmt(p.occurredAt)}</td><td className={td}>{p.amount != null ? p.amount / 100 : "—"}</td><td className={td}>{p.type.replace("payment.", "")}</td></tr>)}</tbody></table> : <p className="mt-2 text-muted">None linked.</p>}
          </div>
          <form action={deleteApplication}>
            <input type="hidden" name="reference" value={a.reference} />
            <ConfirmButton message={`Permanently delete ${a.teamName} (${a.reference})?`} className={btnDanger}>Delete this application…</ConfirmButton>
            <p className="px-3 text-xs text-muted">Deletes the team, its contacts and deck. Linked payments stay in the review queue.</p>
          </form>
        </aside>
      </div>
    </AdminFrame>
  );
}

function T({ name, label, v, mono }: { name: string; label: string; v: string; mono?: boolean }) {
  return <label className="block text-sm font-semibold">{label}<input name={name} defaultValue={v} className={`${input} mt-1 block w-full ${mono ? "font-mono uppercase" : ""}`} /></label>;
}
function A({ name, label, v, rows = 3 }: { name: string; label: string; v: string; rows?: number }) {
  return <label className="block text-sm font-semibold">{label}<textarea name={name} defaultValue={v} rows={rows} className={`${input} mt-1 block w-full`} /></label>;
}
