import { Quote } from "lucide-react";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { stories } from "@/content/home";

export function Stories() {
  return (
    <Section id="stories" tone="antique">
      <SectionHeading tone="antique" eyebrow="Straight from participants" title={<>Real <Accent>stories.</Accent></>} />
      <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((s, i) => (
          <li key={i} className="flex flex-col rounded-3xl border border-night/10 bg-white p-7">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-night/15 font-display text-lg font-bold text-night ring-1 ring-night/40" aria-hidden>{s.name.replace("[Placeholder] ", "").charAt(0)}</span>
              <div>
                <p className="font-display font-bold tracking-tight">{s.name}</p>
                <p className="text-sm text-night-2/50">{s.role}</p>
              </div>
              <Quote className="ml-auto size-7 text-night/30" aria-hidden />
            </div>
            <p className="mt-6 leading-relaxed text-night-2/65">{s.quote}</p>
          </li>
        ))}
      </ul>
      <p className="mt-14 text-balance font-display text-2xl font-bold tracking-tight sm:text-4xl">
        They came to compete. <span className="text-night-2/45">They left with more.</span>
      </p>
    </Section>
  );
}
