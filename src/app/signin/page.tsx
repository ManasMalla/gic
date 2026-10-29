import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { DevLogin } from "@/components/register/dev-login";
import { SignInCard } from "@/components/register/sign-in-card";
import { devLoginEnabled } from "@/lib/auth/env";
import { safeNext } from "@/lib/auth/origin";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Suspense fallback={null}>
          <Body searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = safeNext(next);
  // People come straight back from GEvents after paying, signed out: say so, so the sign-in screen is not a surprise.
  const fromPayment = target.startsWith("/register/payment-status");
  const paid = fromPayment && target.includes("status=success");
  return (
    <>
      <SignInCard
        next={target}
        title={paid ? "Payment received. Sign in to continue" : fromPayment ? "Sign in to see your payment" : "Sign in"}
        intro={
          paid
            ? "Thank you for paying. Sign in with Google to finish your team details (if you haven't yet), attach your payment and submit your idea."
            : fromPayment
              ? "Use the same Google account you registered your team with."
              : undefined
        }
        error={error}
      />
      {devLoginEnabled() && <DevLogin next={target} />}
    </>
  );
}
