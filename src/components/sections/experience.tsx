import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { SpeakersCarousel } from "./speakers-carousel";

export function Experience() {
  return (
    <Section id="speakers" tone="antique">
      <SectionHeading
        tone="paper"
        eyebrow="GIC experience"
        title={<>Great <Accent>speakers.</Accent></>}
        description="The founders, investors and educators who have shaped the GITAM Innovation Challenge."
      />
      <div className="mt-14">
        <SpeakersCarousel />
      </div>
    </Section>
  );
}
