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
    label: "How to apply",
    summary: "Four steps, and payment is not the last one. Your entry is complete only after you submit your idea in the team portal.",
    steps: [
      {
        title: "Register your team",
        body: [
          "Sign in with Google at gic.gitam.edu/register and add your team and members.",
          "Main Track: 2–6 members. Junior Track: 2–4 members. The Lead and Co-Lead are the primary participants.",
          "Registration window: 5 August – 31 October 2026.",
        ],
      },
      {
        title: "Pay the registration fee",
        body: [
          "You are sent to GITAM GEvents to pay: ₹499 per team (Junior) or ₹699 per team (Main).",
          "Use the team Lead's email on GEvents so we can match your payment automatically.",
          "After paying you are brought back here and taken to your team portal.",
        ],
      },
      {
        title: "Submit your idea in the portal",
        body: [
          "Choose your theme and fill in your idea details.",
          "Upload your pitch deck (PDF, PPT or PPTX, up to 10 MB).",
          "Add a 1-minute pitch video: paste a link or upload a file (up to 25 MB). Then press Submit.",
        ],
      },
      {
        title: "Edit until the deadline",
        body: [
          "You can change your idea, deck and video any time until 31 October 2026, 11:59 PM IST.",
          "The Lead and Co-Lead can edit; every listed member can view the team's submission.",
          "Submissions then go to Round 1 desk screening.",
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
