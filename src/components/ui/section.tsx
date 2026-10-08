import { cn } from "@/lib/cn";
import { Container } from "./container";

type Tone = "light" | "soft" | "cream" | "dark";

const tones: Record<Tone, string> = {
  light: "bg-white text-ink",
  soft: "bg-mint-soft text-ink",
  cream: "bg-cream-soft text-ink",
  dark: "bg-forest text-white",
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
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
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
