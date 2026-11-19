export type ProcessStep = { title: string; body: string[] };
export type ProcessGroup = { id: string; label: string; summary: string; steps: ProcessStep[] };

const round1: ProcessStep = {
  title: "Round 1: Screening",
  body: [
    "A jury reviews every submission for completeness, relevance and quality of thinking.",
    "Last date for initial submissions: 31 December 2026.",
    "The top 100 teams in each track are announced on 1 January 2027.",
  ],
};
const bootcamp: ProcessStep = {
  title: "Round 2: Bootcamp & Refinement",
  body: [
    "Junior Track: the top 100 submit again by 5 January; the top 30 are announced on 7 January and join an online bootcamp on 11–18 January, with a post-bootcamp submission on 19 January.",
    "Senior Track: the top 100 join an online bootcamp on 11–13 January, and the Round 2 submission is due on 18 January.",
    "The bootcamp covers business model validation, market sizing, financial modelling and pitch skills, and every team gets a personal mentor.",
  ],
};
const semis: ProcessStep = {
  title: "Senior Track Semi-Finals",
  body: [
    "The top 40 Senior Track teams are announced on 22 January 2027.",
    "Semi-finals are online on 28 January, so teams from every region can take part without travelling. Each team gets a 20-minute slot: 8 minutes to present, 10 minutes of Q&A with the panel and 2 minutes of buffer.",
    "The top 8 teams are announced as finalists on 30 January.",
  ],
};
const juniorFinal: ProcessStep = {
  title: "Junior Track Grand Finale: 27 January 2027",
  body: [
    "The top 8 Junior Track teams are announced on 22 January 2027.",
    "They pitch for the Junior Track title at the Grand Finale on 27 January.",
  ],
};
const finale: ProcessStep = {
  title: "Senior Track Grand Finale: 12 February 2027",
  body: [
    "In person at GITAM Hyderabad, in front of the final jury, investors and the GITAM community.",
    "Each of the 8 finalist teams gets 8 minutes to pitch and 10 minutes of Q&A. The number of slides is up to you.",
  ],
};

export const processIntro =
  "A structured journey designed to help student innovators refine their ideas, receive expert guidance and progress towards the Grand Finale.";

export const process: ProcessGroup[] = [
  {
    id: "registration",
    label: "How to apply",
    summary: "Four steps. You register your team, pay the fee, then submit your idea; the idea form opens as soon as your payment is confirmed.",
    steps: [
      {
        title: "Register your team",
        body: [
          "Sign in with Google at gic.gitam.edu/register and add your team and members.",
          "Senior Track: 2–6 members. Junior Track: 2–4 members. The Lead and Co-Lead are the primary participants.",
          "Registration closes on 31 December 2026.",
        ],
      },
      {
        title: "Pay the registration fee",
        body: [
          "Right after registering, pay on GITAM GEvents: ₹499 per team (Junior) or ₹699 per team (Senior).",
          "Use the team Lead's email on GEvents so we can match your payment automatically.",
          "Your entry is confirmed when the payment is. You are brought straight back to your team portal, where your idea form opens.",
        ],
      },
      {
        title: "Submit your idea in the portal",
        body: [
          "Once your payment is confirmed, the idea form opens. Choose your theme and fill in your idea details.",
          "Upload your pitch deck (PDF, PPT or PPTX, up to 10 MB).",
          "Add a 1-minute pitch video: paste a link or upload a file (up to 50 MB). Then press Submit.",
        ],
      },
      {
        title: "Edit until the deadline",
        body: [
          "You can change your idea, deck and video any time until 31 December 2026, 11:59 PM IST.",
          "The Lead and Co-Lead can edit; every listed member can view the team's submission.",
          "The top 100 teams in each track are announced on 1 January 2027.",
        ],
      },
    ],
  },
  {
    id: "stages",
    label: "Competition stages",
    summary: "Both tracks share Round 1. After that, the Junior Track narrows to a top 30 and a top 8, and the Senior Track goes through semi-finals, each ending in a Grand Finale.",
    steps: [round1, bootcamp, semis, juniorFinal, finale],
  },
];
