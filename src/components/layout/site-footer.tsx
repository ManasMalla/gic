import Link from "next/link";
import { documents, nav, site } from "@/content/site";
import { BrandRays } from "@/components/ui/brand-rays";

export function SiteFooter() {
  return (
    <footer className="on-dark relative overflow-hidden bg-night text-white/80">
      <BrandRays />
      <div className="relative mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          {/* GITAM university lockup in antique white (reverse colour), straight from the brand guidelines. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/gitam/gitam-lockup-antique.svg" alt="GITAM, Deemed to be University" width={260} height={84} className="h-20 w-auto" />
          <p className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl">
            Where dreams <span className="text-lit">take flight.</span>
          </p>
        </div>

        <div className="mt-14 grid gap-12 border-t border-white/20 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <p className="max-w-xs text-sm leading-relaxed">{site.description}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-display text-lg font-bold text-lit">Explore</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-white">{n.label}</Link>
                </li>
              ))}
              <li><Link href="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-lg font-bold text-lit">Downloads</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {documents.map((d) => (
                <li key={d.href}>
                  <a href={d.href} className="hover:text-white" download>{d.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-lit">Contact</h2>
            <address className="mt-4 space-y-2.5 text-sm not-italic">
              <p>{site.contact.address}</p>
              <p><a className="hover:text-white" href={site.links.vdc}>Venture Development Centre (VDC)</a></p>
              <p><a className="hover:text-white" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></p>
              <p>
                {site.contact.phones.map((p, i) => (
                  <span key={p}>
                    {i > 0 && " · "}
                    <a className="hover:text-white" href={`tel:${p.replace(/\s/g, "")}`}>{p}</a>
                  </span>
                ))}
              </p>
            </address>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 py-6 text-center text-xs text-white/60">
          © {site.edition}, GITAM Deemed to be University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
