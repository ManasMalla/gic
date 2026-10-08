import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { RegistrationWizard } from "@/components/register/registration-wizard";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Register",
  description: "Register your team for the GITAM Innovation Challenge 2026.",
};

export default function RegisterPage() {
  return (
    <>
      <section className="bg-forest py-14 text-white sm:py-20">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-mint">Registration</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Register your team</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Four short steps, then pay the fee on GITAM GEvents. Registration closes {site.registration.closes}.
          </p>
        </Container>
      </section>
      <section className="py-14 sm:py-20">
        <Container>
          <Suspense fallback={<p className="text-center text-muted">Loading form…</p>}>
            <RegistrationWizard />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
