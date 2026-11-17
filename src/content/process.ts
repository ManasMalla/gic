export type ProcessStep = { title: string; body: string[] };
export type ProcessGroup = { id: string; label: string; summary: string; steps: ProcessStep[] };

const round1: ProcessStep = {
  title: "Round 1: Screening",
  body: [
    "A jury reviews every submission for completeness, relevance and quality of thinking.",
    "Final submission deadline: 6 January 2027. Junior Track: the top 30 teams are shortlisted on 6 January.",
    "Advancing Senior Track teams are told before the bootcamp begins.",
  ],
};
const bootcamp: ProcessStep = {
  title: "Round 2: Virtual Bootcamp & Refinement",
  body: [
    "A virtual bootcamp on 8–13 January covers business model validation, market sizing, financial modelling and pitch skills.",
    "Every advancing team is paired with a personal mentor to refine their pitch deck.",
    "Round 2 submission deadline: 18 January 2027. On 22 January the Senior Track shortlists its top 40 teams and the Junior Track selects its top 8.",
  ],
};
const semis: ProcessStep = {
  title: "Senior Track Online Semi-Finals",
  body: [
    "Held online on 28 January 2027, so teams from every region can take part without travelling.",
    "Each team gets a 20-minute slot: 8 minutes to present, 10 minutes of Q&A with the panel and 2 minutes of buffer. The number of slides is up to you.",
    "The top 8 Senior Track teams are selected as finalists on 30 January.",
  ],
};
const juniorFinal: ProcessStep = {
  title: "Junior Track Final: 27 January 2027",
  body: [
    "The top 8 Junior Track teams pitch for the Junior Track title.",
    "Each team gets 8 minutes to pitch and 10 minutes of Q&A. The number of slides is up to you.",
    "After the final, Junior Track teams can look forward to an immersion and next-stage opportunity in April–May 2027.",
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
    summary: "Four steps. You submit your idea first and pay at the end; your entry is confirmed once the payment goes through.",
    steps: [
      {
        title: "Register your team",
        body: [
          "Sign in with Google at gic.gitam.edu/register and add your team and members.",
          "Senior Track: 2–6 members. Junior Track: 2–4 members. The Lead and Co-Lead are the primary participants.",
          "Registration closes on 6 January 2027.",
        ],
      },
      {
        title: "Submit your idea in the portal",
        body: [
          "Choose your theme and fill in your idea details.",
          "Upload your pitch deck (PDF, PPT or PPTX, up to 10 MB).",
          "Add a 1-minute pitch video: paste a link or upload a file (up to 50 MB). Then press Submit.",
        ],
      },
      {
        title: "Pay the registration fee (last step)",
        body: [
          "Once your idea is submitted, pay on GITAM GEvents: ₹499 per team (Junior) or ₹699 per team (Senior).",
          "Use the team Lead's email on GEvents so we can match your payment automatically.",
          "Your entry is confirmed when the payment is. You are brought straight back to your team portal.",
        ],
      },
      {
        title: "Edit until the deadline",
        body: [
          "You can change your idea, deck and video any time until 6 January 2027, 11:59 PM IST.",
          "The Lead and Co-Lead can edit; every listed member can view the team's submission.",
          "Round 1 results follow on 6 January 2027.",
        ],
      },
    ],
  },
  {
    id: "stages",
    label: "Competition stages",
    summary: "Both tracks share Round 1 and the bootcamp. After that, the Junior Track has its own final and the Senior Track goes through online semi-finals to the Grand Finale.",
    steps: [round1, bootcamp, juniorFinal, semis, finale],
  },
];
