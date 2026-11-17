"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { Days: Math.floor(s / 86400), Hours: Math.floor((s % 86400) / 3600), Minutes: Math.floor((s % 3600) / 60), Seconds: s % 60 };
}

/** Countdown to the registration deadline, as antique-white chips on green. */
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
    return <p className="text-lg font-semibold text-lit">Registration is now closed</p>;
  }
  const t = left === null ? null : parts(left);

  return (
    <div role="timer" aria-label={t ? `${t.Days} days ${t.Hours} hours ${t.Minutes} minutes ${t.Seconds} seconds left` : "Time left"}>
      <div className="grid max-w-md grid-cols-4 gap-3">
        {(["Days", "Hours", "Minutes", "Seconds"] as const).map((k) => (
          <div key={k} className="rounded-2xl bg-lit px-2 py-3 text-center text-night">
            <p className="font-display text-3xl font-bold tabular-nums leading-none sm:text-4xl">{t ? pad(t[k]) : "--"}</p>
            <p className="mt-1.5 text-[11px] font-medium text-night/70">{k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
