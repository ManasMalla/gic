import Image from "next/image";
import Link from "next/link";
import { media } from "@/lib/media";
import { documents, nav, site } from "@/content/site";

const logo = media("/media/brand/gic-logo-white.webp");
const vdc = media("/media/brand/vdc-logo.webp");

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-night text-white/70">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[70rem] -translate-x-1/2 rounded-full bg-lit/15 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <p className="font-sans text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
          Pitch. Build. <span className="text-lit">Lead.</span>
        </p>

        <div className="mt-16 grid gap-12 border-t border-white/10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-5">
              <Image {...logo} alt="GITAM Innovation Challenge" className="h-14 w-auto" />
              <Image {...vdc} alt="Venture Development Centre" className="h-12 w-auto" />
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed">{site.description}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-lit">Explore</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-white">{n.label}</Link>
                </li>
              ))}
              <li><Link href="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-lit">Downloads</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {documents.map((d) => (
                <li key={d.href}>
                  <a href={d.href} className="hover:text-white" download>{d.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-lit">Contact</h2>
            <address className="mt-5 space-y-2.5 text-sm not-italic">
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
        <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
          © {site.edition}, GITAM Deemed to be University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
