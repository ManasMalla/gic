import Image from "next/image";
import { media } from "@/lib/media";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { BrandRays } from "@/components/ui/brand-rays";
import { Container } from "@/components/ui/container";
import { HeroCountdown } from "./hero-countdown";
import { LogoStrip } from "./logo-strip";

const team = media("/media/gallery/8th-oct/SmartIDEAthon-8th-oct-5.webp");

export function Hero() {
  return (
    <section id="home" className="on-dark relative -mt-[4.75rem] overflow-hidden bg-night pt-[4.75rem] text-white">
      <BrandRays />
      <Container className="relative grid min-h-[calc(100svh-4.75rem)] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="inline-flex items-center gap-3 text-sm font-medium text-lit">
            <span className="h-px w-10 bg-lit" aria-hidden />
            GITAM x Bower · 6th edition · {site.edition}
          </p>
          <h1 className="mt-6 font-display font-bold leading-[0.92] tracking-tight">
            <span className="sr-only">GITAM x Bower Innovation Challenge {site.edition}. </span>
            <span className="block text-3xl text-lit sm:text-5xl">Pitch your</span>
            <span className="block text-7xl sm:text-9xl">idea.</span>
            <span className="mt-1 block text-3xl text-lit sm:text-5xl">Build the</span>
            <span className="block text-7xl sm:text-9xl">future.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/80">
            India&apos;s premier student venture challenge, nurturing valuable futures for school and college innovators.
          </p>

          <div className="mt-10">
            <p className="mb-4 text-sm font-medium text-lit">Registration closes in</p>
            <HeroCountdown closesAt={site.registration.closesAt} />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/register" className="px-8 py-3.5">Register now</ButtonLink>
            <ButtonLink href="#tracks" variant="glass" className="px-8 py-3.5">Choose your track</ButtonLink>
          </div>
        </div>

        {/* Brand imagery: circular crop with an antique-white disc and a dark-green arc behind it. */}
        <div className="relative mx-auto w-full max-w-[34rem]">
          <div className="absolute -right-6 -top-6 size-[78%] rounded-full bg-lit" aria-hidden />
          <div className="absolute -bottom-8 -left-8 size-[55%] rounded-full bg-night-2" aria-hidden />
          <div className="relative aspect-square overflow-hidden rounded-full border-[10px] border-night">
            <Image {...team} alt="School students pitching at the GITAM Innovation Challenge" sizes="(min-width:1024px) 34rem, 90vw" priority className="size-full object-cover" />
          </div>
        </div>
      </Container>
      <Container className="relative pb-16">
        <LogoStrip />
      </Container>
    </section>
  );
}
