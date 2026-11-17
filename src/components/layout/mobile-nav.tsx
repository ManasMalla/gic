"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { label: string; href: string };

export function MobileNav({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/5"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 7h14M3 13h14" />}
        </svg>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="fixed inset-x-3 top-[5.25rem] z-40 max-h-[calc(100dvh-6.5rem)] overflow-y-auto rounded-3xl border border-white/10 bg-night/95 px-6 pb-7 pt-3 text-white shadow-2xl backdrop-blur-xl"
        >
          <ul className="flex flex-col">
            {items.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 border-b border-white/10 py-4 text-2xl font-extrabold uppercase tracking-tight"
                >
                  <span className="text-xs font-semibold tracking-widest text-lit">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-full bg-lit px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wider text-night"
          >
            Register ↗
          </Link>
        </nav>
      )}
    </div>
  );
}
