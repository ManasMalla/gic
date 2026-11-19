/** Options for the "Stream" (Junior) / "Programme" (Senior) question. "Other" lets the applicant type their own. */
export const OTHER_STREAM = "Other";

export const STREAMS = {
  junior: ["Science (MPC)", "Science (BiPC)", "Science (MBiPC)", "Commerce", "Arts / Humanities", "Not chosen yet (Class 10)", OTHER_STREAM],
  main: ["B.Tech", "B.Sc", "BBA", "B.Com", "BA", "BCA", "B.Pharm", "M.Tech", "M.Sc", "MBA", OTHER_STREAM],
} as const;

export const streamLabel = (track: string) => (track === "junior" ? "Stream" : "Programme");
