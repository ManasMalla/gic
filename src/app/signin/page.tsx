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
  return (
    <>
      <SignInCard next={target} title="Sign in" error={error} />
      {devLoginEnabled() && <DevLogin next={target} />}
    </>
  );
}
