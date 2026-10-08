import Image from "next/image";
import { media } from "@/lib/media";

// Order matches the original GIC banner: GITAM · Bower · E-Club · G-TEC · VDC
const logos = [
  { name: "GITAM", ...media("/media/logos/gitam-logos-header.webp"), h: "h-8" },
  { name: "Bower School of Entrepreneurship", ...media("/media/logos/bower.webp"), h: "h-8" },
  { name: "E-Club", ...media("/media/logos/e-club.webp"), h: "h-8" },
  { name: "G-TEC — DST GITAM Technology Enabling Centre", ...media("/media/logos/gtec.webp"), h: "h-8" },
  { name: "Venture Development Centre", ...media("/media/logos/vdc-wordmark.webp"), h: "h-8" },
] as const;

export function LogoStrip() {
  return (
    <ul
      aria-label="Organised by"
      className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-2xl bg-white px-5 py-3.5 shadow-card"
    >
      {logos.map((l) => (
        <li key={l.name}>
          <Image src={l.src} width={l.width} height={l.height} alt={l.name} sizes="140px" className={`${l.h} w-auto object-contain`} />
        </li>
      ))}
    </ul>
  );
}
