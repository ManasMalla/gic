import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { TeamWizard } from "@/components/register/registration-wizard";
import { SignInCard } from "@/components/register/sign-in-card";
import { getSession } from "@/lib/auth/session";
import { fetchMyApplication, fetchPendingPayment } from "@/lib/backend";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Register",
  description: "Register your team for the GITAM Innovation Challenge 2026.",
};

export default function RegisterPage({ searchParams }: { searchParams: Promise<{ track?: string; paid?: string }> }) {
  return (
    <>
      <section className="bg-forest py-14 text-white sm:py-20">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-mint">Registration</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Register your team</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Four steps: register your team, pay the fee on GEvents, then submit your idea in the team portal. Payment is not the last step.
            Registration closes {site.registration.closes}.
          </p>
        </Container>
      </section>
      <section className="py-14 sm:py-20">
        <Container>
          <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
            <Entry searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

/** Routes the visitor to the right place for where they are in the journey. */
async function Entry({ searchParams }: { searchParams: Promise<{ track?: string; paid?: string }> }) {
  const { track, paid } = await searchParams;
  const defaultTrack = track === "junior" || track === "main" ? track : "";
  const user = await getSession();
  if (!user) return <SignInCard next={`/register${defaultTrack ? `?track=${defaultTrack}` : paid === "1" ? "?paid=1" : ""}`} />;

  const app = await fetchMyApplication(user.email);
  if (app?.status === "paid") redirect("/portal");
  if (app) redirect("/register/payment");
  // Paid first (e.g. from a poster link straight to GEvents): the fee is already in, so the flow is 3 (done) -> 1 -> 2 -> 4.
  // GEvents sends people back with ?paid=1 (via the payment-status page); we also recognise a waiting payment from this very email.
  const paidFirst = paid === "1" || !!(await fetchPendingPayment(user.email));
  return <TeamWizard defaultTrack={defaultTrack} email={user.email} paidFirst={paidFirst} />;
}
