"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Yellow strip that sits under the navbar (inside the sticky header) and counts down to the deadline. */
export function CountdownBar({ closesAt, closesLabel }: { closesAt: string; closesLabel: string }) {
  const target = new Date(closesAt).getTime();
  // null until mounted so server HTML and first client render match (no hydration mismatch)
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const left = now === null ? null : target - now;
  const closed = left !== null && left <= 0;
  const t = left === null ? null : parts(left);

  return (
    <div className="bg-gold text-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-2 text-sm sm:px-8">
        {closed ? (
          <p className="font-semibold">Registration is now closed.</p>
        ) : (
          <>
            <p className="font-semibold">
              <span className="hidden sm:inline">Applications close {closesLabel} · </span>Time left
            </p>
            <p
              role="timer"
              aria-label={t ? `${t.d} days ${t.h} hours ${t.m} minutes ${t.s} seconds left` : "Time left"}
              className="flex items-center gap-1.5 font-display text-base font-bold tabular-nums"
            >
              {t ? (
                <>
                  <Unit v={t.d} l="d" />
                  <Unit v={t.h} l="h" />
                  <Unit v={t.m} l="m" />
                  <Unit v={t.s} l="s" />
                </>
              ) : (
                <span className="opacity-60">-- : -- : -- : --</span>
              )}
            </p>
            <Link href="/register" className="rounded-full bg-ink px-3.5 py-1 text-xs font-bold text-white hover:bg-ink/85">
              Apply now →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function Unit({ v, l }: { v: number; l: string }) {
  return (
    <span className="rounded-md bg-ink/10 px-1.5 py-0.5">
      {pad(v)}
      <span className="ml-0.5 text-xs font-semibold opacity-70">{l}</span>
    </span>
  );
}
