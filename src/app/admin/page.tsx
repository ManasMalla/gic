import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminFrame, NoAccess, td, th } from "@/components/admin/frame";
import { can, requireStaff, staffJson } from "@/lib/staff";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

type Stats = {
  perTrack: { junior: number; main: number };
  total?: number;
  byStatus?: { track: string; status: string; count: number }[];
  referrals?: { code: string; registrations: number; paid: number }[];
  paymentsNeedingReview?: number;
};

export default function AdminHome() {
  return <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}><Body /></Suspense>;
}

async function Body() {
  const { user, me } = await requireStaff("/admin");
  if (!me) return <NoAccess email={user.email} />;
  const s = await staffJson<Stats>(user.email, "/stats");
  const full = can(me, "statsFull");
  const n = (track: string, status: string) => s.byStatus?.find((r) => r.track === track && r.status === status)?.count ?? 0;

  return (
    <AdminFrame me={me} active="overview" title="Registrations">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Junior track" value={s.perTrack.junior} note={full ? `${n("junior", "paid")} paid` : undefined} />
        <Card label="Main track" value={s.perTrack.main} note={full ? `${n("main", "paid")} paid` : undefined} />
        {full && <Card label="Total" value={s.total ?? 0} note={`${s.paymentsNeedingReview ?? 0} payments need review`} href={s.paymentsNeedingReview ? "/admin/payments" : undefined} />}
      </div>
      {!full && <p className="mt-6 text-sm text-muted">Your role shows the number of registrations per track. Create referral codes from the Referral codes tab.</p>}
      {full && (
        <>
          <h2 className="mt-12 font-display text-2xl font-bold">By status</h2>
          <table className="mt-3 w-full max-w-xl text-left"><thead><tr><th className={th}>Track</th><th className={th}>Awaiting payment</th><th className={th}>Paid</th><th className={th}>Refunded</th></tr></thead>
            <tbody>{(["junior", "main"] as const).map((t) => (
              <tr key={t} className="border-t border-line"><td className={`${td} font-semibold capitalize`}>{t}</td><td className={td}>{n(t, "awaiting_payment")}</td><td className={td}>{n(t, "paid")}</td><td className={td}>{n(t, "refunded")}</td></tr>
            ))}</tbody></table>
          <h2 className="mt-12 font-display text-2xl font-bold">Referral codes in use</h2>
          {s.referrals?.length ? (
            <table className="mt-3 w-full max-w-xl text-left"><thead><tr><th className={th}>Code</th><th className={th}>Registrations</th><th className={th}>Paid</th></tr></thead>
              <tbody>{s.referrals.sort((a, b) => b.registrations - a.registrations).map((r) => (
                <tr key={r.code} className="border-t border-line"><td className={`${td} font-mono`}>{r.code}</td><td className={td}>{r.registrations}</td><td className={td}>{r.paid}</td></tr>
              ))}</tbody></table>
          ) : <p className="mt-3 text-sm text-muted">No team has used a referral code yet.</p>}
        </>
      )}
    </AdminFrame>
  );
}

function Card({ label, value, note, href }: { label: string; value: number; note?: string; href?: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-6 shadow-card">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-display text-5xl font-bold text-brand">{value}</p>
      {note && (href ? <Link href={href} className="mt-1 block text-sm font-semibold text-brand underline">{note} →</Link> : <p className="mt-1 text-sm text-muted">{note}</p>)}
    </div>
  );
}
