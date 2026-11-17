export type Milestone = {
  stage: string;
  title: string;
  date: string;
  note?: string;
  track?: "Senior Track" | "Junior Track";
  badge?: string;
};

/** Dates both tracks share, up to the Round 2 deadline. */
export const timeline: Milestone[] = [
  { stage: "Registration", title: "Registration & Submission Deadline", date: "06 January, 2027", badge: "Extended", note: "Last day to register and submit your idea" },
  { stage: "Round 1", title: "Round 1 Results", date: "06 January, 2027", note: "Junior Track: top 30 teams shortlisted · advancing Senior Track teams are told before the bootcamp begins" },
  { stage: "Round 2", title: "Virtual Bootcamp & Coaching", date: "08–13 January, 2027", note: "Online · every advancing team gets a personal mentor" },
  { stage: "Round 2", title: "Round 2 Pitch Deck Deadline", date: "18 January, 2027", note: "Final submission for both tracks" },
];

export const juniorTimeline: Milestone[] = [
  { stage: "Shortlist", title: "Top 8 Teams Selected", date: "22 January, 2027", note: "Teams that go on to the Junior Track Final" },
  { stage: "Final", title: "Junior Track Final", date: "27 January, 2027", note: "Top 8 teams pitch for the Junior Track title" },
  { stage: "After the final", title: "Immersion & Next-Stage Opportunity", date: "April–May, 2027" },
];

export const seniorTimeline: Milestone[] = [
  { stage: "Shortlist", title: "Top 40 Teams Shortlisted", date: "22 January, 2027", note: "Teams that go on to the online semi-finals" },
  { stage: "Semi-Finals", title: "Online Semi-Finals", date: "28 January, 2027", note: "20-minute pitch slot for each of the top 40 teams" },
  { stage: "Semi-Finals", title: "Top 8 Finalists Selected", date: "30 January, 2027", note: "Teams that reach the Grand Finale" },
  { stage: "Grand Finale", title: "Grand Finale at GITAM Hyderabad", date: "12 February, 2027", note: "In person · the top 8 Senior Track teams" },
];
