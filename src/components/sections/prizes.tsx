import Image from "next/image";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { prizeShowcase } from "@/content/home";
import { prizeTracks, specialAccolades, specialRecognition } from "@/content/prizes";
import { cn } from "@/lib/cn";

const glass = "rounded-3xl border border-white/10 bg-white/[0.04]";
const rank = ["border-lit bg-lit text-night", "border-white/30 bg-white/10 text-white", "border-lit-soft/40 bg-lit-soft/10 text-lit-soft"];

export function Prizes() {
  return (
    <Section id="prizes" tone="night">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-lit/15 blur-[130px]" aria-hidden />
      <div className="relative">
        <div className="text-center">
          <p className="mb-5 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-lit">
            <span className="h-px w-10 bg-lit/70" aria-hidden />
            Prizes &amp; accolades
            <span className="h-px w-10 bg-lit/70" aria-hidden />
          </p>
          <p className="font-sans text-7xl font-extrabold uppercase leading-none tracking-tight text-lit sm:text-[9rem]">₹50 Lakh+</p>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-xl font-semibold sm:text-2xl">
            Not just a prize pool. A reason to go all in.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-white/55">Cumulative cash prizes, grants and ecosystem value recognising outstanding ideas, teams and innovators.</p>
        </div>

        <ul className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {prizeShowcase.map((p) => (
            <li key={p.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <Image {...p.image} alt="" sizes="160px" className="mx-auto size-24 object-contain" />
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">{p.label}</p>
            </li>
          ))}
        </ul>

        <div className="mt-24 space-y-20">
          {prizeTracks.map((t) => (
            <div key={t.id}>
              <div className="flex items-center gap-5">
                <Image {...t.image} alt="" className="size-16 object-contain" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-lit">{t.label}</p>
                  <h3 className="font-sans text-3xl font-extrabold uppercase tracking-tight">{t.title}</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {t.prizes.map((p, i) => (
                  <article key={p.rank} className={cn(glass, "p-7", i === 0 && "border-lit/40 bg-gradient-to-b from-lit/[0.12] to-white/[0.02]")}>
                    <span className={cn("inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]", rank[i])}>{p.rank}</span>
                    <p className="mt-5 font-sans text-5xl font-extrabold tracking-tight">{p.cash}</p>
                    <p className="text-sm text-white/50">cash prize</p>
                    <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm leading-relaxed text-white/70">
                      {p.perks.map((perk) => (
                        <li key={perk} className="flex gap-2.5">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lit" aria-hidden />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              {t.footer && (
                <div className="mt-4 rounded-3xl border border-lit/30 bg-lit/[0.08] p-6 sm:p-8">
                  <p className="font-sans text-xl font-extrabold uppercase tracking-tight text-lit">{t.footer.title}</p>
                  <p className="mt-2 max-w-3xl text-white/70">{t.footer.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-24">
          <SectionHeading tone="night" eyebrow="Beyond the podium" title={<>Special <Accent>accolades</Accent></>} />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {specialAccolades.map((a) => (
              <article key={a.title} className={cn(glass, "flex gap-5 p-7")}>
                <Image {...a.image} alt="" className="size-20 shrink-0 object-contain" />
                <div>
                  <h4 className="font-sans text-xl font-extrabold uppercase tracking-tight">{a.title}</h4>
                  <p className="mt-1 font-sans text-4xl font-extrabold tracking-tight text-lit">{a.cash}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-white/60">
                    {a.perks.map((p) => <li key={p}>• {p}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <article className="mt-4 rounded-3xl border border-lit/30 bg-lit/[0.06] p-7 sm:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-lit">Special recognition</p>
            <h4 className="mt-2 font-sans text-2xl font-extrabold uppercase tracking-tight">{specialRecognition.title}</h4>
            <p className="text-sm text-white/50">{specialRecognition.sponsor}</p>
            <p className="mt-3 max-w-2xl text-white/70">{specialRecognition.body}</p>
            <dl className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
              {specialRecognition.cash.map((c) => (
                <div key={c.rank}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{c.rank}</dt>
                  <dd className="font-sans text-3xl font-extrabold tracking-tight text-lit">{c.amount}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </div>
    </Section>
  );
}
