export type Track = {
  id: "junior" | "main";
  name: string;
  audience: string;
  eligibility: string;
  teamSize: string;
  ideaStage: string;
  fee: number; // INR per team
  screening: string;
  mentorship: string;
  finale: string;
  cash: string;
  ecosystemValue: string;
  verification: string;
};

export const tracks: Track[] = [
  {
    id: "junior",
    name: "Junior Track",
    audience: "School Students · Class 10–12",
    eligibility: "School students (Class 10–12, Indian citizenship)",
    teamSize: "2–4 members, same school",
    ideaStage: "Concept / Early Idea",
    fee: 499,
    screening: "Online + Regional Round (travel to the nearest of 3 campuses)",
    mentorship: "Group Bootcamp + Panel Coaching",
    finale: "Dedicated Session, Hyderabad Campus",
    cash: "₹1,00,000 cash",
    ecosystemValue: "up to ₹16,00,000 in ecosystem value",
    verification: "A school ID or a principal's letter is needed at the shortlisting stage.",
  },
  {
    id: "main",
    name: "Main Track",
    audience: "UG Students & Graduates · 2025 onwards",
    eligibility: "UG students & graduates from 2025 onwards, enrolled in any Indian university",
    teamSize: "2–6 members (Lead + Co-lead)",
    ideaStage: "Idea, Prototype or MVP",
    fee: 699,
    screening: "Online Rounds + Offline Finale",
    mentorship: "Online Bootcamps + 1:1 Coaching",
    finale: "Main Stage Finale, Hyderabad Campus",
    cash: "₹4,90,000+ cash",
    ecosystemValue: "up to ₹25,00,000 in ecosystem value",
    verification: "A student ID or bonafide letter is required at shortlisting.",
  },
];

export const overviewStats = [
  { value: "50", suffix: "Lakh+", label: "Cash and Grants" },
  { value: "5000", suffix: "+", label: "Startup Ideas" },
  { value: "100", suffix: "+", label: "Pitches" },
  { value: "50", suffix: "+", label: "Jury" },
  { value: "30", suffix: "+", label: "Partners" },
  { value: "29", suffix: "", label: "State Representations" },
] as const;

export const aboutHighlights = [
  { title: "₹50,00,000+", body: "Cumulative Prize Pool & Ecosystem Value" },
  { title: "2 Dedicated Tracks", body: "Junior (School) & Main (College/Graduates)" },
  { title: "Comprehensive Journey", body: "Bootcamps, 1:1 Venture Coaching & National Grand Finale" },
] as const;
