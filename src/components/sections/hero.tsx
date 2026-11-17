import Image from "next/image";
import { media } from "@/lib/media";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroCountdown } from "./hero-countdown";
import { LogoStrip } from "./logo-strip";

const team = media("/media/gallery/8th-oct/SmartIDEAthon-8th-oct-5.webp");

export function Hero() {
  return (
    <section id="home" className="relative -mt-[4.75rem] overflow-hidden bg-night pt-[4.75rem] text-white">
      <Image {...team} alt="" sizes="100vw" priority className="absolute inset-0 size-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgb(44_207_144/0.22),transparent_70%),linear-gradient(to_bottom,rgb(4_8_7/0.55),rgb(4_8_7/0.85)_70%,#040807)]" aria-hidden />
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden />

      <Container className="relative flex min-h-[calc(100svh-4.75rem)] flex-col items-center justify-center py-20 text-center">
        <p className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-lit backdrop-blur">
          6th edition · {site.edition}
        </p>
        <h1 className="mt-8 text-balance font-sans text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          GITAM <span className="text-lit">Innovation</span>
          <br />
          Challenge
        </h1>
        <p className="mt-6 text-xl font-light tracking-[0.3em] text-white/80 sm:text-3xl">{site.edition}</p>
        <p className="mt-6 max-w-2xl text-pretty text-lg font-semibold text-white/90 sm:text-xl">
          India&apos;s premier student venture challenge. Pitch your idea. Build the future.
        </p>

        <div className="mt-14">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">Registration closes in</p>
          <HeroCountdown closesAt={site.registration.closesAt} />
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" className="px-8 py-3.5 uppercase tracking-wider">Register now ↗</ButtonLink>
          <ButtonLink href="#tracks" variant="glass" className="px-8 py-3.5 uppercase tracking-wider">Choose your track</ButtonLink>
        </div>

        <div className="mt-14">
          <LogoStrip />
        </div>
      </Container>
    </section>
  );
}
