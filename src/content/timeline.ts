export type Milestone = {
  stage: string;
  title: string;
  date: string;
  note?: string;
  track?: "Main Track" | "Junior Track";
  badge?: string;
};

export const timeline: Milestone[] = [
  { stage: "Registration", title: "Registration Opens", date: "05 August, 2026" },
  { stage: "Registration", title: "Registration Closes", date: "10 October, 2026", badge: "Extended" },
  { stage: "Selection", title: "Round 1 Shortlisting", date: "31 October, 2026", badge: "Extended" },
  { stage: "Round 2", title: "Online Bootcamp – Round 2", date: "15–29 October, 2026" },
  { stage: "Main Track", title: "Semi-Finalists Announced", date: "12 November, 2026", note: "40 teams", track: "Main Track" },
  { stage: "Junior Track", title: "Regional Finalists Announced", date: "1st week of November, 2026", note: "100 teams", track: "Junior Track" },
  { stage: "Main Track", title: "Online Semi-Finals", date: "25–26 November, 2026", track: "Main Track" },
  { stage: "Junior Track", title: "Offline Regional Rounds", date: "28 November, 2026", track: "Junior Track" },
  { stage: "Grand Finale", title: "Grand Finale at GITAM Hyderabad", date: "11 December, 2026" },
];
