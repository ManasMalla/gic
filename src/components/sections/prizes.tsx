import Image from "next/image";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { prizeShowcase } from "@/content/home";
import { prizeTracks, specialAccolades, specialRecognition } from "@/content/prizes";
import { cn } from "@/lib/cn";

const rank = ["bg-accent", "bg-mint", "bg-cream"];

export function Prizes() {
  return (
    <Section id="prizes" tone="night">
      <div className="relative">
        <div className="text-center">
          <p className="mb-6 flex justify-center"><span className="inline-flex items-center gap-2 rounded-full border-2 border-lit/70 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-lit"><span className="size-1.5 rounded-full bg-lit" aria-hidden />Prizes &amp; accolades</span></p>
          <p className="font-display text-7xl font-bold leading-none tracking-tight sm:text-[9rem]"><Accent>₹50 Lakh+</Accent></p>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-xl font-semibold sm:text-2xl">
            Not just a prize pool. A reason to go all in.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-white/70">Cumulative cash prizes, grants and ecosystem value recognising outstanding ideas, teams and innovators.</p>
        </div>

        <ul className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {prizeShowcase.map((p) => (
            <li key={p.label} className="sticker bg-white p-5 text-center text-night-2">
              <Image {...p.image} alt="" sizes="160px" className="mx-auto size-24 object-contain" />
              <p className="mt-4 text-sm font-bold text-night-2/80">{p.label}</p>
            </li>
          ))}
        </ul>

        <div className="mt-24 space-y-20">
          {prizeTracks.map((t) => (
            <div key={t.id}>
              <div className="flex items-center gap-5">
                <span className="sticker-sm grid size-16 shrink-0 place-items-center bg-white"><Image {...t.image} alt="" className="size-11 object-contain" /></span>
                <div>
                  <p className="inline-block rounded-full border-2 border-lit/70 px-3 py-0.5 text-xs font-bold uppercase tracking-[0.14em] text-lit">{t.label}</p>
                  <h3 className="font-display text-3xl font-bold tracking-tight">{t.title}</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {t.prizes.map((p, i) => (
                  <article key={p.rank} className="sticker bg-white p-7 text-night-2">
                    <span className={cn("inline-block rounded-full border-2 border-night-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-night-2", rank[i])}>{p.rank}</span>
                    <p className="mt-5 font-display text-5xl font-bold tracking-tight">{p.cash}</p>
                    <p className="text-sm text-night-2/60">cash prize</p>
                    <ul className="mt-5 space-y-2.5 border-t-2 border-night-2/15 pt-5 text-sm leading-relaxed text-night-2/80">
                      {p.perks.map((perk) => (
                        <li key={perk} className="flex gap-2.5">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-night" aria-hidden />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              {t.footer && (
                <div className="sticker-sm mt-5 bg-accent p-6 text-night-2 sm:p-8">
                  <p className="font-display text-xl font-bold tracking-tight">{t.footer.title}</p>
                  <p className="mt-2 max-w-3xl text-night-2/80">{t.footer.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-24">
          <SectionHeading tone="night" eyebrow="Beyond the podium" title={<>Special <Accent>accolades</Accent></>} />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {specialAccolades.map((a) => (
              <article key={a.title} className="sticker flex gap-5 bg-white p-7 text-night-2">
                <Image {...a.image} alt="" className="size-20 shrink-0 object-contain" />
                <div>
                  <h4 className="font-display text-xl font-bold tracking-tight">{a.title}</h4>
                  <p className="mt-1 font-display text-4xl font-bold tracking-tight text-night">{a.cash}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-night-2/70">
                    {a.perks.map((p) => <li key={p}>• {p}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <article className="sticker mt-5 bg-cream p-7 text-night-2 sm:p-9">
            <p className="inline-block rounded-full border-2 border-night-2 bg-accent/60 px-3 py-0.5 text-xs font-bold uppercase tracking-[0.12em]">Special recognition</p>
            <h4 className="mt-2 font-display text-2xl font-bold tracking-tight">{specialRecognition.title}</h4>
            <p className="text-sm text-night-2/60">{specialRecognition.sponsor}</p>
            <p className="mt-3 max-w-2xl text-night-2/80">{specialRecognition.body}</p>
            <dl className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
              {specialRecognition.cash.map((c) => (
                <div key={c.rank}>
                  <dt className="text-sm font-medium text-night-2/60">{c.rank}</dt>
                  <dd className="font-display text-3xl font-bold tracking-tight text-night">{c.amount}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </div>
    </Section>
  );
}
