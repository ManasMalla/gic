"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

type Img = { src: string; width: number; height: number };

/** Full-screen photo viewer on a native <dialog>. Arrow keys / buttons navigate, Esc closes. */
export function Lightbox({ images, index, onIndex }: { images: Img[]; index: number | null; onIndex: (i: number | null) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const go = useCallback(
    (d: number) => onIndex(index === null ? null : (index + d + images.length) % images.length),
    [index, images.length, onIndex],
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const img = index === null ? null : images[index];
  const btn = "absolute grid size-11 place-items-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25";
  return (
    <dialog ref={ref} onClose={() => onIndex(null)} aria-label="Photo viewer" className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent backdrop:bg-black/90">
      {img && (
        <div className="grid h-full place-items-center p-4" onClick={(e) => e.target === e.currentTarget && onIndex(null)}>
          <Image {...img} alt="GIC event photo" sizes="100vw" className="max-h-[88dvh] w-auto rounded-lg object-contain" />
          <button onClick={() => onIndex(null)} aria-label="Close" className={`${btn} right-4 top-4`}>×</button>
          <button onClick={() => go(-1)} aria-label="Previous photo" className={`${btn} left-3 top-1/2 -translate-y-1/2`}>‹</button>
          <button onClick={() => go(1)} aria-label="Next photo" className={`${btn} right-3 top-1/2 -translate-y-1/2`}>›</button>
        </div>
      )}
    </dialog>
  );
}
