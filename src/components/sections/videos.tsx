"use client";

import Image from "next/image";
import { useState } from "react";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { editionVideos, videos } from "@/content/experience";

export function Videos() {
  return (
    <Section id="videos" tone="antique">
      <SectionHeading
        tone="paper"
        eyebrow="Watch"
        title={<>What will you <Accent>miss?</Accent></>}
        description="Keynotes, founder stories, testimonials and a concert night. This is what the room feels like — don't be the one who watches it later."
      />
      <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => <VideoCard key={v.id} {...v} />)}
      </ul>

      <h3 className="mt-20 font-display text-night-2 text-2xl font-bold tracking-tight">Previous editions</h3>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {editionVideos.map((e) => (
          <li key={e.href}>
            <a href={e.href} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden sticker">
              <Image src={e.thumb} width={1280} height={720} alt="" sizes="(min-width:640px) 45vw, 100vw" className="aspect-video w-full object-cover transition-transform group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-ink/30">
                <span className="grid size-16 place-items-center rounded-full border-2 border-night-2 bg-accent text-2xl text-night-2">▶</span>
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 p-5 font-display text-xl font-bold text-white">{e.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function VideoCard({ title, src, poster }: { title: string; src: string; poster: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <li className="sticker overflow-hidden bg-white text-night-2">
      <div className="relative aspect-video bg-ink">
        {playing ? (
          <video src={src} poster={poster} controls autoPlay playsInline preload="metadata" className="size-full" />
        ) : (
          <button onClick={() => setPlaying(true)} className="group relative size-full" aria-label={`Play: ${title}`}>
            {/* Self-hosted poster; plain <img> because it is a tiny pre-optimised WebP. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" loading="lazy" className="size-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-ink/25 transition-colors group-hover:bg-ink/10">
              <span className="grid size-14 place-items-center rounded-full border-2 border-night-2 bg-accent text-xl text-night-2">▶</span>
            </span>
          </button>
        )}
      </div>
      <p className="border-t-2 border-night-2 p-4 font-medium leading-snug">{title}</p>
    </li>
  );
}
