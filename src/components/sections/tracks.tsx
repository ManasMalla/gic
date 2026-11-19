import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";
import { tracks } from "@/content/tracks";
import { cn } from "@/lib/cn";

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function Tracks() {
  return (
    <Section id="tracks" tone="antique">
      <SectionHeading
        tone="paper"
        eyebrow="Find your path"
        title={<>Choose your <Accent>track</Accent></>}
        description="Choose the track that best fits your stage — whether you're a school student with a promising idea or a founder building the next big venture."
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {tracks.map((t, i) => (
          <article
            key={t.id}
            className={cn(
              "sticker flex flex-col bg-white p-8 sm:p-10",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={cn("inline-block rounded-full border-2 border-night-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-night-2", i === 0 ? "bg-accent/60" : "bg-mint")}>{t.name}</p>
                <h3 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight">{t.audience}</h3>
              </div>
              <span className="font-display text-6xl font-bold text-night-2/10" aria-hidden>0{i + 1}</span>
            </div>

            <dl className="mt-8 divide-y divide-night-2/15 text-sm">
              <Row k="Who can apply" v={t.eligibility} />
              <Row k="Team size" v={t.teamSize} />
              <Row k="Idea stage" v={t.ideaStage} />
              <Row k="Screening" v={t.screening} />
              <Row k="Mentorship" v={t.mentorship} />
              <Row k="Grand Finale" v={t.finale} />
            </dl>

            <div className="sticker-sm mt-8 bg-cream p-6">
              <p className="text-sm font-medium text-night-2/70">Total track value</p>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-night">{t.cash}</p>
              <p className="mt-1 text-night-2/80">+ {t.ecosystemValue}</p>
            </div>

            <p className="mt-5 text-sm text-night-2/50">
              <strong className="text-night-2/70">Verification:</strong> {t.verification}
            </p>

            <div className="mt-auto pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-night-2/20 pt-6">
                <p>
                  <span className="font-display text-3xl font-bold">{rupee(t.fee)}</span>
                  <span className="ml-1 text-sm text-night-2/70">per team</span>
                </p>
                <ButtonLink href={`/register?track=${t.id}`} className="">
                  Register for {t.name.split(" ")[0]} ↗
                </ButtonLink>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-base text-night-2/70">
        Registration closes <span className="font-bold text-night-2">{site.registration.closes}</span>
        {site.registration.extended && <span className="ml-3 rounded-full border-2 border-night-2 bg-accent px-3 py-1 text-[11px] font-bold tracking-wider text-night-2">Extended</span>}
      </p>
    </Section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
      <dt className="pt-0.5 text-sm font-medium text-night-2/70">{k}</dt>
      <dd className="text-night-2/85">{v}</dd>
    </div>
  );
}
