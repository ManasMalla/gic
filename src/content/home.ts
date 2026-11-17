import { media } from "@/lib/media";

/**
 * Home-page content that is still PLACEHOLDER. Every string tagged "[Placeholder]" must be replaced
 * with real content before this goes live.
 */

/** "The legacy continues": one tab per past edition. */
export const legacyEditions = [
  { year: "2023", image: media("/media/legacy/winner-2023-placeholder.png"), upcoming: false, winner: "[Placeholder] Winning team name", note: "[Placeholder] One line about the 2023 winner and their idea." },
  { year: "2024", image: media("/media/legacy/winner-2024-placeholder.webp"), upcoming: false, winner: "[Placeholder] Winning team name", note: "[Placeholder] One line about the 2024 winner and their idea." },
  { year: "2025", image: media("/media/legacy/winner-2025-placeholder.png"), upcoming: false, winner: "[Placeholder] Winning team name", note: "[Placeholder] One line about the 2025 winner and their idea." },
  // The current edition: shown as a silhouette (the person in it is whoever wins).
  { year: "2026", image: media("/media/legacy/winner-2025-placeholder.png"), upcoming: true, winner: "Are you the one?", note: "The next GIC champion could be you." },
] as const;

export const aboutBullets = [
  { title: "Real investors & founders", body: "Pitch to people who have built and funded ventures." },
  { title: "Mentorship from day one", body: "Every advancing team is paired with a personal mentor." },
  { title: "A national stage", body: "Students from across India compete in the same arena." },
] as const;

export const aboutStats = [
  { value: "3", label: "Competition rounds", note: "Screening, Round 2 and the final stage" },
  { value: "₹50 Lakh+", label: "Prize pool & ecosystem value", note: "Cash prizes, grants, incubation and coaching" },
  { value: "2", label: "Tracks", note: "Junior (school) and Senior (UG & PG)" },
] as const;

export const prizeShowcase = [
  { label: "Winner trophy", image: media("/media/brand/award.webp") },
  { label: "People's Choice", image: media("/media/brand/choice-award.webp") },
  { label: "Runner-up", image: media("/media/brand/runnerup.webp") },
  { label: "Incubation", image: media("/media/brand/idea.webp") },
] as const;

export const stories = [
  { name: "[Placeholder] Student name", role: "[Placeholder] Team · Institution", quote: "[Placeholder] A short testimonial from a past participant about what the challenge gave them." },
  { name: "[Placeholder] Student name", role: "[Placeholder] Team · Institution", quote: "[Placeholder] A short testimonial from a past participant about what the challenge gave them." },
  { name: "[Placeholder] Student name", role: "[Placeholder] Team · Institution", quote: "[Placeholder] A short testimonial from a past participant about what the challenge gave them." },
  { name: "[Placeholder] Student name", role: "[Placeholder] Team · Institution", quote: "[Placeholder] A short testimonial from a past participant about what the challenge gave them." },
  { name: "[Placeholder] Student name", role: "[Placeholder] Team · Institution", quote: "[Placeholder] A short testimonial from a past participant about what the challenge gave them." },
  { name: "[Placeholder] Student name", role: "[Placeholder] Team · Institution", quote: "[Placeholder] A short testimonial from a past participant about what the challenge gave them." },
] as const;

export const contactPeople = [
  { name: "[Placeholder] Coordinator", role: "Registrations & payments", phone: "+91 90630 65811", email: "gic@gitam.edu" },
  { name: "[Placeholder] Coordinator", role: "Idea submissions", phone: "+91 83283 34930", email: "gic@gitam.edu" },
  { name: "[Placeholder] Coordinator", role: "Partnerships & sponsorship", phone: "[Placeholder] +91 00000 00000", email: "gic@gitam.edu" },
  { name: "[Placeholder] Coordinator", role: "Media & press", phone: "[Placeholder] +91 00000 00000", email: "gic@gitam.edu" },
] as const;

/** "The challenge" accordion: the three stages, each with a Junior/Senior split. Dates mirror content/timeline.ts. */
export const challenges = [
  {
    tag: "Round 1 · Online screening",
    title: "Idea Screening",
    when: "Deadline 6 January 2027",
    columns: [
      { heading: "Junior Track", lines: [["Eligibility", "School students, Classes 10–12"], ["Team size", "2–4 members, same school"], ["Fee", "₹499 per team"], ["Shortlist", "Top 30 teams on 6 January 2027"]] },
      { heading: "Senior Track", lines: [["Eligibility", "UG and PG students & graduates from 2025 onwards"], ["Team size", "2–6 members"], ["Fee", "₹699 per team"], ["Results", "Advancing teams are told before the bootcamp"]] },
    ],
    listTitle: "What the jury looks at",
    list: ["Completeness of the submission", "Relevance of the problem", "Quality of thinking", "Clarity of the pitch deck and video"],
    note: ["Submit", "Idea details, a pitch deck (PDF/PPT, up to 10 MB) and a 1-minute pitch video (link or file up to 50 MB)."],
    cta: { label: "Register now", href: "/register" },
  },
  {
    tag: "Round 2 · Virtual bootcamp",
    title: "Bootcamp & Pitch Deck",
    when: "8–13 January 2027 · deck due 18 January",
    columns: [
      { heading: "Junior Track", lines: [["Coaching", "Virtual bootcamp and a personal mentor"], ["Deck deadline", "18 January 2027"], ["Selected", "Top 8 teams on 22 January 2027"]] },
      { heading: "Senior Track", lines: [["Coaching", "Virtual bootcamp and a personal mentor"], ["Deck deadline", "18 January 2027"], ["Shortlisted", "Top 40 teams on 22 January 2027"]] },
    ],
    listTitle: "Bootcamp covers",
    list: ["Business model validation", "Market sizing", "Financial modelling", "Pitch presentation skills"],
    note: ["Format", "Online, so teams from every region can take part without travelling."],
    cta: { label: "See the timeline", href: "#timeline" },
  },
  {
    tag: "Finals · Pitch to the jury",
    title: "The Final Stage",
    when: "27 January – 12 February 2027",
    columns: [
      { heading: "Junior Track", lines: [["Junior Track Final", "27 January 2027"], ["Teams", "Top 8"], ["After the final", "Immersion and next-stage opportunity, April–May 2027"]] },
      { heading: "Senior Track", lines: [["Online semi-finals", "28 January 2027 · top 40 teams"], ["Finalists", "Top 8 selected on 30 January"], ["Grand Finale", "12 February 2027 · GITAM Hyderabad"]] },
    ],
    listTitle: "Pitch format",
    list: ["8 minutes to pitch", "10 minutes of Q&A with the jury", "Number of slides is up to you"],
    note: ["Semi-finals", "20-minute slot per team: 8 to present, 10 of Q&A, 2 of buffer."],
    cta: { label: "Prizes", href: "#prizes" },
  },
] as const;
