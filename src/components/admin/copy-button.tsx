"use client";

import { useState } from "react";

/** Copies text to the clipboard (falls back to showing it selected if the browser refuses). */
export function CopyButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/10"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          window.prompt("Copy this link:", text);
        }
      }}
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}
