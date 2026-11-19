import { cn } from "@/lib/cn";
import { Container } from "./container";

type Tone = "light" | "soft" | "cream" | "dark" | "night" | "night2" | "antique" | "paper";

const tones: Record<Tone, string> = {
  light: "bg-white text-ink",
  soft: "bg-mint-soft text-ink",
  cream: "bg-cream-soft text-ink",
  dark: "bg-forest text-white",
  night: "on-dark bg-night text-white",
  night2: "on-dark bg-night-2 text-white",
  antique: "on-cream bg-cream text-night-2",
  paper: "on-cream grid-paper text-night-2",
};

/** The VDC look: coloured sections are rounded bands inset from the page edge; paper sections run edge to edge. */
const BANDS: Tone[] = ["night", "night2", "antique"];

export function Section({
  id,
  tone = "light",
  className,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  if (BANDS.includes(tone)) {
    return (
      <section id={id} className="relative px-3 py-3 sm:px-6">
        <div className={cn("relative mx-auto max-w-[88rem] overflow-hidden rounded-[28px] py-16 sm:py-24", tones[tone], className)}>
          <Container>{children}</Container>
        </div>
      </section>
    );
  }
  return (
    <section id={id} className={cn("relative py-20 sm:py-28", tones[tone], className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "light" | "dark" | "night" | "antique" | "paper";
  align?: "left" | "center";
  className?: string;
}) {
  if (tone === "night" || tone === "antique" || tone === "paper") {
    const cream = tone !== "night";
    return (
      <header className={cn("max-w-4xl", align === "center" && "mx-auto text-center", className)}>
        {eyebrow && (
          <p className={cn("mb-5 flex", align === "center" && "justify-center")}>
            {/* VDC-style tag: small caps in a bordered pill, with a dot */}
            <span className={cn("inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em]", cream ? "border-night-2 text-night-2" : "border-lit/70 text-lit")}>
              <span className={cn("size-1.5 rounded-full", cream ? "bg-night" : "bg-lit")} aria-hidden />
              {eyebrow}
            </span>
          </p>
        )}
        <h2 className={cn("text-balance font-display text-4xl font-bold leading-[0.98] tracking-tight sm:text-6xl", cream && "text-night-2")}>{title}</h2>
        {description && <p className={cn("mt-6 max-w-2xl text-pretty text-lg leading-relaxed", cream ? "text-night-2/70" : "text-white/60")}>{description}</p>}
      </header>
    );
  }
  const dark = tone === "dark";
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]",
            align === "center" && "justify-center",
            dark ? "text-mint" : "text-brand",
          )}
        >
          <span className={cn("h-px w-8", dark ? "bg-mint" : "bg-brand")} aria-hidden />
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] sm:text-5xl">{title}</h2>
      {description && (
        <p className={cn("mt-5 text-pretty text-lg leading-relaxed", dark ? "text-white/75" : "text-muted")}>
          {description}
        </p>
      )}
    </header>
  );
}

/** The one highlighted word in a headline: green with a yellow highlighter underline (cream on dark bands). */
export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block text-lit [.on-cream_&]:text-night">
      {children}
      {/* the VDC highlighter underline */}
      <span aria-hidden className="absolute inset-x-0 -bottom-[0.06em] h-[0.16em] rounded-full bg-accent" />
    </span>
  );
}
