import { media } from "@/lib/media";

export type Prize = { rank: string; cash: string; perks: string[] };
export type PrizeTrack = { id: string; label: string; title: string; image: ReturnType<typeof media>; prizes: Prize[]; footer?: { title: string; body: string } };

export const prizeTracks: PrizeTrack[] = [
  {
    id: "junior",
    label: "School Innovators",
    title: "Junior Track",
    image: media("/media/brand/award.webp"),
    prizes: [
      { rank: "Winner", cash: "₹50,000", perks: ["Awarded to the top-scoring school team at the Grand Finale.", "Trophy + Certificate", "Mentorship access from GITAM VDC mentors", "Press feature through GITAM and partner channels"] },
      { rank: "Runner-up", cash: "₹30,000", perks: ["Awarded to the second-best school team.", "Certificate", "Mentorship access to develop the idea beyond the competition"] },
      { rank: "2nd Runner-up", cash: "₹20,000", perks: ["Awarded to the third-best school team.", "Certificate", "Guidance to help the team build on their concept"] },
    ],
    footer: {
      title: "All Junior Track Finalists",
      body: "Access to the LEAD Program, delivered by the Bower School of Entrepreneurship — a structured leadership and entrepreneurship curriculum for young innovators, valued at approximately ₹2,00,000 per team.",
    },
  },
  {
    id: "main",
    label: "College & Graduate Innovators",
    title: "Main Track",
    image: media("/media/brand/runnerup.webp"),
    prizes: [
      { rank: "Winner", cash: "₹2,00,000", perks: ["Awarded to the top college-level venture at the Grand Finale.", "Trophy + Certificate", "Free 6-month incubation at GITAM i-TBI (worth ₹3,00,000)", "Direct nomination for SIA Award 2027 by Impact Hub Hyderabad", "Workspace access, mentor network, press feature, and access to the GITAM VDC investor and alumni ecosystem"] },
      { rank: "Runner-up", cash: "₹1,00,000", perks: ["Awarded to the second-best team in the Main Track.", "Certificate", "Direct nomination for SIA Award 2027 by Impact Hub Hyderabad", "Free 6-month incubation at GITAM i-TBI", "Mentorship from experienced venture coaches"] },
      { rank: "2nd Runner-up", cash: "₹50,000", perks: ["Awarded to the third-best team in the Main Track.", "Certificate", "Direct nomination for SIA Award 2027 by Impact Hub Hyderabad", "Free 6-month incubation at GITAM i-TBI"] },
    ],
    footer: {
      title: "All GIC Finalists",
      body: "A full year of 1:1 venture coaching from the GITAM VDC coach network, worth ₹2,00,000 per team — sustained, personalised mentorship long after the Grand Finale ends.",
    },
  },
];

export const specialAccolades = [
  {
    title: "Best Social Impact Business Idea",
    cash: "₹50,000",
    image: media("/media/brand/idea.webp"),
    perks: ["Certificate", "Direct nomination for SIA Award 2027 by Impact Hub Hyderabad", "Free 6-month incubation at GITAM i-TBI"],
  },
  {
    title: "Leben Johnson People's Choice Award",
    cash: "₹50,000",
    image: media("/media/brand/choice-award.webp"),
    perks: ["Voted live by the audience during the Grand Finale", "Certificate", "Direct nomination for SIA Award 2027 by Impact Hub Hyderabad", "Free 6-month incubation at GITAM i-TBI"],
  },
] as const;

export const specialRecognition = {
  title: "Dr. G.V.V. Rao Young Engineer Dreamer Awards",
  sponsor: "Sponsored by Balavikas, USA (via RKM Vizag)",
  body: "Special recognition for engineering innovations that address real societal challenges.",
  cash: [
    { rank: "Winner", amount: "₹50,000" },
    { rank: "Runner-up", amount: "₹25,000" },
    { rank: "2nd Runner-up", amount: "₹15,000" },
  ],
} as const;
