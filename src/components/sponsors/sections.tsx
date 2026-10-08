import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { media } from "@/lib/media";
import { cn } from "@/lib/cn";
import {
  benefitColumns, benefits, finaleFlow, gains, impactReport, journeyTouchpoints, legacyStats, objectives,
  partnerPresence, projectedReach, sponsorContacts, sponsorDisclaimer, sponsorHero, sponsorTracks,
  tierAvailability, tiers, whyPartner, type Cell,
} from "@/content/sponsorship";
import { themes } from "@/content/themes";
import { partners } from "@/content/partners";

const accent = { mint: "bg-mint", gold: "bg-gold", coral: "bg-coral", blue: "bg-sky", teal: "bg-brand" } as const;
const accentText = { mint: "text-forest", gold: "text-ink", coral: "text-white", blue: "text-white", teal: "text-white" } as const;

export function SponsorHero() {
  const h = sponsorHero;
  const photo = media("/media/gallery/day1/SmartIDEAthon-day1-4.webp");
  return (
    <section className="relative overflow-hidden bg-forest text-white">
      <div className="bg-triangles absolute inset-0 opacity-60" aria-hidden />
      <Container className="relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-block rounded-xl bg-brand px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">{h.eyebrow}</p>
          <h1 className="mt-6 text-balance font-display text-5xl font-bold leading-[1.02] sm:text-6xl">{h.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">{h.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#tiers">View partnership tiers</ButtonLink>
            <ButtonLink href="/documents/GIC-2026-Sponsorship-Brochure.pdf" variant="outline" download>Download brochure (PDF)</ButtonLink>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-[1.75rem] ring-1 ring-white/20">
            <Image {...photo} alt="" sizes="(min-width:1024px) 40vw, 100vw" className="aspect-[4/3] w-full object-cover opacity-90" priority />
          </div>
          <div className="absolute -bottom-5 left-4 right-4 flex items-center gap-4 rounded-2xl bg-cream p-4 text-ink shadow-card">
            <div className="grid size-14 place-items-center rounded-xl border-2 border-brand bg-white font-display text-2xl font-bold text-brand">{h.finale.day}</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand">Grand Finale</p>
              <p className="font-display text-lg font-bold leading-tight">{h.finale.month} {h.finale.year} · {h.finale.venue}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function WhyPartner() {
  return (
    <Section tone="cream">
      <SectionHeading eyebrow="Why partner with GITAM Innovation Challenge" title="India's next founders start their pitch here." description="GITAM's flagship national student innovation and pitching competition — connecting partners with emerging talent, sector-specific ideas and young founders." />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {whyPartner.map((w) => (
          <li key={w.title} className="relative overflow-hidden rounded-card bg-white p-7 pl-9 shadow-card">
            <span className={cn("absolute inset-y-0 left-0 w-3", accent[w.accent])} aria-hidden />
            <h3 className="font-display text-2xl font-bold uppercase">{w.title}</h3>
            <p className="mt-2 text-muted">{w.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 rounded-card bg-forest p-6 font-display text-xl text-white">
        <strong>Partners do more than fund the stage.</strong> <span className="text-white/75">They help move young founders from raw idea to a sharper pitch.</span>
      </p>
    </Section>
  );
}

export function Numbers() {
  const l = legacyStats;
  const p = projectedReach;
  return (
    <Section>
      <SectionHeading eyebrow="Through the years" title="A national innovation platform built over multiple editions" description="Cumulative programme performance across previous editions." />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="font-display text-7xl font-bold text-brand">{l.headline.value}</p>
          <p className="mt-1 text-sm font-bold uppercase tracking-widest text-muted">{l.headline.label}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {l.grid.map((g) => (
              <div key={g.label} className="rounded-2xl bg-mint-soft p-5">
                <dt className="sr-only">{g.label}</dt>
                <dd className="font-display text-3xl font-bold text-brand">{g.value}</dd>
                <p className="text-sm font-semibold text-muted">{g.label}</p>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center gap-5 rounded-2xl bg-forest p-6 text-white">
            <span className="font-display text-5xl font-bold">{l.states.value}</span>
            <span className="font-display text-2xl text-cream">{l.states.label}</span>
          </div>
          <div className="mt-4 rounded-2xl bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-brand">Backed by the scale of GITAM</p>
            <dl className="mt-3 grid grid-cols-3 gap-4">
              {l.gitamScale.map((g) => (
                <div key={g.label}><dd className="font-display text-2xl font-bold">{g.value}</dd><dt className="text-sm text-muted">{g.label}</dt></div>
              ))}
            </dl>
          </div>
          <p className="mt-3 text-xs italic text-muted">{l.note}</p>
        </div>

        <div className="rounded-[1.75rem] bg-cream-soft p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">2026 projected programme reach</p>
          <p className="mt-3 font-display text-7xl font-bold text-brand">{p.headline.value}</p>
          <p className="font-semibold text-muted">{p.headline.label}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {p.grid.map((g) => (
              <div key={g.label} className="rounded-2xl bg-white p-5 shadow-card">
                <dd className="font-display text-3xl font-bold text-brand">{g.value}</dd>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted">{g.label}</dt>
              </div>
            ))}
          </dl>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {sponsorTracks.map((t, i) => (
              <li key={t.name} className={cn("rounded-2xl p-5", i === 0 ? "bg-forest text-white" : "bg-white shadow-card")}>
                <span className={cn("inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", i === 0 ? "bg-mint text-forest" : "bg-brand text-white")}>{t.badge}</span>
                <p className="mt-3 font-display text-xl font-bold">{t.name}</p>
                <p className={cn("mt-2 text-sm", i === 0 ? "text-white/70" : "text-muted")}>{t.focus}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-70">Partner relevance</p>
                <p className="text-sm font-semibold">{t.relevance}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs italic text-muted">{p.note}</p>
        </div>
      </div>
    </Section>
  );
}

export function ThemesForPartners() {
  const colors = ["bg-brand text-white", "bg-mint text-forest", "bg-sky text-white", "bg-gold text-ink", "bg-coral text-white"];
  return (
    <Section tone="cream">
      <SectionHeading eyebrow="2026 innovation themes" title="Five innovation spaces your organisation can help shape" description="Partners can own a theme through naming, challenges, mentors, jury roles and awards." />
      <ol className="mt-12 space-y-4">
        {themes.map((t, i) => (
          <li key={t.id} className="grid overflow-hidden rounded-card bg-white shadow-card sm:grid-cols-[8rem_1fr_16rem]">
            <div className={cn("flex items-center justify-between p-5 sm:flex-col sm:items-start", colors[i])}>
              <span className="font-display text-lg font-bold">0{i + 1}</span>
              <Image {...t.image} alt="" className="size-14 rounded-lg object-cover" />
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold uppercase">{t.name}</h3>
              <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
            </div>
            <div className="border-t border-line p-6 sm:border-l sm:border-t-0">
              <p className="text-xs font-bold uppercase tracking-widest text-brand">Partner fit</p>
              <p className="mt-1 font-semibold">{t.partnerFit}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-xl bg-forest p-4 text-center text-sm font-bold uppercase tracking-wider text-white">Theme partner: own a sector conversation all season</p>
    </Section>
  );
}

export function SelectionJourney() {
  const colors = ["bg-brand text-white", "bg-mint text-forest", "bg-gold text-ink", "bg-sky text-white", "bg-coral text-white"];
  return (
    <Section>
      <SectionHeading eyebrow="The selection journey" title="From national applications to the Grand Finale" description="A five-stage founder journey — with meaningful partner touchpoints throughout." />
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {journeyTouchpoints.map((j, i) => (
          <li key={j.code} className="text-center">
            <div className={cn("mx-auto grid size-28 place-items-center rounded-full", colors[i])}>
              <div>
                <p className="text-xs font-bold opacity-80">{j.code}</p>
                <p className="font-display text-xl font-bold uppercase">{j.stage}</p>
              </div>
            </div>
            <p className="mt-4 font-semibold">{j.what}</p>
            <p className="mx-auto mt-3 max-w-[12rem] rounded-lg bg-mint-soft px-3 py-2 text-sm font-semibold text-brand">{j.touchpoint}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function FinaleDay() {
  const dots = ["bg-brand", "bg-mint", "bg-gold", "bg-sky", "bg-coral"];
  return (
    <Section tone="dark">
      <SectionHeading tone="dark" eyebrow="Grand Finale · 11 December 2026" title={<>One stage. <span className="text-gold">16 finalists.</span></>} description="A full day of live pitches, industry conversations, awards and networking at GITAM Hyderabad." />
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-mint">Partner presence on the day</p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {partnerPresence.map((p, i) => (
              <li key={p} className={cn("rounded-xl px-4 py-3 text-center text-sm font-bold uppercase tracking-wider", i % 2 === 0 ? "bg-white text-brand" : "bg-brand text-white")}>{p}</li>
            ))}
          </ul>
          <p className="mt-8 rounded-2xl bg-brand p-5 font-semibold">A sponsor experience designed around founder access, thought leadership and visible participation.</p>
        </div>
        <div className="rounded-card bg-cream p-7 text-ink sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Event-day flow</p>
          <ol className="mt-5 space-y-3.5">
            {finaleFlow.map((f, i) => (
              <li key={f.time + f.label} className="flex items-center gap-4">
                <span className={cn("size-3 shrink-0 rounded-full", dots[i % dots.length])} aria-hidden />
                <span className="w-14 font-display font-bold text-brand">{f.time}</span>
                <span className={cn("flex-1", "bold" in f && f.bold && "font-bold")}>{f.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

export function Gains() {
  const colors = ["bg-brand", "bg-mint", "bg-gold", "bg-coral"];
  return (
    <Section>
      <SectionHeading eyebrow="What your organisation gains" title="A partnership built around access, engagement and measurable value" />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {gains.map((g, i) => (
          <li key={g.title} className="flex gap-5 rounded-card bg-cream p-7">
            <span className={cn("size-14 shrink-0 rounded-full", colors[i])} aria-hidden />
            <div>
              <h3 className="font-display text-xl font-bold uppercase">{g.title}</h3>
              <p className="mt-1 text-muted">{g.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-card bg-forest p-8 text-white">
        <p className="font-display text-xl font-bold uppercase">Every major partner receives an impact report</p>
        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {impactReport.map((r, i) => (
            <li key={r} className="flex items-center gap-2.5 font-semibold">
              <span className={cn("size-3 rounded-full", ["bg-mint", "bg-gold", "bg-sky", "bg-coral"][i % 4])} aria-hidden />{r}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm italic text-white/60">Measurement scope varies by tier and available programme data.</p>
      </div>
    </Section>
  );
}

export function Tiers() {
  return (
    <Section id="tiers" tone="dark">
      <SectionHeading tone="dark" eyebrow="Partnership opportunities" title="Choose the level of ownership that fits your ambition" description="Custom partnership structures are available for strategic requirements." />
      <ol className="mt-12 grid gap-4 md:grid-cols-5">
        {tiers.map((t) => (
          <li key={t.id} className={cn("flex flex-col justify-between rounded-card p-6", accent[t.accent], accentText[t.accent])}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">{t.name}</p>
              <p className="mt-2 font-display text-5xl font-bold">{t.price}</p>
            </div>
            <div className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">{t.level}</p>
              <p className="mt-1 text-sm font-semibold leading-snug">{t.headline}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-xl bg-cream p-4 text-center font-semibold text-forest">{tierAvailability}</p>
    </Section>
  );
}

function CellView({ v }: { v: Cell }) {
  if (v === true) return <span className="mx-auto block size-3.5 rounded-full bg-brand" role="img" aria-label="Included" />;
  if (v === false) return <span className="mx-auto block size-3.5 rounded-full border-2 border-muted/50" role="img" aria-label="Not included" />;
  if (v === "half") return <span className="mx-auto block size-3.5 rounded-full border-2 border-brand bg-[linear-gradient(90deg,var(--color-brand)_50%,transparent_50%)]" role="img" aria-label="Partial" />;
  return <span className="text-sm text-muted">{v}</span>;
}

export function BenefitsMatrix() {
  return (
    <Section tone="cream">
      <SectionHeading eyebrow="Benefits at a glance" title="Clear deliverables at every partnership level" />
      <div className="mt-10 overflow-x-auto rounded-card bg-white shadow-card">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="bg-brand text-white">
              <th scope="col" className="bg-forest p-4 text-sm font-bold uppercase tracking-wider">Benefit</th>
              {benefitColumns.map((c) => <th key={c} scope="col" className="p-4 text-center text-sm font-bold uppercase tracking-wider">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {benefits.map((b, i) => (
              <tr key={b.name} className={i % 2 ? "bg-mint-soft" : "bg-white"}>
                <th scope="row" className="p-4 font-bold">{b.name}</th>
                {b.values.map((v, j) => <td key={j} className="p-4 text-center"><CellView v={v} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-14 font-display text-2xl font-bold uppercase text-brand">Build a partnership around your objective</h3>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {objectives.map((o, i) => (
          <li key={o.title} className="flex items-start gap-4 rounded-2xl bg-white p-5">
            <span className={cn("mt-1 size-4 shrink-0 rounded-full", ["bg-brand", "bg-sky", "bg-gold", "bg-coral", "bg-brand", "bg-sky"][i])} aria-hidden />
            <div>
              <p className="font-display font-bold uppercase text-brand">{o.title}</p>
              <p className="text-sm font-semibold">{o.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm italic text-muted">{sponsorDisclaimer}</p>
    </Section>
  );
}

export function SponsorContact() {
  const c = sponsorContacts;
  const assoc = partners.filter((p) => ["DPIIT Startup India", "Bower School of Entrepreneurship", "E-Club", "Balavikas", "GITAM"].includes(p.name));
  return (
    <section className="bg-forest py-20 text-white sm:py-28">
      <Container>
        <p className="inline-block rounded-xl bg-brand px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">Partnership conversations are open</p>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-5xl font-bold leading-[1.05] sm:text-6xl">Let&apos;s shape the next generation of founders together.</h2>
        <p className="mt-5 text-white/70">Theme ownership, category exclusivity and premium stage rights are limited.</p>

        <div className="mt-12 rounded-card bg-cream p-8 text-ink sm:p-10">
          <p className="font-bold uppercase tracking-wider text-brand">Reserve your partnership category</p>
          <p className="mt-5 font-display text-2xl font-bold">{c.office.name}</p>
          <p className="font-display text-xl">{c.office.org}</p>
          <p className="mt-2 font-semibold text-brand">
            <a href={`mailto:${c.office.email}`} className="underline underline-offset-4">{c.office.email}</a> ·{" "}
            <a href={c.office.href} className="underline underline-offset-4">{c.office.site}</a>
          </p>
        </div>

        <h3 className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-mint">Outreach contacts</h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {c.outreach.map((o) => (
            <li key={o.name} className="rounded-card bg-brand p-6">
              <p className="font-display text-2xl font-bold">{o.name}</p>
              <p className="mt-2 text-white/75">{o.role}</p>
              <p className="text-white/75"><a href={`tel:${o.phone.replace(/\s/g, "")}`}>{o.phone}</a></p>
              <p className="text-white/75"><a href={`mailto:${o.email}`}>{o.email}</a></p>
            </li>
          ))}
        </ul>

        <h3 className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-mint">Past ecosystem associations</h3>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-card bg-white p-6">
          {assoc.map((p) => (
            <li key={p.name}><Image src={p.src} width={p.width} height={p.height} alt={p.name} className="h-12 w-auto object-contain" /></li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
