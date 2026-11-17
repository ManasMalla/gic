import { cn } from "@/lib/cn";
import { Container } from "./container";

type Tone = "light" | "soft" | "cream" | "dark" | "night" | "night2" | "antique";

const tones: Record<Tone, string> = {
  light: "bg-white text-ink",
  soft: "bg-mint-soft text-ink",
  cream: "bg-cream-soft text-ink",
  dark: "bg-forest text-white",
  night: "on-dark bg-night text-white",
  night2: "on-dark bg-night-2 text-white",
  antique: "on-cream bg-cream text-night-2",
};

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
  tone?: "light" | "dark" | "night" | "antique";
  align?: "left" | "center";
  className?: string;
}) {
  if (tone === "night" || tone === "antique") {
    const cream = tone === "antique";
    return (
      <header className={cn("max-w-4xl", align === "center" && "mx-auto text-center", className)}>
        {eyebrow && (
          <p className={cn("mb-5 flex items-center gap-3 text-sm font-medium", cream ? "text-night" : "text-lit", align === "center" && "justify-center")}>
            <span className={cn("h-px w-10", cream ? "bg-night/60" : "bg-lit/70")} aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 className={cn("text-balance font-display text-4xl font-bold leading-[0.98] tracking-tight sm:text-6xl", cream && "text-night")}>{title}</h2>
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

/** The one highlighted word in a night-theme headline. */
export function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-lit [.on-cream_&]:text-antique-gold">{children}</span>;
}
