import { media } from "@/lib/media";

// NOTE: names are inferred from the original logo filenames — please review.
const logo = (file: string, name: string) => ({ name, ...media(`/media/logos/${file}.webp`) });

export const partners = [
  logo("gitam-logos-header", "GITAM"),
  logo("bower", "Bower School of Entrepreneurship"),
  logo("gitamvdc", "GITAM Venture Development Centre"),
  logo("gitamit", "GITAM i-TBI"),
  logo("e-club", "E-Club"),
  logo("dpiit", "DPIIT Startup India"),
  logo("wadwani", "Wadhwani Foundation"),
  logo("openct-logo", "OpenCT"),
  logo("science-city", "Science City"),
  logo("balavikas", "Balavikas"),
  logo("yo-vizag", "YO Vizag"),
  logo("github", "GitHub"),
  logo("IHH-logo", "Impact Hub Hyderabad"),
  logo("TIE", "TiE"),
  logo("vizag-startups", "Vizag Startups"),
  logo("grammena", "Grammena"),
  logo("ALIF-logo", "ALIF"),
  logo("d2d_logo", "D2D"),
  logo("RTIH-logo", "RTIH"),
  logo("hub", "Hub"),
] as const;

export const previousPartners = [
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
] as const;
