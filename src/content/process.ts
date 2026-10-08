export type ProcessStep = { title: string; body: string[] };
export type ProcessGroup = { id: string; label: string; summary: string; steps: ProcessStep[] };

const desk: ProcessStep = {
  title: "Round 1 — Desk Screening",
  body: [
    "A jury reviews all submissions for completeness, relevance, and quality of thinking.",
    "Top 100 teams are shortlisted and notified by email.",
  ],
};
const bootcamp: ProcessStep = {
  title: "Round 2 — Online Bootcamp & Refinement",
  body: [
    "Shortlisted teams join an online bootcamp with mentors to sharpen their idea and pitch.",
    "Teams submit a refined pitch deck (up to 10 slides).",
    "Top 40 teams move forward, and each is assigned a personal venture coach.",
  ],
};

export const processIntro =
  "A structured journey designed to help student innovators refine their ideas, receive expert guidance and progress towards the Grand Finale.";

export const process: ProcessGroup[] = [
  {
    id: "registration",
    label: "Registration & Submission",
    summary: "Submit your idea and pitch materials",
    steps: [
      {
        title: "Register online",
        body: [
          "All teams submit a 1-minute video pitch and a pitch deck online.",
          "Guidelines for the video and deck are shared along with the registration form.",
          "Registration window: 5 August – 10 October 2026.",
        ],
      },
    ],
  },
  {
    id: "main",
    label: "Main Track",
    summary: "Screening, bootcamp, coaching & finale",
    steps: [
      desk,
      bootcamp,
      {
        title: "Semi-Finals & Finals",
        body: [
          "Semi-Finals: a 15-minute virtual pitch (10 min pitch + 5 min Q&A) to a jury panel. Top 10 teams qualify for the Grand Finale.",
          "Grand Finale: live, on-campus pitch in Hyderabad on 11th December 2026.",
          "Format: 10 slides, 10 min pitch + 10 min Q&A, on the main stage in front of a live audience, jury, and investors.",
        ],
      },
    ],
  },
  {
    id: "junior",
    label: "Junior Track",
    summary: "Screening, bootcamp & regional rounds",
    steps: [
      desk,
      bootcamp,
      {
        title: "Regionals — Offline Regional Round",
        body: [
          "In-person pitching at the nearest GITAM campus — Bengaluru, Hyderabad, or Visakhapatnam.",
          "Combined, the top 15 teams across all three campuses qualify for the Grand Finale.",
          "We cover travel, accommodation, and food for every team that reaches the Grand Finale.",
        ],
      },
    ],
  },
  {
    id: "finale",
    label: "Grand Finale",
    summary: "Live on-campus finale at GITAM Hyderabad",
    steps: [
      {
        title: "GIC 2026 Grand Finale — 11 December 2026",
        body: [
          "Live, on-campus pitch in Hyderabad on 11th December 2026.",
          "Format: 5 slides, 5 min pitch + 5 min Q&A, in front of a jury, investors, and the wider GITAM community.",
        ],
      },
    ],
  },
];
