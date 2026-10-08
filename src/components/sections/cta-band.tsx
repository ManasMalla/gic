import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/content/site";

export function CtaBand() {
  return (
    <section className="bg-gold py-16 text-ink">
      <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Ready to pitch?</h2>
          <p className="mt-2 max-w-xl text-lg text-ink/75">
            Registration closes {site.registration.closes}. Questions? Write to{" "}
            <a className="font-semibold underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/register" variant="brand">Apply now</ButtonLink>
          <ButtonLink href="/sponsors" className="bg-ink text-white hover:bg-ink/85">Partner with us</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
