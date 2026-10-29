export type ProcessStep = { title: string; body: string[] };
export type ProcessGroup = { id: string; label: string; summary: string; steps: ProcessStep[] };

const round1: ProcessStep = {
  title: "Round 1: Screening",
  body: [
    "A jury reviews every submission for completeness, relevance and quality of thinking.",
    "Final submission deadline: 31 October 2026. Results are announced on 2 November 2026.",
    "Top 200 teams advance: 100 from the Senior Track and 100 from the Junior Track.",
  ],
};
const bootcamp: ProcessStep = {
  title: "Round 2: Virtual Bootcamp & Refinement",
  body: [
    "A virtual bootcamp on 9–11 November covers business model validation, market sizing, financial modelling and pitch skills.",
    "Every advancing team is paired with a personal mentor to refine their pitch deck, with 4 days after the bootcamp to finish it.",
    "Round 2 deck deadline: 15 November, 11:59 PM IST. Results on 18 November: the top 40 teams in each track advance.",
  ],
};
const semis: ProcessStep = {
  title: "Online Semi-Finals",
  body: [
    "Held online, so teams from every region can take part without travelling: Senior Track on 20 November 2026 and Junior Track on 21 November 2026.",
    "Each team gets a 20-minute slot: 8 minutes to present, 10 minutes of Q&A with the panel and 2 minutes of buffer. The number of slides is up to you.",
    "The top 8 Senior Track teams and the top 6 Junior Track teams reach the Grand Finale.",
  ],
};
const finale: ProcessStep = {
  title: "Grand Finale: 11 December 2026",
  body: [
    "In person at GITAM Hyderabad, in front of the final jury, investors and the GITAM community.",
    "Each team gets 8 minutes to pitch and 10 minutes of Q&A. The number of slides is up to you.",
    "From the 8 Senior Track and 6 Junior Track finalists, the jury selects 6 Senior Track and 4 Junior Track teams (2 from each track are eliminated).",
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
          "Registration window: 5 August – 31 October 2026.",
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
          "You can change your idea, deck and video any time until 31 October 2026, 11:59 PM IST.",
          "The Lead and Co-Lead can edit; every listed member can view the team's submission.",
          "Round 1 results are announced on 2 November 2026.",
        ],
      },
    ],
  },
  {
    id: "stages",
    label: "Competition stages",
    summary: "The same journey for both tracks. The only difference is the date of the online semi-finals.",
    steps: [round1, bootcamp, semis, finale],
  },
];
