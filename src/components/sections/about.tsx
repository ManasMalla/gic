import { Globe, Handshake, Sprout, type LucideIcon } from "lucide-react";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { aboutBullets, aboutStats } from "@/content/home";

const bulletIcons: LucideIcon[] = [Handshake, Sprout, Globe];

export function About() {
  return (
    <Section id="about" tone="night2" className="overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-lit/10 blur-[120px]" aria-hidden />
      <div className="relative">
        <SectionHeading
          tone="night"
          eyebrow="About GIC 2026"
          title={<>Think <Accent>beyond</Accent> the ordinary.</>}
          description="GITAM x Bower Innovation Challenge is India's premier national-level student venture challenge, now in its 6th edition. It empowers school and college innovators building scalable, sustainable and resilient solutions for India's future."
        />

        <article className="relative mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-12">
          <div className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden />
          <div className="pointer-events-none absolute -right-24 -top-32 size-[34rem] rounded-full border border-lit/25" aria-hidden />
          <div className="pointer-events-none absolute -right-8 -top-16 size-[30rem] rounded-full border border-white/10" aria-hidden />
          <div className="relative max-w-3xl">
            <p className="text-sm font-medium text-lit">The experience</p>
            <h3 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
              More Than
              <br />
              Just A Competition.
            </h3>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">Every round is built to reveal how students think, adapt, collaborate and perform under pressure.</p>
          </div>
          <ol className="relative mt-10 divide-y divide-white/10 border-y border-white/10">
            {aboutBullets.map((b, i) => {
              const Icon = bulletIcons[i];
              return (
                <li key={b.title} className="flex items-center gap-5 py-6">
                  {/* Brand icon style: simple line icon in a circular enclosure */}
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-beige text-night">
                    <Icon className="size-7" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">{b.title}</p>
                    <p className="mt-1 text-white/70">{b.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </article>

        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {aboutStats.map((s) => (
            <li key={s.label} className="rounded-3xl bg-lit p-8 text-night-2">
              <p className="font-display text-6xl font-bold tracking-tight text-night">{s.value}</p>
              <p className="mt-4 font-semibold">{s.label}</p>
              <p className="mt-1 text-sm text-night-2/70">{s.note}</p>
            </li>
          ))}
        </ul>

        <p className="mt-14 text-balance font-display text-2xl font-bold tracking-tight sm:text-4xl">
          Built for students who are ready to <Accent>think differently.</Accent>
        </p>
      </div>
    </Section>
  );
}
