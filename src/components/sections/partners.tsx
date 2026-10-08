import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { partners, previousPartners } from "@/content/partners";

export function Partners() {
  return (
    <Section id="partners" tone="soft">
      <SectionHeading
        eyebrow="GIC ecosystem"
        title="Our partners"
        description="Collaborating with organisations that support innovation, entrepreneurship and student growth."
      />
      <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {partners.map((p) => (
          <li key={p.name} className="grid aspect-[3/2] place-items-center rounded-2xl bg-white p-5 shadow-card">
            <Image src={p.src} width={p.width} height={p.height} alt={p.name} sizes="(min-width:1024px) 15vw, 40vw" className="max-h-full w-auto object-contain" />
          </li>
        ))}
      </ul>

      <div className="mt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Our network</p>
        <h3 className="mt-2 font-display text-3xl font-bold">Previous partners &amp; sponsors</h3>
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ul className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
            {[...previousPartners, ...previousPartners].map((p, i) => (
              <li key={`${p.name}-${i}`} aria-hidden={i >= previousPartners.length} className="grid h-24 w-40 shrink-0 place-items-center rounded-xl bg-white p-4">
                <Image src={p.src} width={p.width} height={p.height} alt={i >= previousPartners.length ? "" : p.name} sizes="160px" className="max-h-full w-auto object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
