import { media } from "@/lib/media";

// NOTE: names are inferred from the original logo filenames — please review.
export type Partner = {
  name: string; src: string; width: number; height: number;
  href?: string;   // tile links out to the partner's site (new tab)
  maxH?: number;   // px cap on this logo's height (use for tall marks that crowd the tile)
  shiftX?: number; // optical centring: % of the logo's own width to move right (+) / left (-)
};

const logo = (file: string, name: string, opts: Pick<Partner, "href" | "maxH" | "shiftX"> = {}): Partner => ({ name, ...media(`/media/logos/${file}.webp`), ...opts });

export const partners: Partner[] = [
  logo("gitam-logos-header", "GITAM"),
  logo("bower", "Bower School of Entrepreneurship"),
  logo("gitamvdc", "GITAM Venture Development Centre"),
  logo("gitamit", "GITAM i-TBI"),
  logo("e-club", "E-Club"),
  logo("gtec", "G-TEC (DST GITAM Technology Enabling Centre)"),
  logo("wadwani", "Wadhwani Foundation"),
  logo("openct-logo", "OpenCT"),
  logo("balavikas", "Balavikas"),
  logo("IHH-logo", "Impact Hub Hyderabad"),
  logo("ALIF-logo", "ALIF"),
  logo("d2d_logo", "D2D"),
  logo("RTIH-logo", "RTIH"),
  logo("hub", "Hub"),
  // The robot "B" is visually heavy on the left, so it is nudged right to look centred, and sized down a little.
  logo("brainybotz-official", "BrainyBotz", { href: "https://brainybotz.in", maxH: 68, shiftX: 7 }),
];

export const previousPartners: Partner[] = [
  logo("ctrls", "CtrlS"),
  logo("grayquest", "GrayQuest"),
  logo("thinking-forks", "Thinking Forks"),
  logo("coempt", "Coempt"),
  logo("moschip", "MosChip"),
  logo("global-tree", "Global Tree"),
  logo("nutrify", "Nutrify"),
  logo("tie-hyderabad", "TiE Hyderabad"),
  logo("t-hub", "T-Hub"),
  logo("faba", "FABA"),
  logo("st", "ST"),
  logo("tez", "TEZ"),
  logo("airc", "AIRC"),
  logo("jtbi", "JTBI"),
  logo("we-hub", "WE Hub"),
  logo("rich", "RICH"),
  logo("startup", "Startup"),
  logo("tic", "TIC"),
  logo("qapita", "Qapita"),
  logo("headstart", "Headstart"),
  logo("karnataka", "Government of Karnataka"),
  logo("img_2", "Partner"),
];
