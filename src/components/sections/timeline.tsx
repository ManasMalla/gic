import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { juniorTimeline, type Milestone, seniorTimeline, timeline } from "@/content/timeline";

export function Timeline() {
  return (
    <Section id="timeline" tone="night2" className="overflow-hidden">
      <SectionHeading
        tone="night"
        eyebrow="GIC 2026 journey"
        title={<>The <Accent>timeline</Accent></>}
        description="Shared dates first, then each track's own path to the final."
      />
      <Rows items={timeline} />
      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="font-sans text-2xl font-extrabold uppercase tracking-tight">Junior <Accent>Track</Accent></h3>
          <Rows items={juniorTimeline} />
        </div>
        <div>
          <h3 className="font-sans text-2xl font-extrabold uppercase tracking-tight">Senior <Accent>Track</Accent></h3>
          <Rows items={seniorTimeline} />
        </div>
      </div>
    </Section>
  );
}

function Rows({ items }: { items: Milestone[] }) {
  return (
    <ol className="relative mt-8 space-y-3 border-l border-lit/25 pl-8 sm:pl-10">
      {items.map((m) => (
        <li key={m.title} className="relative">
          <span className="absolute -left-[2.55rem] top-7 size-3 rounded-full bg-lit shadow-[0_0_0_4px_rgb(8_17_14),0_0_16px_rgb(44_207_144/0.8)] sm:-left-[3.05rem]" aria-hidden />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-lit">{m.stage}</p>
            <h3 className="mt-1.5 font-sans text-xl font-bold tracking-tight">
              {m.title}
              {m.badge && <span className="ml-3 rounded-full bg-lit px-2.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-night">{m.badge}</span>}
            </h3>
            {m.note && <p className="mt-1 text-sm text-white/55">{m.note}</p>}
            <p className="mt-3 font-sans text-lg font-semibold text-white">{m.date}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
