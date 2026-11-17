import { Quote } from "lucide-react";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { stories } from "@/content/home";

export function Stories() {
  return (
    <Section id="stories" tone="night">
      <SectionHeading tone="night" eyebrow="Straight from participants" title={<>Real <Accent>stories.</Accent></>} />
      <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((s, i) => (
          <li key={i} className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-lit/15 font-sans text-lg font-extrabold text-lit ring-1 ring-lit/40" aria-hidden>{s.name.replace("[Placeholder] ", "").charAt(0)}</span>
              <div>
                <p className="font-sans font-bold tracking-tight">{s.name}</p>
                <p className="text-sm text-white/50">{s.role}</p>
              </div>
              <Quote className="ml-auto size-7 text-lit/30" aria-hidden />
            </div>
            <p className="mt-6 leading-relaxed text-white/65">{s.quote}</p>
          </li>
        ))}
      </ul>
      <p className="mt-14 text-balance font-sans text-2xl font-extrabold tracking-tight sm:text-4xl">
        They came to compete. <span className="text-white/45">They left with more.</span>
      </p>
    </Section>
  );
}
