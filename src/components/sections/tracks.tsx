import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";
import { tracks } from "@/content/tracks";
import { cn } from "@/lib/cn";

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function Tracks() {
  return (
    <Section id="tracks" tone="night2">
      <SectionHeading
        tone="night"
        eyebrow="Find your path"
        title={<>Choose your <Accent>track</Accent></>}
        description="Choose the track that best fits your stage — whether you're a school student with a promising idea or a founder building the next big venture."
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {tracks.map((t, i) => (
          <article
            key={t.id}
            className={cn(
              "flex flex-col rounded-[2rem] border p-8 sm:p-10",
              i === 0 ? "border-white/10 bg-white/[0.04]" : "border-lit/30 bg-gradient-to-br from-lit/[0.14] to-white/[0.02]",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-block rounded-full border border-lit/40 bg-lit/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-lit">{t.name}</p>
                <h3 className="mt-5 font-sans text-3xl font-extrabold uppercase leading-tight tracking-tight">{t.audience}</h3>
              </div>
              <span className="font-sans text-6xl font-extrabold text-white/10" aria-hidden>0{i + 1}</span>
            </div>

            <dl className="mt-8 divide-y divide-white/10 text-sm">
              <Row k="Who can apply" v={t.eligibility} />
              <Row k="Team size" v={t.teamSize} />
              <Row k="Idea stage" v={t.ideaStage} />
              <Row k="Screening" v={t.screening} />
              <Row k="Mentorship" v={t.mentorship} />
              <Row k={i === 0 ? "Final" : "Grand Finale"} v={t.finale} />
            </dl>

            <div className="mt-8 rounded-2xl border border-white/10 bg-night/50 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">Total track value</p>
              <p className="mt-2 font-sans text-4xl font-extrabold tracking-tight text-lit">{t.cash}</p>
              <p className="mt-1 text-white/60">+ {t.ecosystemValue}</p>
            </div>

            <p className="mt-5 text-sm text-white/50">
              <strong className="text-white/70">Verification:</strong> {t.verification}
            </p>

            <div className="mt-auto pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                <p>
                  <span className="font-sans text-3xl font-extrabold">{rupee(t.fee)}</span>
                  <span className="ml-1 text-sm text-white/50">per team</span>
                </p>
                <ButtonLink href={`/register?track=${t.id}`} className="uppercase tracking-wider">
                  Register for {t.name.split(" ")[0]} ↗
                </ButtonLink>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-sm uppercase tracking-[0.25em] text-white/50">
        Registration closes <span className="font-bold text-white">{site.registration.closes}</span>
        {site.registration.extended && <span className="ml-3 rounded-full bg-lit px-3 py-1 text-[11px] font-bold tracking-wider text-night">Extended</span>}
      </p>
    </Section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
      <dt className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45">{k}</dt>
      <dd className="text-white/85">{v}</dd>
    </div>
  );
}
