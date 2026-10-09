import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { PaymentStatusPoller } from "@/components/register/payment-status-poller";

export const metadata: Metadata = { title: "Payment status" };

export default function PaymentStatusPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Suspense fallback={<p className="text-center text-muted">Checking your payment…</p>}>
          <PaymentStatusPoller />
        </Suspense>
      </Container>
    </section>
  );
}
