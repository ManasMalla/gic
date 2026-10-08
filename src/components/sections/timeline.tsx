import { Section, SectionHeading } from "@/components/ui/section";
import { timeline } from "@/content/timeline";
import { cn } from "@/lib/cn";

const dot = { "Main Track": "bg-sky", "Junior Track": "bg-coral" } as const;

export function Timeline() {
  return (
    <Section id="timeline" tone="dark" className="overflow-hidden">
      <div className="bg-dots absolute right-0 top-0 h-64 w-64 opacity-30" aria-hidden />
      <SectionHeading
        tone="dark"
        eyebrow="GIC 2026 journey"
        title="Timeline"
        description="Important dates from registration to the Grand Finale."
      />
      <ol className="relative mt-14 space-y-3 border-l border-white/20 pl-8 sm:pl-10">
        {timeline.map((m, i) => {
          const last = i === timeline.length - 1;
          return (
            <li key={m.title} className="relative">
              <span
                className={cn(
                  "absolute -left-[2.55rem] top-6 size-4 rounded-full ring-4 ring-forest sm:-left-[3.05rem]",
                  m.track ? dot[m.track] : last ? "bg-gold" : "bg-mint",
                )}
                aria-hidden
              />
              <div className={cn("grid gap-1 rounded-2xl p-5 sm:grid-cols-[11rem_1fr_auto] sm:items-center sm:gap-6", last ? "bg-gold text-ink" : "bg-white/[0.06]")}>
                <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", last ? "text-ink/70" : "text-mint")}>{m.stage}</p>
                <div>
                  <h3 className="font-display text-xl font-bold">
                    {m.title}
                    {m.badge && <span className="ml-3 rounded-full bg-gold px-2.5 py-0.5 align-middle text-[11px] font-bold uppercase text-ink">{m.badge}</span>}
                  </h3>
                  {m.note && <p className={cn("text-sm", last ? "text-ink/70" : "text-white/60")}>{m.note}</p>}
                </div>
                <p className="font-display text-lg font-medium sm:text-right">{m.date}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
