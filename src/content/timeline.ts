export type Milestone = {
  stage: string;
  title: string;
  date: string;
  note?: string;
  track?: "Senior Track" | "Junior Track";
  badge?: string;
};

export const timeline: Milestone[] = [
  { stage: "Registration", title: "Registration Opens", date: "05 August, 2026" },
  { stage: "Registration", title: "Registration & Submission Deadline", date: "05 November, 2026", badge: "Extended", note: "Last day to register and submit your idea" },
  { stage: "Round 1", title: "Round 1 Results", date: "05 November, 2026", note: "Announced the same day · top 200 teams advance: 100 Senior Track + 100 Junior Track" },
  { stage: "Round 2", title: "Virtual Bootcamp & Mentoring", date: "09–11 November, 2026", note: "Online · every advancing team gets a personal mentor" },
  { stage: "Round 2", title: "Round 2 Pitch Deck Deadline", date: "15 November, 2026", note: "11:59 PM IST" },
  { stage: "Round 2", title: "Round 2 Results", date: "18 November, 2026", note: "Top 80 teams advance: 40 Senior Track + 40 Junior Track" },
  { stage: "Senior Track", title: "Online Semi-Finals", date: "20 November, 2026", note: "20-minute pitch slot · top 8 teams reach the Grand Finale", track: "Senior Track" },
  { stage: "Junior Track", title: "Online Semi-Finals", date: "21 November, 2026", note: "20-minute pitch slot · top 6 teams reach the Grand Finale", track: "Junior Track" },
  { stage: "Grand Finale", title: "Grand Finale at GITAM Hyderabad", date: "11 December, 2026", note: "In person · 6 Senior Track and 4 Junior Track teams selected from the 14 finalists" },
];
