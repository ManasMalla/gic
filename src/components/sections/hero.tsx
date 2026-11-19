import Image from "next/image";
import { media } from "@/lib/media";
import { site } from "@/content/site";
import { Accent } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroCountdown } from "./hero-countdown";
import { LogoStrip } from "./logo-strip";

const team = media("/media/gallery/8th-oct/SmartIDEAthon-8th-oct-5.webp");

export function Hero() {
  return (
    <section id="home" className="on-cream grid-paper relative overflow-hidden text-night-2">
      <Container className="relative flex flex-col items-center pb-12 pt-14 text-center sm:pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border-2 border-night-2 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em]">
          <span className="size-1.5 rounded-full bg-night" aria-hidden />
          Registration open · 6th edition
        </p>
        <h1 className="mt-7 max-w-5xl text-balance font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl">
          <span className="sr-only">GITAM Innovation Challenge {site.edition}. </span>
          Pitch your idea. Build the <Accent>future.</Accent>
        </h1>
        <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-night-2/80 sm:text-xl">
          <strong className="font-bold">GITAM Innovation Challenge {site.edition}.</strong> India&apos;s premier student venture challenge, for school and college
          innovators with an idea and a coach beside them all the way.
        </p>

        <div className="mt-10">
          <p className="mb-4 text-sm font-semibold">Registration closes in</p>
          <HeroCountdown closesAt={site.registration.closesAt} />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" className="px-8 py-3.5">Register your team →</ButtonLink>
          <ButtonLink href="#tracks" variant="outline" className="sticker-sm border-night-2 bg-white px-8 py-3.5 text-night-2 hover:bg-cream">Choose your track</ButtonLink>
        </div>
      </Container>

      <Container className="relative pb-12">
        <div className="sticker relative overflow-hidden">
          <Image {...team} alt="School students pitching at the GITAM Innovation Challenge" sizes="(min-width:1280px) 80rem, 100vw" priority className="aspect-[16/8] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 bg-gradient-to-t from-night-2/90 to-transparent p-6 text-white sm:p-8">
            <p className="max-w-md text-lg font-semibold leading-snug">Thousands of ideas from <span className="text-lit">29 states</span>, and one stage in Hyderabad.</p>
            <ButtonLink href="#about" variant="glass" className="py-2.5">How it works →</ButtonLink>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <LogoStrip />
        </div>
      </Container>
    </section>
  );
}
