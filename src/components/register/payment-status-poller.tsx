"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import type { MyApplication } from "@/lib/backend";

type View = { kind: "loading" } | { kind: "signin" } | { kind: "none" } | { kind: "app"; app: MyApplication } | { kind: "error" };

const POLL_MS = 4000;
const SLOW_AFTER_MS = 2 * 60 * 1000;

/** Polls our own API until the GEvents webhook has confirmed the payment. */
export function PaymentStatusPoller() {
  const ref = useSearchParams().get("ref");
  const [view, setView] = useState<View>({ kind: "loading" });
  const [startedAt] = useState(() => Date.now());
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      try {
        const res = await fetch("/api/me/application", { cache: "no-store" });
        if (stop) return;
        if (res.status === 401) return setView({ kind: "signin" });
        if (res.status === 404) return setView({ kind: "none" });
        if (!res.ok) throw new Error(String(res.status));
        const app = (await res.json()) as MyApplication;
        setView({ kind: "app", app });
        setSlow(Date.now() - startedAt > SLOW_AFTER_MS);
        if (app.status === "paid" || app.status === "refunded" || app.lastPayment?.type === "payment.failed") return; // terminal for now
      } catch {
        if (!stop) setView((v) => (v.kind === "loading" ? { kind: "error" } : v));
      }
      if (!stop) timer = setTimeout(tick, POLL_MS);
    }
    tick();
    return () => { stop = true; clearTimeout(timer); };
  }, [startedAt]);

  const box = "mx-auto max-w-xl rounded-[1.75rem] p-8 text-center sm:p-12";

  if (view.kind === "loading") return <div className={`${box} bg-white shadow-card`}><p className="text-muted">Checking your payment…</p></div>;
  if (view.kind === "signin") return (
    <div className={`${box} bg-white shadow-card`}>
      <h2 className="font-display text-3xl font-bold">Sign in to see your payment</h2>
      <p className="mt-3 text-muted">Use the same Google account you registered with.</p>
      <ButtonLink href={`/signin?next=${encodeURIComponent("/register/payment-status" + (ref ? `?ref=${ref}` : ""))}`} variant="brand" className="mt-6">Sign in</ButtonLink>
    </div>
  );
  if (view.kind === "none") return (
    <div className={`${box} bg-white shadow-card`}>
      <h2 className="font-display text-3xl font-bold">No application yet</h2>
      <p className="mt-3 text-muted">We couldn&apos;t find a team for this account.</p>
      <ButtonLink href="/register" variant="brand" className="mt-6">Register your team</ButtonLink>
    </div>
  );
  if (view.kind === "error") return (
    <div className={`${box} bg-white shadow-card`}>
      <h2 className="font-display text-3xl font-bold">Couldn&apos;t check right now</h2>
      <p className="mt-3 text-muted">Please refresh in a moment.</p>
    </div>
  );

  const { app } = view;
  if (app.status === "paid") return (
    <div className={`${box} bg-forest text-white`}>
      <p className="mx-auto grid size-14 place-items-center rounded-full bg-gold text-2xl text-ink" aria-hidden>✓</p>
      <h2 className="mt-5 font-display text-4xl font-bold">Payment confirmed</h2>
      <p className="mt-3 text-white/75">Thank you — <strong className="text-white">{app.team.teamName}</strong> is registered. Your portal is open: choose your theme and submit your idea.</p>
      <p className="mt-4 font-mono text-sm tracking-wider text-gold">{app.reference}</p>
      <ButtonLink href="/portal" className="mt-8">Open the portal →</ButtonLink>
    </div>
  );
  if (app.status === "refunded") return (
    <div className={`${box} bg-white shadow-card`}>
      <h2 className="font-display text-3xl font-bold">Payment refunded</h2>
      <p className="mt-3 text-muted">This registration was refunded. Contact the organisers if this is unexpected.</p>
    </div>
  );
  if (app.lastPayment?.type === "payment.failed") return (
    <div className={`${box} bg-white shadow-card`}>
      <h2 className="font-display text-3xl font-bold text-coral">Payment didn&apos;t go through</h2>
      <p className="mt-3 text-muted">No money has been taken for this attempt. You can try again.</p>
      <ButtonLink href="/register/payment" variant="brand" className="mt-6">Try again</ButtonLink>
    </div>
  );
  return (
    <div className={`${box} bg-white shadow-card`}>
      <span className="mx-auto block size-10 animate-spin rounded-full border-4 border-mint border-t-brand" aria-hidden />
      <h2 className="mt-6 font-display text-3xl font-bold">Waiting for confirmation…</h2>
      <p className="mt-3 text-muted">We&apos;re waiting for GEvents to confirm your payment. This page updates automatically — you can keep it open.</p>
      <p className="mt-4 font-mono text-sm tracking-wider text-brand">{app.reference}</p>
      {slow && (
        <p className="mt-6 rounded-xl bg-cream-soft p-4 text-sm text-muted">
          This is taking longer than usual. If you&apos;ve paid, don&apos;t pay again — email <a className="font-semibold text-brand underline" href="mailto:gic@gitam.edu">gic@gitam.edu</a> with your reference.
        </p>
      )}
      <ButtonLink href="/register/payment" variant="ghost" className="mt-6">Back to payment</ButtonLink>
    </div>
  );
}
