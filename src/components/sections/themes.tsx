"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { themes } from "@/content/themes";

export function Themes() {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const theme = active === null ? null : themes[active];

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (theme && !d.open) d.showModal();
    if (!theme && d.open) d.close();
  }, [theme]);

  return (
    <Section id="themes" tone="night2">
      <SectionHeading
        tone="night"
        eyebrow="GIC 2026"
        title={<>Innovation <Accent>themes</Accent></>}
        description="Explore the key areas of innovation shaping the GIC 2026 challenge. Select a theme to learn more."
      />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t, i) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group flex h-full w-full items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:-translate-y-1 hover:border-lit/40 hover:bg-white/[0.07]"
            >
              <Image {...t.image} alt="" sizes="96px" className="size-24 shrink-0 rounded-2xl ring-1 ring-white/10" />
              <div>
                <p className="text-sm font-medium text-lit">Theme 0{i + 1}</p>
                <h3 className="mt-1 font-display text-lg font-bold leading-tight tracking-tight">{t.name}</h3>
                <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-lit group-hover:underline">Learn more →</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === dialog.current && setActive(null)}
        aria-labelledby="theme-title"
        className="m-auto w-[min(92vw,56rem)] overflow-hidden on-dark rounded-[1.75rem] border border-white/10 bg-night-2 p-0 text-white backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        {theme && (
          <div className="grid md:grid-cols-[16rem_1fr]">
            <div className="grid place-items-center bg-lit/10 p-8">
              <Image {...theme.image} alt="" sizes="176px" className="size-44 rounded-2xl" />
            </div>
            <div className="p-8 sm:p-10">
              <p className="text-sm font-medium text-lit">Innovation theme</p>
              <h3 id="theme-title" className="mt-2 font-display text-3xl font-bold tracking-tight">{theme.name}</h3>
              <p className="mt-1 font-medium text-white/55">{theme.subtitle}</p>
              <p className="mt-5 leading-relaxed text-white/75">{theme.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/register">Register now</ButtonLink>
                <button type="button" onClick={() => setActive(null)} className="rounded-full px-6 py-3 text-sm font-semibold text-white/60 hover:bg-white/10">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </Section>
  );
}
