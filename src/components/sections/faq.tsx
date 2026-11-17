"use client";

import { useState } from "react";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { RichText } from "@/components/ui/rich-text";
import { faq, faqIntro } from "@/content/faq";
import { cn } from "@/lib/cn";

export function Faq() {
  const [active, setActive] = useState(faq[0].id);
  const group = faq.find((g) => g.id === active) ?? faq[0];

  return (
    <Section id="faq" tone="antique">
      <SectionHeading tone="antique" eyebrow="Have questions?" title={<>Frequently asked <Accent>questions</Accent></>} description={faqIntro} />

      <div className="mt-12 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <nav aria-label="FAQ categories" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {faq.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-current={g.id === active}
              onClick={() => setActive(g.id)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors",
                g.id === active ? "bg-night text-cream" : "border border-night/10 bg-white text-night-2/80 hover:bg-night/10",
              )}
            >
              {g.title}
              <span className={cn("ml-2 text-xs font-normal", g.id === active ? "text-night/60" : "text-night-2/40")}>{g.items.length}</span>
            </button>
          ))}
        </nav>

        <div key={group.id}>
          <h3 className="font-display text-2xl font-bold tracking-tight">{group.title}</h3>
          <div className="mt-5 space-y-3">
            {group.items.map((item, i) => (
              <details key={item.q} open={i === 0} className="group rounded-2xl border border-night/10 bg-white open:border-night/50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-night/15 text-night transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <div className="space-y-3 px-5 pb-5 leading-relaxed text-night-2/65">
                  {item.a.map((p) => (
                    <p key={p}><RichText text={p} /></p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
