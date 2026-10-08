import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="font-display text-7xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-muted">It may have moved while we rebuilt the GIC website.</p>
      <ButtonLink href="/" variant="brand" className="mt-8">Back to home</ButtonLink>
    </Container>
  );
}
