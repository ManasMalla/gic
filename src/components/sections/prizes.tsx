import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { prizeTracks, specialAccolades, specialRecognition } from "@/content/prizes";
import { cn } from "@/lib/cn";

const medal = ["bg-gold text-ink", "bg-mint text-forest", "bg-coral/90 text-white"];

export function Prizes() {
  return (
    <Section id="prizes" tone="soft">
      <SectionHeading
        eyebrow="GIC 2026"
        title="Prizes & accolades"
        description="Recognising outstanding ideas, teams and innovators across the GIC 2026 journey."
      />

      <div className="mt-14 space-y-16">
        {prizeTracks.map((t) => (
          <div key={t.id}>
            <div className="flex items-center gap-5">
              <Image {...t.image} alt="" className="size-16 object-contain" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{t.label}</p>
                <h3 className="font-display text-3xl font-bold">{t.title}</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {t.prizes.map((p, i) => (
                <article key={p.rank} className="rounded-card bg-white p-7 shadow-card">
                  <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", medal[i])}>{p.rank}</span>
                  <p className="mt-4 font-display text-4xl font-bold text-brand">{p.cash}</p>
                  <p className="text-sm text-muted">cash prize</p>
                  <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm leading-relaxed">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex gap-2.5">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            {t.footer && (
              <div className="mt-5 rounded-card bg-forest p-6 text-white sm:p-8">
                <p className="font-display text-xl font-bold text-gold">{t.footer.title}</p>
                <p className="mt-2 max-w-3xl text-white/80">{t.footer.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h3 className="font-display text-3xl font-bold">Special accolades</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {specialAccolades.map((a) => (
            <article key={a.title} className="flex gap-5 rounded-card bg-white p-7 shadow-card">
              <Image {...a.image} alt="" className="size-20 shrink-0 object-contain" />
              <div>
                <h4 className="font-display text-xl font-bold">{a.title}</h4>
                <p className="mt-1 font-display text-3xl font-bold text-brand">{a.cash}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {a.perks.map((p) => <li key={p}>• {p}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <article className="mt-5 rounded-card border border-gold/60 bg-cream-soft p-7 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Special recognition</p>
          <h4 className="mt-2 font-display text-2xl font-bold">{specialRecognition.title}</h4>
          <p className="text-sm text-muted">{specialRecognition.sponsor}</p>
          <p className="mt-3 max-w-2xl">{specialRecognition.body}</p>
          <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
            {specialRecognition.cash.map((c) => (
              <div key={c.rank}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{c.rank}</dt>
                <dd className="font-display text-2xl font-bold text-brand">{c.amount}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </Section>
  );
}
