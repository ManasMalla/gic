"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Accent, Section } from "@/components/ui/section";
import { legacyEditions } from "@/content/home";
import { overviewStats } from "@/content/tracks";
import { cn } from "@/lib/cn";

export function Legacy() {
  const [i, setI] = useState(legacyEditions.length - 1);
  const [paused, setPaused] = useState(false); // keyboard focus only; hover must not pause or it never advances while someone is looking at it
  const e = legacyEditions[i];

  // Autoplay: advance every 5s. Restarts after a manual pick and pauses while a chip has keyboard focus.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((n) => (n + 1) % legacyEditions.length), 5000);
    return () => clearInterval(id);
  }, [i, paused]);
  return (
    <Section id="legacy" tone="antique" className="overflow-hidden">
      <div className="contents" onFocus={(ev) => setPaused(ev.target.matches(":focus-visible"))} onBlur={() => setPaused(false)}>
      {/* Concentric arcs behind the heading */}
      <div className="pointer-events-none absolute -left-72 top-1/2 size-[48rem] -translate-y-1/2 rounded-full border border-white/[0.06]" aria-hidden />
      <div className="pointer-events-none absolute -left-52 top-1/2 size-[40rem] -translate-y-1/2 rounded-full border border-white/[0.06]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-1/2 size-[32rem] -translate-y-1/2 rounded-full border border-night/10" aria-hidden />

      <div className="relative grid min-h-[40rem] gap-10 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col justify-center">
          <p className="flex items-center gap-4 text-sm font-medium text-night-2/80">
            <span className="h-px w-8 bg-night" aria-hidden />
            The legacy
          </p>
          <h2 className="mt-10 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl">
            The legacy
            <br />
            <Accent>continues.</Accent>
          </h2>
          <p className="mt-8 text-lg text-night-2/70">Pitch. Build. Lead.</p>
          <div role="tablist" aria-label="Past editions" className="mt-14 flex flex-wrap gap-2">
            {legacyEditions.map((ed, n) => (
              <button
                key={ed.year}
                role="tab"
                aria-selected={n === i}
                onClick={() => setI(n)}
                className={cn(
                  "rounded-full px-6 py-2.5 text-sm font-bold tracking-wider transition-colors",
                  n === i ? "bg-night text-cream" : "border border-night/15 bg-white text-night-2/70 hover:bg-night/10",
                )}
              >
                {ed.year}
              </button>
            ))}
          </div>
        </div>

        <figure className="relative min-h-[32rem]">
          <p
            className="pointer-events-none absolute inset-x-0 bottom-[26%] select-none text-center font-display text-[30vw] font-bold leading-[0.85] text-transparent [-webkit-text-stroke:1.5px_rgb(0_115_103/0.25)] lg:text-[14rem]"
            aria-hidden
          >
            {e.year}
          </p>
          <Image
            {...e.image}
            alt={e.upcoming ? "" : `GIC ${e.year}`}
            sizes="(min-width:1024px) 50vw, 100vw"
            className={cn(
              "absolute inset-x-0 bottom-0 mx-auto h-[86%] w-auto max-w-full object-contain object-bottom",
              // The upcoming edition is a black silhouette with a green rim light.
              e.upcoming && "[filter:brightness(0)_drop-shadow(0_0_1px_rgb(0_115_103))]",
            )}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cream via-cream/70 to-transparent" aria-hidden />
          <figcaption className="absolute inset-x-0 bottom-0 z-10">
            <p className="text-sm font-medium text-night">{e.upcoming ? "The legacy continues" : `GIC ${e.year} · Winner`}</p>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">{e.winner}</p>
            <p className="mt-2 text-sm text-night-2/60">{e.note}</p>
          </figcaption>
        </figure>
      </div>

      <dl className="relative mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-night/15 bg-night/15 md:grid-cols-3 lg:grid-cols-6">
        {overviewStats.map((s) => (
          <div key={s.label} className="bg-cream p-6">
            <dd className="font-display text-4xl font-bold tracking-tight text-night">
              {s.value}
              <span className="text-2xl">{s.suffix}</span>
            </dd>
            <dt className="mt-2 text-sm text-night-2/55">{s.label}</dt>
          </div>
        ))}
      </dl>
      </div>
    </Section>
  );
}
