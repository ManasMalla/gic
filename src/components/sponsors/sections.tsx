import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Accent, Section, SectionHeading } from "@/components/ui/section";
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

// Brand palette only: GITAM green, light green, mellow yellow, beige and antique white.
const tile = { mint: "bg-mint text-night-2", gold: "bg-accent text-night-2", coral: "bg-beige text-night-2", blue: "bg-cream text-night-2", teal: "bg-night text-white" } as const;
const dot = ["bg-night", "bg-mint", "bg-accent", "bg-beige", "bg-night-2"];

/** Small bordered tag with a dot, as on the home page. */
function Tag({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em]", dark ? "border-lit/70 text-lit" : "border-night-2 bg-white text-night-2")}>
      <span className={cn("size-1.5 rounded-full", dark ? "bg-lit" : "bg-night")} aria-hidden />
      {children}
    </span>
  );
}

export function SponsorHero() {
  const h = sponsorHero;
  const photo = media("/media/gallery/day1/SmartIDEAthon-day1-4.webp");
  return (
    <section className="on-cream grid-paper relative overflow-hidden text-night-2">
      <Container className="relative flex flex-col items-center pb-12 pt-14 text-center sm:pt-20">
        <Tag>{h.eyebrow}</Tag>
        <h1 className="mt-7 max-w-4xl text-balance font-display text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl">
          Partner with India&apos;s next generation of <Accent>founders</Accent>
        </h1>
        <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-night-2/80 sm:text-xl">{h.subtitle}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="#tiers" className="px-8 py-3.5">View partnership tiers →</ButtonLink>
          <ButtonLink href="/documents/GIC-2026-Sponsorship-Brochure.pdf" variant="outline" className="sticker-sm border-night-2 bg-white px-8 py-3.5 text-night-2 hover:bg-cream" download>
            Download brochure (PDF)
          </ButtonLink>
        </div>
      </Container>
      <Container className="relative pb-14">
        <div className="sticker relative overflow-hidden">
          <Image {...photo} alt="" sizes="(min-width:1280px) 80rem, 100vw" className="aspect-[16/8] w-full object-cover" priority />
          <div className="sticker-sm absolute bottom-5 left-5 flex items-center gap-4 bg-cream p-4 text-night-2">
            <div className="sticker-sm grid size-14 place-items-center bg-white font-display text-2xl font-bold text-night">{h.finale.day}</div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-night">Grand Finale</p>
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
    <Section tone="antique">
      <SectionHeading
        tone="paper"
        eyebrow="Why partner with GITAM Innovation Challenge"
        title={<>India&apos;s next founders start their <Accent>pitch</Accent> here.</>}
        description="GITAM's flagship national student innovation and pitching competition, connecting partners with emerging founders, ideas and ecosystems."
      />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {whyPartner.map((w) => (
          <li key={w.title} className="sticker flex gap-5 bg-white p-7">
            <span className={cn("sticker-sm size-14 shrink-0", tile[w.accent])} aria-hidden />
            <div>
              <h3 className="font-display text-2xl font-bold">{w.title}</h3>
              <p className="mt-1 text-night-2/75">{w.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="sticker mt-6 bg-night-2 p-6 font-display text-xl text-white">
        <strong>Partners do more than fund the stage.</strong> <span className="text-white/75">They help move young founders from raw idea to a sharper pitch.</span>
      </p>
    </Section>
  );
}

export function Numbers() {
  const l = legacyStats;
  const p = projectedReach;
  return (
    <Section tone="paper">
      <SectionHeading tone="paper" eyebrow="Through the years" title={<>A national platform built over <Accent>editions</Accent></>} description="Cumulative programme performance across previous editions." />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="font-display text-7xl font-bold text-night">{l.headline.value}</p>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-night-2/70">{l.headline.label}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {l.grid.map((g, i) => (
              <div key={g.label} className={cn("sticker-sm p-5", ["bg-cream", "bg-mint/60", "bg-white", "bg-accent/40"][i % 4])}>
                <dt className="sr-only">{g.label}</dt>
                <dd className="font-display text-3xl font-bold text-night">{g.value}</dd>
                <p className="text-sm font-semibold text-night-2/75">{g.label}</p>
              </div>
            ))}
          </dl>
          <div className="sticker-sm mt-4 flex items-center gap-5 bg-night-2 p-6 text-white">
            <span className="font-display text-5xl font-bold">{l.states.value}</span>
            <span className="font-display text-2xl text-lit">{l.states.label}</span>
          </div>
          <div className="sticker-sm mt-4 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-night">Backed by the scale of GITAM</p>
            <dl className="mt-3 grid grid-cols-3 gap-4">
              {l.gitamScale.map((g) => (
                <div key={g.label}><dd className="font-display text-2xl font-bold">{g.value}</dd><dt className="text-sm text-night-2/70">{g.label}</dt></div>
              ))}
            </dl>
          </div>
          <p className="mt-3 text-xs italic text-night-2/65">{l.note}</p>
        </div>

        <div className="sticker bg-cream p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-night">2026 projected programme reach</p>
          <p className="mt-3 font-display text-7xl font-bold text-night">{p.headline.value}</p>
          <p className="font-semibold text-night-2/75">{p.headline.label}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {p.grid.map((g) => (
              <div key={g.label} className="sticker-sm bg-white p-5">
                <dd className="font-display text-3xl font-bold text-night">{g.value}</dd>
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-night-2/70">{g.label}</dt>
              </div>
            ))}
          </dl>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {sponsorTracks.map((t, i) => (
              <li key={t.name} className={cn("sticker-sm p-5", i === 0 ? "bg-night text-white" : "bg-white")}>
                <span className={cn("inline-block rounded-full border-2 border-night-2 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-night-2", i === 0 ? "bg-mint" : "bg-accent/60")}>{t.badge}</span>
                <p className="mt-3 font-display text-xl font-bold">{t.name}</p>
                <p className={cn("mt-2 text-sm", i === 0 ? "text-white/80" : "text-night-2/75")}>{t.focus}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] opacity-70">Partner relevance</p>
                <p className="text-sm font-semibold">{t.relevance}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs italic text-night-2/65">{p.note}</p>
        </div>
      </div>
    </Section>
  );
}

export function ThemesForPartners() {
  const colors = [tile.teal, tile.mint, tile.coral, tile.gold, tile.blue];
  return (
    <Section tone="antique">
      <SectionHeading tone="paper" eyebrow="2026 innovation themes" title={<>Five innovation spaces your organisation can help <Accent>shape</Accent></>} description="Partners can own a theme through naming, challenges, mentors, jury roles and awards." />
      <ol className="mt-12 space-y-4">
        {themes.map((t, i) => (
          <li key={t.id} className="sticker grid overflow-hidden bg-white sm:grid-cols-[8rem_1fr_16rem]">
            <div className={cn("grid place-items-center border-b-2 border-night-2 py-4 sm:min-h-32 sm:border-b-0 sm:border-r-2 sm:py-0", colors[i])}>
              <span className="font-display text-6xl font-bold leading-none sm:text-7xl" aria-label={`Theme ${i + 1}`}>0{i + 1}</span>
            </div>
            <div className="flex items-center gap-4 p-6">
              <Image {...t.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-lg" />
              <div>
                <h3 className="font-display text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-sm text-night-2/70">{t.subtitle}</p>
              </div>
            </div>
            <div className="border-t-2 border-night-2/15 p-6 sm:border-l-2 sm:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-night">Partner fit</p>
              <p className="mt-1 font-semibold">{t.partnerFit}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="sticker-sm mt-6 bg-night-2 p-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-white">Theme partner: own a sector conversation all season</p>
    </Section>
  );
}

export function SelectionJourney() {
  const colors = [tile.teal, tile.mint, tile.gold, tile.coral, tile.blue];
  return (
    <Section tone="paper">
      <SectionHeading tone="paper" eyebrow="The selection journey" title={<>From national applications to the <Accent>Grand Finale</Accent></>} description="A five-stage founder journey, with meaningful partner touchpoints throughout." />
      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {journeyTouchpoints.map((j, i) => (
          <li key={j.code} className="text-center">
            <div className={cn("sticker mx-auto grid size-28 place-items-center rounded-full", colors[i])} style={{ borderRadius: "9999px" }}>
              <div>
                <p className="text-xs font-bold opacity-80">{j.code}</p>
                <p className="font-display text-xl font-bold">{j.stage}</p>
              </div>
            </div>
            <p className="mt-5 font-semibold">{j.what}</p>
            <p className="sticker-sm mx-auto mt-3 max-w-[12rem] bg-cream px-3 py-2 text-sm font-semibold text-night-2">{j.touchpoint}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function FinaleDay() {
  return (
    <Section tone="night2">
      <SectionHeading tone="night" eyebrow="Grand Finale · 12 February 2027" title={<>One stage. <Accent>16 finalists.</Accent></>} description="A full day of live pitches, industry conversations, awards and networking at GITAM Hyderabad." />
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-sm font-bold text-lit">Partner presence on the day</p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {partnerPresence.map((p, i) => (
              <li key={p} className={cn("sticker-sm px-4 py-3 text-center text-sm font-bold", i % 2 === 0 ? "bg-cream text-night-2" : "bg-night text-white")}>{p}</li>
            ))}
          </ul>
          <p className="sticker-sm mt-8 bg-night p-5 font-semibold">A sponsor experience designed around founder access, thought leadership and visible participation.</p>
        </div>
        <div className="sticker bg-cream p-7 text-night-2 sm:p-9">
          <p className="text-sm font-bold text-night">Event-day flow</p>
          <ol className="mt-5 space-y-3.5">
            {finaleFlow.map((f, i) => (
              <li key={f.time + f.label} className="flex items-center gap-4">
                <span className={cn("size-3 shrink-0 rounded-full border border-night-2", dot[i % dot.length])} aria-hidden />
                <span className="w-14 font-display font-bold text-night">{f.time}</span>
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
  const colors = [tile.teal, tile.mint, tile.gold, tile.coral];
  return (
    <Section tone="paper">
      <SectionHeading tone="paper" eyebrow="What your organisation gains" title={<>A partnership built around access, engagement and <Accent>measurable value</Accent></>} />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {gains.map((g, i) => (
          <li key={g.title} className="sticker flex gap-5 bg-cream p-7">
            <span className={cn("sticker-sm size-14 shrink-0", colors[i])} style={{ borderRadius: "9999px" }} aria-hidden />
            <div>
              <h3 className="font-display text-xl font-bold">{g.title}</h3>
              <p className="mt-1 text-night-2/75">{g.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="sticker mt-6 bg-night-2 p-8 text-white">
        <p className="font-display text-xl font-bold">Every major partner receives an impact report</p>
        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {impactReport.map((r, i) => (
            <li key={r} className="flex items-center gap-2.5 font-semibold">
              <span className={cn("size-3 rounded-full", dot[i % dot.length], i % 5 === 4 && "bg-lit")} aria-hidden />{r}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm italic text-white/65">Measurement scope varies by tier and available programme data.</p>
      </div>
    </Section>
  );
}

export function Tiers() {
  return (
    <Section id="tiers" tone="night">
      <SectionHeading tone="night" eyebrow="Partnership opportunities" title={<>Choose the level of ownership that fits your <Accent>ambition</Accent></>} description="Custom partnership structures are available for strategic requirements." />
      <ol className="mt-12 grid gap-5 md:grid-cols-5">
        {tiers.map((t) => (
          <li key={t.id} className={cn("sticker flex flex-col justify-between p-6", tile[t.accent === "teal" ? "blue" : t.accent])}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">{t.name}</p>
              <p className="mt-2 font-display text-5xl font-bold">{t.price}</p>
            </div>
            <div className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{t.level}</p>
              <p className="mt-1 text-sm font-semibold leading-snug">{t.headline}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="sticker-sm mt-8 bg-cream p-4 text-center font-semibold text-night-2">{tierAvailability}</p>
    </Section>
  );
}

function CellView({ v }: { v: Cell }) {
  if (v === true) return <span className="mx-auto block size-3.5 rounded-full bg-night" role="img" aria-label="Included" />;
  if (v === false) return <span className="mx-auto block size-3.5 rounded-full border-2 border-night-2/40" role="img" aria-label="Not included" />;
  if (v === "half") return <span className="mx-auto block size-3.5 rounded-full border-2 border-night bg-[linear-gradient(90deg,var(--color-night)_50%,transparent_50%)]" role="img" aria-label="Partial" />;
  return <span className="text-sm text-night-2/75">{v}</span>;
}

export function BenefitsMatrix() {
  return (
    <Section tone="antique">
      <SectionHeading tone="paper" eyebrow="Benefits at a glance" title={<>Clear deliverables at every <Accent>partnership level</Accent></>} />
      <div className="sticker mt-10 overflow-x-auto bg-white">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="bg-night text-white">
              <th scope="col" className="bg-night-2 p-4 text-sm font-bold">Benefit</th>
              {benefitColumns.map((c) => <th key={c} scope="col" className="p-4 text-center text-sm font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {benefits.map((b, i) => (
              <tr key={b.name} className={i % 2 ? "bg-cream/60" : "bg-white"}>
                <th scope="row" className="p-4 font-bold">{b.name}</th>
                {b.values.map((v, j) => <td key={j} className="p-4 text-center"><CellView v={v} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-14 font-display text-3xl font-bold text-night-2">Build a partnership around your objective</h3>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {objectives.map((o, i) => (
          <li key={o.title} className="sticker-sm flex items-start gap-4 bg-white p-5">
            <span className={cn("mt-1 size-4 shrink-0 rounded-full border-2 border-night-2", dot[i % dot.length])} aria-hidden />
            <div>
              <p className="font-display font-bold text-night">{o.title}</p>
              <p className="text-sm font-semibold">{o.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm italic text-night-2/70">{sponsorDisclaimer}</p>
    </Section>
  );
}

export function SponsorContact() {
  const c = sponsorContacts;
  // Brochure p.12 "Past ecosystem associations": DPIIT, Bower, E-Club, Balavikas, GITAM.
  // DPIIT is no longer on the home-page partner list, so it is referenced directly.
  const assoc = [
    { name: "DPIIT Startup India", ...media("/media/logos/dpiit.webp") },
    ...partners.filter((p) => ["Bower School of Entrepreneurship", "E-Club", "Balavikas", "GITAM"].includes(p.name)),
  ];
  return (
    <Section tone="night2">
      <Tag dark>Partnership conversations are open</Tag>
      <h2 className="mt-6 max-w-3xl text-balance font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
        Let&apos;s shape the next generation of <Accent>founders</Accent> together.
      </h2>
      <p className="mt-5 text-white/75">Theme ownership, category exclusivity and premium stage rights are limited.</p>

      <div className="sticker mt-12 bg-cream p-8 text-night-2 sm:p-10">
        <p className="font-bold text-night">Reserve your partnership category</p>
        <p className="mt-5 font-display text-2xl font-bold">{c.office.name}</p>
        <p className="font-display text-xl">{c.office.org}</p>
        <p className="mt-2 font-semibold text-night">
          <a href={`mailto:${c.office.email}`} className="underline underline-offset-4">{c.office.email}</a> ·{" "}
          <a href={c.office.href} className="underline underline-offset-4">{c.office.site}</a>
        </p>
      </div>

      <h3 className="mt-12 text-sm font-bold text-lit">Outreach contacts</h3>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {c.outreach.map((o) => (
          <li key={o.name} className="sticker bg-white p-6 text-night-2">
            <p className="font-display text-2xl font-bold">{o.name}</p>
            <p className="mt-2 text-night-2/75">{o.role}</p>
            <p><a className="font-semibold text-night hover:underline" href={`tel:${o.phone.replace(/\s/g, "")}`}>{o.phone}</a></p>
            <p><a className="font-semibold text-night hover:underline" href={`mailto:${o.email}`}>{o.email}</a></p>
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-sm font-bold text-lit">Past ecosystem associations</h3>
      <ul className="sticker mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 bg-white p-6">
        {assoc.map((p) => (
          <li key={p.name}><Image src={p.src} width={p.width} height={p.height} alt={p.name} className="h-12 w-auto object-contain" /></li>
        ))}
      </ul>
    </Section>
  );
}
