import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { guests } from "@/content/people";

export function Experience() {
  return (
    <Section id="experience">
      <SectionHeading
        eyebrow="GIC experience"
        title="Meet the guests & speakers"
        description="Discover the people who have shaped the GITAM Innovation Challenge."
      />
      <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {guests.map((g) => (
          <li key={g.name} className="overflow-hidden rounded-card bg-white shadow-card">
            <Image {...g.photo} alt={g.name} sizes="(min-width:1024px) 22vw, 45vw" className="aspect-square w-full object-cover object-top" />
            <div className="p-4">
              <p className="font-display text-lg font-bold leading-tight">{g.name}</p>
              {g.role && <p className="mt-1 text-sm leading-snug text-muted">{g.role}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
