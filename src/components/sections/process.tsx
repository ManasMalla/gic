import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { challenges } from "@/content/home";
import { process } from "@/content/process";

const apply = process.find((g) => g.id === "registration");

export function Process() {
  return (
    <Section id="process" tone="night" className="overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-20 size-[40rem] rounded-full bg-lit/10 blur-[140px]" aria-hidden />
      <div className="relative">
        <p className="flex items-center gap-4 text-sm font-medium text-lit">
          <span>03</span> The challenge <span className="h-px w-28 bg-lit/60" aria-hidden />
        </p>
        <p className="mt-6 text-sm font-medium text-white/50">Three different stages</p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <h2 className="font-display text-7xl font-bold leading-[0.88] tracking-tight sm:text-9xl">
            Think.
            <br />
            Pitch.
            <br />
            <span className="text-lit">Build.</span>
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-white/60">
            Each stage is designed differently, from an online idea screening to a virtual bootcamp and a final pitch in front of the jury.
          </p>
        </div>

        <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
          {challenges.map((c, i) => (
            <details key={c.title} name="challenge" open={i === 0} className="group">
              <summary className="grid cursor-pointer list-none grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-8 sm:grid-cols-[7rem_1fr_auto] [&::-webkit-details-marker]:hidden">
                <span className="font-display text-5xl font-light text-white/35 transition-colors group-open:text-lit sm:text-7xl">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-sm font-medium text-white/55">{c.tag}</span>
                  <span className="mt-1.5 block font-display text-2xl font-bold tracking-tight sm:text-4xl">{c.title}</span>
                  <span className="mt-1.5 block text-sm text-white/50">{c.when}</span>
                </span>
                <span className="grid size-11 place-items-center rounded-full bg-white/10 text-xl font-bold text-white transition-colors group-open:bg-lit group-open:text-night" aria-hidden>
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>

              <div className="pb-12 sm:pl-[7rem]">
                <div className="grid gap-10 md:grid-cols-2">
                  {c.columns.map((col) => (
                    <div key={col.heading}>
                      <h3 className="font-display text-2xl font-bold tracking-tight">{col.heading}</h3>
                      <dl className="mt-4 space-y-2.5 text-[15px]">
                        {col.lines.map(([k, v]) => (
                          <div key={k} className="text-white/60">
                            <dt className="inline font-semibold text-white/90">{k}: </dt>
                            <dd className="inline">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>

                <h3 className="mt-10 font-display text-2xl font-bold tracking-tight">{c.listTitle}</h3>
                <ul className="mt-4 grid gap-x-10 gap-y-2 text-[15px] text-white/60 sm:grid-cols-2">
                  {c.list.map((l) => (
                    <li key={l} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lit" aria-hidden />
                      {l}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-8">
                  <p className="max-w-2xl text-sm text-white/60">
                    <strong className="text-white">{c.note[0]} · </strong>
                    {c.note[1]}
                  </p>
                  <ButtonLink href={c.cta.href} variant="outline" className="border-lit/60 px-5 py-2.5 text-sm text-white hover:bg-lit/10">
                    {c.cta.label} ↗
                  </ButtonLink>
                </div>
              </div>
            </details>
          ))}
        </div>

        {apply && (
          <div className="mt-24">
            <p className="text-sm font-medium text-lit">How to apply</p>
            <p className="mt-3 max-w-2xl text-white/55">{apply.summary}</p>
            <ol className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {apply.steps.map((s, i) => (
                <li key={s.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <span className="font-display text-4xl font-light text-lit">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{s.title}</h3>
                  <ul className="mt-3 space-y-2.5 text-sm text-white/60">
                    {s.body.map((b) => (
                      <li key={b} className="flex gap-2.5 leading-relaxed">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lit" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Section>
  );
}
