import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { aboutBullets, aboutStats } from "@/content/home";

const glass = "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm";

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
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-lit">The experience</p>
            <h3 className="mt-5 font-sans text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
              More Than
              <br />
              Just A Competition.
            </h3>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">Every round is built to reveal how students think, adapt, collaborate and perform under pressure.</p>
          </div>
          <ol className="relative mt-10 divide-y divide-white/10 border-y border-white/10">
            {aboutBullets.map((b, i) => (
              <li key={b.title} className="py-6">
                <p className="flex items-baseline gap-4 font-sans text-xl font-bold tracking-tight sm:text-2xl">
                  <span className="text-sm font-bold text-lit">{String(i + 1).padStart(2, "0")}</span>
                  {b.title}
                </p>
                <p className="mt-2 pl-9 text-white/50">{b.body}</p>
              </li>
            ))}
          </ol>
        </article>

        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {aboutStats.map((s) => (
            <li key={s.label} className={`${glass} p-8`}>
              <p className="font-sans text-6xl font-extrabold tracking-tight text-lit">{s.value}</p>
              <p className="mt-4 font-semibold">{s.label}</p>
              <p className="mt-1 text-sm text-white/50">{s.note}</p>
            </li>
          ))}
        </ul>

        <p className="mt-14 text-balance font-sans text-2xl font-extrabold tracking-tight sm:text-4xl">
          Built for students who are ready to <Accent>think differently.</Accent>
        </p>
      </div>
    </Section>
  );
}
