export type Milestone = {
  stage: string;
  title: string;
  date: string;
  note?: string;
  track?: "Senior Track" | "Junior Track";
  badge?: string;
};

/** Dates both tracks share. */
export const timeline: Milestone[] = [
  { stage: "Registration", title: "Last Date for Initial Submissions", date: "31 December, 2026", note: "Last day to register and submit your idea" },
  { stage: "Round 1", title: "Top 100 Teams Announced", date: "01 January, 2027", note: "100 teams advance in each track" },
];

export const juniorTimeline: Milestone[] = [
  { stage: "Round 2", title: "Submission Deadline for Top 100 Teams", date: "05 January, 2027" },
  { stage: "Shortlist", title: "Top 30 Teams Announced", date: "07 January, 2027" },
  { stage: "Bootcamp", title: "Bootcamp for Top 30 Teams", date: "11–18 January, 2027", note: "Online · every team gets a personal mentor" },
  { stage: "Round 2", title: "Post-Bootcamp Submission Deadline", date: "19 January, 2027" },
  { stage: "Finalists", title: "Top 8 Finalist Teams Announced", date: "22 January, 2027" },
  { stage: "Grand Finale", title: "Grand Finale", date: "27 January, 2027", note: "The top 8 Junior Track teams" },
];

export const seniorTimeline: Milestone[] = [
  { stage: "Bootcamp", title: "Bootcamp for Top 100 Teams", date: "11–13 January, 2027", note: "Online · every team gets a personal mentor" },
  { stage: "Round 2", title: "Round 2 Submission Deadline", date: "18 January, 2027" },
  { stage: "Shortlist", title: "Top 40 Teams Announced", date: "22 January, 2027" },
  { stage: "Semi-Finals", title: "Semi-Finals", date: "28 January, 2027", note: "Online · 20-minute pitch slot for each of the top 40 teams" },
  { stage: "Finalists", title: "Top 8 Finalist Teams Announced", date: "30 January, 2027" },
  { stage: "Grand Finale", title: "Grand Finale at GITAM Hyderabad", date: "12 February, 2027", note: "In person · the top 8 Senior Track teams" },
];
