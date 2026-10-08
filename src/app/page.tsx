import { About } from "@/components/sections/about";
import { CtaBand } from "@/components/sections/cta-band";
import { Experience } from "@/components/sections/experience";
import { Faq } from "@/components/sections/faq";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Partners } from "@/components/sections/partners";
import { Prizes } from "@/components/sections/prizes";
import { Process } from "@/components/sections/process";
import { Themes } from "@/components/sections/themes";
import { Videos } from "@/components/sections/videos";
import { Timeline } from "@/components/sections/timeline";
import { Tracks } from "@/components/sections/tracks";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Tracks />
      <Partners />
      <Timeline />
      <Themes />
      <Process />
      <Prizes />
      <Experience />
      <Gallery />
      <Videos />
      <Faq />
      <CtaBand />
    </>
  );
}
