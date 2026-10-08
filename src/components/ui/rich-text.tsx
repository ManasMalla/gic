import Link from "next/link";

/** Renders plain text with inline [label](href) links. Content stays JSON-friendly. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (!m) return part;
        return (
          <Link key={i} href={m[2]} className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark">
            {m[1]}
          </Link>
        );
      })}
    </>
  );
}
