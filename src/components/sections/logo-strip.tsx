import Image from "next/image";
import { partners } from "@/content/partners";

// The top-of-page strip reuses the exact logo files from the Partners section (one source of truth).
// Order matches the original GIC banner: GITAM · Bower · E-Club · G-TEC · VDC
const order = [
  "GITAM",
  "Bower School of Entrepreneurship",
  "E-Club",
  "G-TEC (DST GITAM Technology Enabling Centre)",
  "GITAM Venture Development Centre",
] as const;

const logos = order.map((name) => {
  const p = partners.find((x) => x.name === name);
  if (!p) throw new Error(`LogoStrip: no partner named "${name}"`);
  return p;
});

export function LogoStrip() {
  return (
    <ul
      aria-label="Organised by"
      className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-2xl bg-white px-5 py-3.5 shadow-card"
    >
      {logos.map((l) => (
        <li key={l.name}>
          <Image src={l.src} width={l.width} height={l.height} alt={l.name} sizes="140px" className="h-8 w-auto object-contain" />
        </li>
      ))}
    </ul>
  );
}
