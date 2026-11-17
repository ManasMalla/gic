import { Accent, Section, SectionHeading } from "@/components/ui/section";
import { contactPeople } from "@/content/home";

export function Contact() {
  return (
    <Section id="contact" tone="night2">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <SectionHeading tone="night" eyebrow="Get in touch" title={<>Let&apos;s <Accent>talk.</Accent></>} />
        <p className="text-lg text-white/60">For registrations, payments, partnerships or anything else about GIC 2026, reach the team directly.</p>
      </div>
      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactPeople.map((c, i) => (
          <li key={i} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-medium text-lit">{c.role}</p>
            <p className="mt-4 font-display text-xl font-bold tracking-tight">{c.name}</p>
            <p className="mt-4 text-sm"><a className="text-white/70 hover:text-white" href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}>{c.phone}</a></p>
            <p className="mt-1 text-sm"><a className="text-white/70 hover:text-white" href={`mailto:${c.email}`}>{c.email}</a></p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
