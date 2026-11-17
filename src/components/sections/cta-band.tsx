import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/content/site";

export function CtaBand() {
  return (
    <section id="ready" className="relative overflow-hidden bg-night-2 py-28 text-white sm:py-36">
      <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-sans text-[22vw] font-extrabold leading-none text-white/[0.04]" aria-hidden>{site.edition}</p>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lit/25 blur-[130px]" aria-hidden />
      <Container className="relative text-center">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-lit">Registration closes {site.registration.closes}</p>
        <h2 className="font-sans text-6xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-8xl lg:text-9xl">
          Are you <span className="text-lit">ready?</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg text-white/60">
          Questions? Write to{" "}
          <a className="font-semibold text-white underline decoration-lit underline-offset-4" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" className="px-9 py-4 uppercase tracking-wider">Register now ↗</ButtonLink>
          <ButtonLink href="/sponsors" variant="glass" className="px-9 py-4 uppercase tracking-wider">Partner with us</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
