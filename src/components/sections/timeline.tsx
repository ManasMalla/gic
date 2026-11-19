import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { juniorTimeline, type Milestone, seniorTimeline, timeline } from "@/content/timeline";

export function Timeline() {
  return (
    <Section id="timeline" tone="antique">
      <SectionHeading
        tone="paper"
        eyebrow="GIC 2026 journey"
        title={<>The <Accent>timeline</Accent></>}
        description="Shared dates first, then each track's own path to the final."
      />
      <Rows items={timeline} />
      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight">Junior <Accent>Track</Accent></h3>
          <Rows items={juniorTimeline} />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight">Senior <Accent>Track</Accent></h3>
          <Rows items={seniorTimeline} />
        </div>
      </div>
    </Section>
  );
}

function Rows({ items }: { items: Milestone[] }) {
  return (
    <ol className="relative mt-8 space-y-3 border-l-2 border-night-2/25 pl-8 sm:pl-10">
      {items.map((m) => (
        <li key={m.title} className="relative">
          <span className="absolute -left-[2.7rem] top-7 size-4 rounded-full border-2 border-night-2 bg-accent sm:-left-[3.2rem]" aria-hidden />
          <div className="sticker-sm bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-night">{m.stage}</p>
            <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight">
              {m.title}
              {m.badge && <span className="ml-3 rounded-full border-2 border-night-2 bg-accent px-2.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-night-2">{m.badge}</span>}
            </h3>
            {m.note && <p className="mt-1 text-sm text-night-2/65">{m.note}</p>}
            <p className="mt-3 font-display text-lg font-semibold text-night">{m.date}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
