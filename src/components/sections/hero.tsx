import Image from "next/image";
import { media } from "@/lib/media";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LogoStrip } from "./logo-strip";

const team = media("/media/gallery/8th-oct/SmartIDEAthon-8th-oct-5.webp");

const facts = [
  { k: "Prize pool & ecosystem value", v: "₹50 Lakh+" },
  { k: "Grand Finale", v: "11 Dec 2026" },
  { k: "Tracks", v: "Junior · Main" },
] as const;

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-forest text-white">
      <div className="bg-triangles absolute inset-0 opacity-70" aria-hidden />
      <div className="bg-dots absolute right-[-3rem] top-10 hidden h-72 w-72 opacity-60 lg:block" aria-hidden />
      <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <LogoStrip />
          <h1 className="mt-8 text-balance font-display text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
            Pitch your idea.
            <span className="block text-gold">Build the future.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/80">
            {site.title} — India&apos;s premier national student venture challenge for school and college innovators
            building scalable, sustainable and resilient solutions.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/register">Apply now</ButtonLink>
            <ButtonLink href="#tracks" variant="outline">Choose your track</ButtonLink>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {facts.map((f) => (
              <div key={f.k}>
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">{f.v}</dd>
                <dt className="mt-1 text-xs leading-snug text-white/65">{f.k}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[1.75rem] ring-1 ring-white/20 shadow-2xl">
            <Image {...team} alt="School students pitching at the GITAM Innovation Challenge" sizes="(min-width:1024px) 40vw, 100vw" className="aspect-[4/3] w-full object-cover object-center" priority />
          </div>
          <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-4 rounded-2xl bg-cream-soft p-4 text-ink shadow-card sm:left-8 sm:right-auto sm:pr-8">
            <p className="text-sm font-medium leading-snug">
              6th edition · thousands of ideas from <strong>29 states</strong>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
