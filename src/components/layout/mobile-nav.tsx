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
        className="sticker-sm grid size-11 place-items-center bg-white text-night-2"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 7h14M3 13h14" />}
        </svg>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="fixed inset-x-0 top-[4.5rem] z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t-2 border-beige/60 bg-white px-5 pb-8 pt-2 shadow-xl"
        >
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-beige/50 py-4 font-display text-2xl font-bold text-night-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-[14px] bg-brand px-6 py-3.5 text-center text-base font-bold text-cream"
          >
            Register your team
          </Link>
        </nav>
      )}
    </div>
  );
}
