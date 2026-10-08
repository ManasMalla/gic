import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";
import { overviewStats, tracks } from "@/content/tracks";
import { cn } from "@/lib/cn";

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function Tracks() {
  return (
    <Section id="tracks">
      <SectionHeading
        eyebrow="Find your path"
        title="Choose your track"
        description="Choose the track that best fits your stage — whether you're a school student with a promising idea or a founder building the next big venture."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {tracks.map((t, i) => (
          <article
            key={t.id}
            className={cn(
              "flex flex-col rounded-[1.75rem] p-8 sm:p-10",
              i === 0 ? "bg-cream text-ink" : "bg-forest text-white",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={cn("inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest", i === 0 ? "bg-brand text-white" : "bg-mint text-forest")}>
                  {t.name}
                </p>
                <h3 className="mt-4 font-display text-3xl font-bold">{t.audience}</h3>
              </div>
              <span className="font-display text-5xl font-bold opacity-25" aria-hidden>0{i + 1}</span>
            </div>

            <dl className={cn("mt-8 divide-y text-sm", i === 0 ? "divide-ink/10" : "divide-white/15")}>
              <Row k="Who can apply" v={t.eligibility} />
              <Row k="Team size" v={t.teamSize} />
              <Row k="Idea stage" v={t.ideaStage} />
              <Row k="Screening" v={t.screening} />
              <Row k="Mentorship" v={t.mentorship} />
              <Row k="Grand Finale" v={t.finale} />
            </dl>

            <div className={cn("mt-8 rounded-2xl p-6", i === 0 ? "bg-white/70" : "bg-white/10")}>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Total track value</p>
              <p className="mt-2 font-display text-3xl font-bold">{t.cash}</p>
              <p className="opacity-80">+ {t.ecosystemValue}</p>
            </div>

            <p className="mt-5 text-sm opacity-75">
              <strong>Verification:</strong> {t.verification}
            </p>

            <div className="mt-auto pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-current/15 pt-6">
              <p>
                <span className="font-display text-3xl font-bold">{rupee(t.fee)}</span>
                <span className="ml-1 text-sm opacity-70">per team</span>
              </p>
              <ButtonLink href={`/register?track=${t.id}`} variant={i === 0 ? "brand" : "primary"}>
                Register for {t.name.split(" ")[0]}
              </ButtonLink>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-card bg-mint-soft p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Registration window</p>
        <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
          {site.registration.opens} — {site.registration.closes}
          {site.registration.extended && <span className="ml-3 rounded-full bg-gold px-3 py-1 align-middle text-xs font-bold uppercase tracking-wide">Extended</span>}
        </p>
      </div>

      <div className="mt-24">
        <SectionHeading eyebrow="GIC 2026" title="Overview" description="A national platform connecting student innovators, mentors, investors, institutions and the wider startup ecosystem." />
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line md:grid-cols-3 lg:grid-cols-6">
          {overviewStats.map((s) => (
            <div key={s.label} className="bg-white p-6 text-center">
              <dd className="font-display text-4xl font-bold text-brand">
                {s.value}
                <span className="text-2xl">{s.suffix}</span>
              </dd>
              <dt className="mt-2 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
      <dt className="font-semibold uppercase tracking-wider text-xs opacity-70 pt-0.5">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
