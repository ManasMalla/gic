"use client";

import { useId, useState } from "react";
import { Section, SectionHeading } from "@/components/ui/section";
import { process, processIntro } from "@/content/process";
import { cn } from "@/lib/cn";

export function Process() {
  const [tab, setTab] = useState(0);
  const base = useId();
  const group = process[tab];

  return (
    <Section id="process">
      <SectionHeading eyebrow="GIC 2026 journey" title="The process" description={processIntro} />

      <div role="tablist" aria-label="Process stages" className="mt-12 flex flex-wrap gap-2">
        {process.map((g, i) => (
          <button
            key={g.id}
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={tab === i}
            aria-controls={`${base}-panel`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setTab((tab + 1) % process.length);
              if (e.key === "ArrowLeft") setTab((tab - 1 + process.length) % process.length);
            }}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
              tab === i ? "bg-forest text-white" : "bg-mint-soft text-ink hover:bg-mint/40",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${tab}`} className="mt-8">
        <p className="mb-6 text-lg text-muted">{group.summary}</p>
        <ol className="grid gap-5 md:grid-cols-3">
          {group.steps.map((s, i) => (
            <li key={s.title} className={cn("rounded-card border border-line bg-white p-7 shadow-card", group.steps.length === 1 && "md:col-span-3")}>
              <span className="grid size-9 place-items-center rounded-full bg-gold font-display font-bold">{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
              <ul className="mt-3 space-y-2.5 text-muted">
                {s.body.map((b) => (
                  <li key={b} className="flex gap-2.5 leading-relaxed">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
