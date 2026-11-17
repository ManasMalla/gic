"use client";

import Image from "next/image";
import { useRef } from "react";
import { guests } from "@/content/people";

/** Horizontal snap-scroll row of guest cards with previous/next buttons. */
export function SpeakersCarousel() {
  const row = useRef<HTMLUListElement>(null);
  const by = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <div>
      <ul ref={row} className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
        {guests.map((g) => (
          <li key={g.name} className="group w-64 shrink-0 snap-start sm:w-72">
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <Image {...g.photo} alt={g.name} sizes="288px" className="aspect-[3/4] w-full object-cover object-top grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent" aria-hidden />
            </div>
            <p className="mt-4 font-display text-lg font-bold leading-tight tracking-tight">{g.name}</p>
            {g.role && <p className="mt-1 text-sm leading-snug text-white/55">{g.role}</p>}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="font-display text-xl font-bold tracking-tight">Different voices. <span className="text-lit">Equal impact.</span></p>
        <div className="flex gap-2">
          <button type="button" onClick={() => by(-1)} aria-label="Previous speakers" className="grid size-11 place-items-center rounded-full border border-white/20 hover:bg-white/10">←</button>
          <button type="button" onClick={() => by(1)} aria-label="Next speakers" className="grid size-11 place-items-center rounded-full bg-lit text-night hover:bg-lit-soft">→</button>
        </div>
      </div>
    </div>
  );
}
