import { Compass, Handshake, Layers, MapPin, Rocket, Trophy, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { aboutHighlights } from "@/content/tracks";

const highlightIcons: LucideIcon[] = [Trophy, Layers, Compass];

function IconTile({ icon: Icon, accent }: { icon: LucideIcon; accent?: boolean }) {
  return (
    <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${accent ? "bg-gold text-ink" : "bg-brand/10 text-brand"}`}>
      <Icon className="size-6" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

export function About() {
  return (
    <Section id="about" tone="cream">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <SectionHeading
          eyebrow="About GIC 2026"
          title={<>Pitch your idea.<br />Build the future.</>}
          description="India's premier national-level student venture challenge is back for its 6th edition. GIC 2026 empowers school and college innovators building scalable, sustainable, and resilient solutions for India's future. Building on six years of momentum and thousands of applications from across India, this year's edition brings:"
        />
        <ul className="grid gap-4 self-end sm:grid-cols-3 lg:grid-cols-1">
          {aboutHighlights.map((h, i) => (
            <li key={h.title} className="flex gap-4 rounded-card bg-white p-6 shadow-card sm:flex-col lg:flex-row">
              <IconTile icon={highlightIcons[i]} />
              <div>
                <p className="font-display text-2xl font-bold text-brand">{h.title}</p>
                <p className="mt-1 text-muted">{h.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        <Feature icon={Handshake} eyebrow="More than a competition" title="A journey beyond the pitch">
          GITAM x Bower Innovation Challenge is more than a pitch deck competition — it connects you directly with
          founders, early-stage investors, and dedicated venture coaches from day one, with access to inspiring
          sessions and valuable networks along the way.
        </Feature>
        <Feature icon={MapPin} eyebrow="New format" title="In-person regional rounds" accent>
          We&apos;re introducing in-person regional rounds for the Junior Track — enabling more students the chance to
          pitch face-to-face before the Grand Finale.
        </Feature>
        <Feature icon={Rocket} eyebrow="Junior Track" title="Before the Grand Finale">
          This is what sets GITAM x Bower Innovation Challenge apart, making it a unique and impactful experience for
          everyone involved. Join us in 2026, where your ideas can shape the future and create lasting impact.
        </Feature>
      </div>
    </Section>
  );
}

function Feature({ icon, eyebrow, title, accent, children }: { icon: LucideIcon; eyebrow: string; title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <article className={accent ? "rounded-card bg-forest p-8 text-white" : "rounded-card border border-line bg-white p-8"}>
      <IconTile icon={icon} accent={accent} />
      <p className={`mt-5 text-xs font-semibold uppercase tracking-[0.2em] ${accent ? "text-gold" : "text-brand"}`}>{eyebrow}</p>
      <h3 className="mt-3 font-display text-2xl font-bold">{title}</h3>
      <p className={`mt-3 leading-relaxed ${accent ? "text-white/80" : "text-muted"}`}>{children}</p>
    </article>
  );
}
