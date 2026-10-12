import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminFrame, btn, input, NoAccess } from "@/components/admin/frame";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { assignPayment, dismissPayment, reconcilePayments } from "../actions";
import { can, requireStaff, staffJson } from "@/lib/staff";

export const metadata: Metadata = { title: "Payments to review", robots: { index: false } };
type P = {
  id: string; event_type: string; transaction_id: string | null; match_status: string; flags: string[]; amount: number | null; currency: string | null;
  occurred_at: string; payer: { name?: string; email?: string; phone?: string } | null;
};

const WHY: Record<string, string> = {
  no_candidate: "No registered team has this payer's email.",
  ambiguous_email: "More than one team matches this email.",
  amount_mismatch: "The amount differs from the track fee.",
  track_mismatch: "The track on the payment differs from the team's.",
  already_paid: "The team is already marked paid.",
  reference_invalid: "The reference sent with the payment is invalid.",
  reference_not_found: "No team has the reference sent with the payment.",
};

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  return <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { notice, error } = await searchParams;
  const { user, me } = await requireStaff("/admin/payments");
  if (!me) return <NoAccess email={user.email} />;
  if (!can(me, "applications")) return <NoAccess email={`${user.email} (admins only)`} />;
  const { payments } = await staffJson<{ payments: P[] }>(user.email, "/payments");

  return (
    <AdminFrame me={me} active="payments" title={`Payments to review (${payments.length})`} notice={notice} error={error}>
      <p className="max-w-3xl text-muted">
        GEvents tells us about every payment. When we can&apos;t match one to a registered team with certainty (usually because the payer used an email that
        isn&apos;t on any team), it waits here instead of guessing. <strong className="text-ink">Assign</strong> it to the right team (the team is then marked paid for a
        successful payment), or <strong className="text-ink">dismiss</strong> it if it needs nothing, such as a failed attempt or a test.
      </p>
      <form action={reconcilePayments} className="mt-5 flex flex-wrap items-center gap-3">
        <button className={btn}>Re-run matching</button>
        <span className="text-sm text-muted">Matches waiting payments to teams that registered after paying. Runs automatically whenever a team registers.</span>
      </form>
      <div className="mt-8 space-y-5">
        {payments.map((p) => (
          <div key={p.id} className="rounded-card border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl font-bold">
                {p.amount != null ? `₹${p.amount / 100}` : "—"}{" "}
                <span className={`text-sm font-semibold ${p.event_type === "payment.succeeded" ? "text-brand" : "text-coral"}`}>{p.event_type.replace("payment.", "")}</span>
              </p>
              <p className="text-sm text-muted">{new Date(p.occurred_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST</p>
            </div>
            <p className="mt-2 text-sm">
              <strong>{p.payer?.name ?? "Unknown payer"}</strong> · <span className="break-all">{p.payer?.email ?? "no email"}</span>{p.payer?.phone && ` · ${p.payer.phone}`}
            </p>
            <p className="mt-1 break-all font-mono text-xs text-muted">{p.transaction_id}</p>
            <p className="mt-2 text-sm text-muted">{p.flags.map((f) => WHY[f] ?? f).join(" ")}
              {p.payer?.email && <> <Link className="font-semibold text-brand underline" href={`/admin/applications?q=${encodeURIComponent(p.payer.email)}`}>Search teams by this email</Link></>}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <form action={assignPayment} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={p.id} />
                <label className="text-sm font-semibold">Team reference<input name="reference" required placeholder="GIC26-XXXXXXXX-X" className={`${input} mt-1 block w-52 font-mono uppercase`} /></label>
                <label className="text-sm font-semibold">Note<input name="note" maxLength={200} className={`${input} mt-1 block w-56`} /></label>
                <ConfirmButton message="Assign this payment to that team?" className={btn}>Assign to team</ConfirmButton>
              </form>
              <form action={dismissPayment} className="flex items-end gap-3">
                <input type="hidden" name="id" value={p.id} />
                <label className="text-sm font-semibold">Note<input name="note" maxLength={200} placeholder="why it needs nothing" className={`${input} mt-1 block w-56`} /></label>
                <ConfirmButton message="Dismiss this payment? It leaves the review list." className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:bg-black/5">Dismiss</ConfirmButton>
              </form>
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="rounded-xl bg-mint-soft p-5 text-sm font-medium text-brand">Nothing to review. Every payment is matched to a team.</p>}
      </div>
    </AdminFrame>
  );
}
