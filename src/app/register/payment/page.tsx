import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getSession } from "@/lib/auth/session";
import { fetchMyApplication } from "@/lib/backend";
import { paymentUrl } from "@/lib/gevents";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Payment" };

export default function PaymentPage() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <Body />
        </Suspense>
      </Container>
    </section>
  );
}

async function Body() {
  const user = await getSession();
  if (!user) redirect("/signin?next=/register/payment");
  const app = await fetchMyApplication(user.email);
  if (!app) redirect("/register");
  if (app.status === "paid") redirect("/portal");

  const fee = app.amountDue / 100;
  const failed = app.lastPayment?.type === "payment.failed";

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Step 2 of 3</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Pay the registration fee</h1>
      <p className="mt-3 text-muted">
        Team <strong className="text-ink">{app.team.teamName}</strong> is saved. Pay the fee on GITAM GEvents to confirm your place. We&apos;ll unlock your portal as soon as the payment is confirmed.
      </p>

      {failed && (
        <p role="alert" className="mt-6 rounded-xl bg-coral/10 p-4 text-sm font-medium text-coral">
          Your last payment attempt didn&apos;t go through. You can try again below.
        </p>
      )}

      <dl className="mt-8 grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-3">
        <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-muted">Track</dt><dd className="mt-1 font-display text-xl font-bold capitalize">{app.track}</dd></div>
        <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-muted">Fee</dt><dd className="mt-1 font-display text-xl font-bold">₹{fee.toLocaleString("en-IN")}</dd></div>
        <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-muted">Your reference</dt><dd className="mt-1 font-mono text-lg font-bold text-brand">{app.reference}</dd></div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={paymentUrl({ reference: app.reference, track: app.track })} external>Pay on GEvents ↗</ButtonLink>
        <ButtonLink href="/register/payment-status" variant="ghost">I&apos;ve paid — check status</ButtonLink>
      </div>
      <p className="mt-6 text-sm text-muted">
        On GEvents, quote the reference above if asked. Questions? <a className="font-semibold text-brand underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
      </p>
    </div>
  );
}
