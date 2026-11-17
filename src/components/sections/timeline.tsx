import { Section, SectionHeading } from "@/components/ui/section";
import { juniorTimeline, type Milestone, seniorTimeline, timeline } from "@/content/timeline";
import { cn } from "@/lib/cn";

export function Timeline() {
  return (
    <Section id="timeline" tone="dark" className="overflow-hidden">
      <div className="bg-dots absolute right-0 top-0 h-64 w-64 opacity-30" aria-hidden />
      <SectionHeading
        tone="dark"
        eyebrow="GIC 2026 journey"
        title="Timeline"
        description="Shared dates first, then each track's own path to the final."
      />
      <Rows items={timeline} />
      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="font-display text-2xl font-bold text-coral">Junior Track</h3>
          <Rows items={juniorTimeline} dot="bg-coral" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold text-sky">Senior Track</h3>
          <Rows items={seniorTimeline} dot="bg-sky" />
        </div>
      </div>
    </Section>
  );
}

function Rows({ items, dot }: { items: Milestone[]; dot?: string }) {
  return (
    <ol className="relative mt-6 space-y-3 border-l border-white/20 pl-8 sm:pl-10">
      {items.map((m) => (
        <li key={m.title} className="relative">
          <span className={cn("absolute -left-[2.55rem] top-6 size-4 rounded-full ring-4 ring-forest sm:-left-[3.05rem]", dot ?? "bg-mint")} aria-hidden />
          <div className="grid gap-1 rounded-2xl bg-white/[0.06] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">{m.stage}</p>
            <h3 className="font-display text-xl font-bold">
              {m.title}
              {m.badge && <span className="ml-3 rounded-full bg-gold px-2.5 py-0.5 align-middle text-[11px] font-bold uppercase text-ink">{m.badge}</span>}
            </h3>
            {m.note && <p className="text-sm text-white/60">{m.note}</p>}
            <p className="mt-1 font-display text-lg font-medium">{m.date}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
