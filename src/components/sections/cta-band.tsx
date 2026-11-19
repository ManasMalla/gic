import { BrandRays } from "@/components/ui/brand-rays";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/content/site";

export function CtaBand() {
  return (
    <section id="ready" className="px-3 py-3 sm:px-6">
      <div className="on-dark relative mx-auto max-w-[88rem] overflow-hidden rounded-[28px] bg-night py-24 text-white sm:py-32">
      <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[22vw] font-bold leading-none text-night-2/25" aria-hidden>{site.edition}</p>
      <BrandRays />
      <Container className="relative text-center">
        <p className="mb-6 text-sm font-medium text-lit">Registration closes {site.registration.closes}</p>
        <h2 className="font-display text-6xl font-bold leading-[0.92] tracking-tight sm:text-8xl lg:text-9xl">
          Are you <span className="text-lit">ready?</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg text-white/60">
          Questions? Write to{" "}
          <a className="font-semibold text-white underline decoration-lit underline-offset-4" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" className="px-9 py-4">Register now ↗</ButtonLink>
          <ButtonLink href="/sponsors" variant="glass" className="px-9 py-4">Partner with us</ButtonLink>
        </div>
      </Container>
      </div>
    </section>
  );
}
