// Source: "GITAM Innovation Challenge 2026 — Corporate Partnership Brochure" (PDF).
// NB: competition dates/prize figures here follow the brochure and can differ from
// the main site (site.ts / timeline.ts are the source of truth for those).

export const sponsorHero = {
  eyebrow: "Corporate Partnership · 2026",
  title: "Partner with India's next generation of founders",
  subtitle: "Where school innovators and campus founders turn bold ideas into ventures worth building.",
  finale: { day: "11", month: "Dec", year: "2026", venue: "GITAM Hyderabad Campus" },
};

export const whyPartner = [
  { title: "Discover Talent", body: "Meet ambitious innovators and early-stage founders.", accent: "mint" },
  { title: "Access Ideas", body: "Discover ideas across five high-opportunity sectors.", accent: "gold" },
  { title: "Shape Founders", body: "Mentor, evaluate, teach or co-create challenges.", accent: "coral" },
  { title: "Build Brand Relevance", body: "Build relevance with youth, innovation and entrepreneurship.", accent: "blue" },
] as const;

export const legacyStats = {
  headline: { value: "7,500+", label: "Startup ideas received" },
  grid: [
    { value: "₹80L+", label: "Cash & grants" },
    { value: "350+", label: "Teams pitched" },
    { value: "190+", label: "Jury & experts" },
    { value: "60+", label: "Partners" },
  ],
  states: { value: "29", label: "States represented" },
  gitamScale: [
    { value: "25,000+", label: "students" },
    { value: "90,000+", label: "alumni" },
    { value: "105+", label: "countries" },
  ],
  note: "Historical figures supplied by the organisers.",
};

export const projectedReach = {
  headline: { value: "3,000+", label: "idea submissions expected across both tracks" },
  grid: [
    { value: "20+", label: "States" },
    { value: "3", label: "Campuses" },
    { value: "64", label: "Semi-finalists" },
    { value: "16", label: "Finalists" },
  ],
  note: "2026 figures are organiser projections until achieved.",
};

export const sponsorTracks = [
  { badge: "Junior Track", name: "School innovators", relevance: "School visibility · future talent · innovation engagement", focus: "Creative thinking · prototype concepts · teamwork · first pitch" },
  { badge: "Main Track", name: "Campus founders", relevance: "Talent engagement · mentoring · sector idea discovery", focus: "Startup ideas · prototypes · market opportunity · early traction" },
] as const;

export const journeyTouchpoints = [
  { code: "R0", stage: "Register", what: "1-min pitch + deck", touchpoint: "Campaign + challenge" },
  { code: "R1", stage: "Screen", what: "Quality + relevance", touchpoint: "Expert reviewers" },
  { code: "R2", stage: "Refine", what: "Bootcamp + mentoring", touchpoint: "Workshops + office hours" },
  { code: "R3", stage: "Pitch", what: "Semi-finals + regionals", touchpoint: "Jury + campus activation" },
  { code: "R4", stage: "Finale", what: "Live stage + awards", touchpoint: "Stage + booth + networking" },
] as const;

export const finaleFlow = [
  { time: "8:30", label: "Registration + exhibition" },
  { time: "9:30", label: "Networking breakfast" },
  { time: "10:30", label: "Inaugural ceremony" },
  { time: "11:00", label: "Industry keynote" },
  { time: "11:45", label: "Innovation panel" },
  { time: "12:30", label: "Junior Track finals", bold: true },
  { time: "1:30", label: "Networking lunch" },
  { time: "2:15", label: "Main Track finals", bold: true },
  { time: "4:30", label: "People's Choice" },
  { time: "5:00", label: "Awards ceremony", bold: true },
  { time: "6:30", label: "Media + networking" },
] as const;

export const partnerPresence = ["Exhibition", "Jury", "Keynote", "Awards", "Demo", "Talent", "Media", "Networking"] as const;

export const gains = [
  { title: "Innovation Access", body: "Selected teams · sector ideas · emerging trends" },
  { title: "Talent Engagement", body: "Mentoring · jury roles · internships" },
  { title: "Thought Leadership", body: "Theme ownership · keynote · workshops" },
  { title: "Brand Visibility", body: "Campaign · campus · stage · exhibition" },
] as const;

export const impactReport = [
  "Applications", "States", "Institutions", "Theme mix",
  "Digital reach", "Attendance", "Founder interactions", "Media",
] as const;

export type Tier = { id: string; name: string; price: string; headline: string; level: string; accent: "coral" | "teal" | "gold" | "blue" | "mint" };

export const tiers: Tier[] = [
  { id: "title", name: "Title Partner", price: "₹25L", headline: "Event naming · exclusivity · keynote", level: "Programme", accent: "coral" },
  { id: "platinum", name: "Platinum", price: "₹15L", headline: "Main stage · 2 seats · activation", level: "Stage", accent: "teal" },
  { id: "gold", name: "Gold", price: "₹7.5L", headline: "Booth · jury · campus visibility", level: "Theme", accent: "gold" },
  { id: "theme", name: "Theme", price: "₹4L", headline: "Theme naming · mentor · award", level: "Theme", accent: "blue" },
  { id: "ecosystem", name: "Ecosystem", price: "Custom", headline: "Mentors · tools · credits · services", level: "Ecosystem", accent: "mint" },
];

export const tierAvailability = "Limited opportunities: 1 Title Partner · 5 Theme Partners · category exclusivity subject to agreement";

// true = included, false = not included, string = qualifier, "half" = partial
export type Cell = boolean | "half" | string;
export const benefitColumns = ["Title", "Plat.", "Gold", "Theme", "Eco."] as const;
export const benefits: { name: string; values: [Cell, Cell, Cell, Cell, Cell] }[] = [
  { name: "Event naming", values: [true, false, false, false, false] },
  { name: "Category exclusivity", values: [true, "half", false, "Theme", false] },
  { name: "Keynote / opening", values: [true, false, false, false, false] },
  { name: "Main-stage branding", values: [true, true, false, false, false] },
  { name: "Jury / mentor seats", values: ["2+", "2", "1", "1", "1"] },
  { name: "Theme / award naming", values: [true, true, false, true, false] },
  { name: "Exhibition space", values: ["Premium", "Premium", "Std.", false, false] },
  { name: "Masterclass / workshop", values: [true, true, false, "Theme", false] },
  { name: "Digital campaign", values: ["Premium", "Premium", "Std.", "Theme", "Ack."] },
  { name: "Founder engagement", values: [true, true, "Limited", "Theme", false] },
  { name: "Impact report", values: ["Detailed", "Detailed", "Std.", "Std.", "Ack."] },
];

export const objectives = [
  { title: "Sector Challenge", body: "Bring a real industry problem" },
  { title: "Bootcamp Masterclass", body: "Teach founders what matters" },
  { title: "Internships", body: "Create opt-in talent pathways" },
  { title: "Regional Round", body: "Own a campus activation" },
  { title: "Special Award", body: "Women-led · Tier 2/3 · People's Choice" },
  { title: "Tools & Credits", body: "Support teams with real resources" },
] as const;

export const sponsorDisclaimer =
  "All deliverables are subject to schedule, branding deadlines, participant consent, jury independence and a written partnership agreement.";

export const sponsorContacts = {
  office: { name: "Corporate Partnerships", org: "Venture Development Centre, GITAM", email: "vkumar4@gitam.edu", site: "vdc.gitam.edu", href: "https://vdc.gitam.edu/" },
  outreach: [
    { name: "Madhav", role: "President, E-Club (GITAM), Hyderabad", phone: "+91 83280 77707", email: "mvadaval@gitam.in" },
    { name: "Rishabh", role: "Vice President - Outreach", phone: "+91 90630 65811", email: "rchauhan@student.gitam.edu" },
  ],
} as const;
