"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { Days: Math.floor(s / 86400), Hours: Math.floor((s % 86400) / 3600), Minutes: Math.floor((s % 3600) / 60), Seconds: s % 60 };
}

/** Big countdown to the registration deadline. */
export function HeroCountdown({ closesAt }: { closesAt: string }) {
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
  if (left !== null && left <= 0) {
    return <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Registration is now closed</p>;
  }
  const t = left === null ? null : parts(left);

  return (
    <div role="timer" aria-label={t ? `${t.Days} days ${t.Hours} hours ${t.Minutes} minutes ${t.Seconds} seconds left` : "Time left"}>
      <div className="grid grid-cols-4 gap-3 sm:gap-8">
        {(["Days", "Hours", "Minutes", "Seconds"] as const).map((k) => (
          <div key={k} className="text-center">
            <p className="font-sans text-4xl font-extrabold tabular-nums leading-none sm:text-7xl">{t ? pad(t[k]) : "--"}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">{k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
