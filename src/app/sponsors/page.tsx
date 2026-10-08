import type { Metadata } from "next";
import {
  BenefitsMatrix, FinaleDay, Gains, Numbers, SelectionJourney, SponsorContact, SponsorHero,
  ThemesForPartners, Tiers, WhyPartner,
} from "@/components/sponsors/sections";

export const metadata: Metadata = {
  title: "Partner with us",
  description: "Corporate partnership opportunities for the GITAM Innovation Challenge 2026 — title, platinum, gold, theme and ecosystem partners.",
};

export default function SponsorsPage() {
  return (
    <>
      <SponsorHero />
      <WhyPartner />
      <Numbers />
      <ThemesForPartners />
      <SelectionJourney />
      <FinaleDay />
      <Gains />
      <Tiers />
      <BenefitsMatrix />
      <SponsorContact />
    </>
  );
}
