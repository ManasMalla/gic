// Global facts used across the site. Change once, updates everywhere.
export const site = {
  name: "GITAM Innovation Challenge",
  shortName: "GIC",
  edition: "2026",
  tagline: "Pitch your idea. Build the future.",
  title: "GITAM x Bower Innovation Challenge 2026",
  description:
    "India's premier national-level student venture challenge. Two tracks, five themes, one Grand Finale at GITAM Hyderabad on 11 December 2026.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  organiser: "Venture Development Centre (VDC), GITAM",
  titleSponsor: "Bower School of Entrepreneurship",
  grandFinale: { date: "11 December 2026", venue: "GITAM Hyderabad Campus" },
  registration: {
    opens: "05 Aug 2026",
    closes: "10 Oct 2026",
    // Deadline for the header countdown (IST end of day). Change here to move the timer.
    closesAt: "2026-10-10T23:59:59+05:30",
    extended: true,
  },
  contact: {
    email: "gic@gitam.edu",
    phones: ["+91 90630 65811", "+91 83283 34930"],
    address: "GITAM Deemed to be University, Rudraram, Patancheru mandal, Hyderabad - 502329, Telangana, India",
  },
  social: [
    { label: "Facebook", href: "https://www.facebook.com/gitamdeemeduniversity" },
    { label: "X (Twitter)", href: "https://twitter.com/GITAMUniversity" },
    { label: "YouTube", href: "https://www.youtube.com/gitamdeemeduniversity" },
    { label: "LinkedIn", href: "https://in.linkedin.com/school/gitam-deemed-university/" },
    { label: "Instagram", href: "https://www.instagram.com/gitamdeemeduniversity/" },
  ],
  links: { vdc: "https://vdc.gitam.edu/" },
} as const;

export const nav = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Process", href: "/#process" },
  { label: "Prizes", href: "/#prizes" },
  { label: "FAQ", href: "/#faq" },
  { label: "Sponsors", href: "/sponsors" },
] as const;

export const documents = [
  { label: "2026 Sponsorship Brochure", href: "/documents/GIC-2026-Sponsorship-Brochure.pdf" },
  { label: "2026 Pitch Deck Template", href: "/documents/GIC-2026-Pitch-Deck-Template.pptx" },
  { label: "Round 2 Results", href: "/documents/GIC-Round-2-Results.pdf" },
  { label: "2025 Guidance Manual", href: "/documents/SmartIDEAthon-2025-Guidance-Manual.pdf" },
  { label: "2023 Brochure", href: "/documents/GIC-2023-Brochure.pdf" },
] as const;
