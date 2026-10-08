"use client";

import Image from "next/image";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Lightbox } from "@/components/ui/lightbox";
import { gallery } from "@/content/experience";
import { cn } from "@/lib/cn";

const all = gallery.flatMap((a) => a.images);

// Three rows, interleaved so each row mixes every album. Alternate direction + slightly different speeds.
const rows = [
  { dir: "normal", seconds: 240 },
  { dir: "reverse", seconds: 300 },
  { dir: "normal", seconds: 270 },
].map((r, row) => ({ ...r, items: all.map((img, idx) => ({ img, idx })).filter((_, i) => i % 3 === row) }));

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section id="gallery" tone="soft" className="overflow-hidden">
      <SectionHeading
        eyebrow="Gallery"
        title="Moments from the GIC journey"
        description="Stages, speakers, students and a lot of ideas. Tap any photo to see it full size."
      />
      <div className="-mx-5 mt-12 space-y-4 sm:-mx-8" aria-label="Photo gallery">
        {rows.map((row, r) => (
          <div key={r} className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto">
            <ul
              className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
              style={{ animationDuration: `${row.seconds}s`, animationDirection: row.dir }}
            >
              {/* The list is rendered twice for a seamless loop; the copy is hidden from assistive tech. */}
              {[0, 1].map((copy) =>
                row.items.map(({ img, idx }) => (
                  <li key={`${copy}-${idx}`} aria-hidden={copy === 1} className="shrink-0">
                    <button
                      type="button"
                      tabIndex={copy === 1 ? -1 : 0}
                      onClick={() => setOpen(idx)}
                      aria-label={`Open photo ${idx + 1} of ${all.length}`}
                      className={cn("block overflow-hidden rounded-2xl shadow-card")}
                    >
                      <Image {...img} alt="" sizes="(max-width:640px) 70vw, 340px" className="h-48 w-auto transition-transform duration-300 hover:scale-105 sm:h-56" />
                    </button>
                  </li>
                )),
              )}
            </ul>
          </div>
        ))}
      </div>
      <Lightbox images={all} index={open} onIndex={setOpen} />
    </Section>
  );
}
