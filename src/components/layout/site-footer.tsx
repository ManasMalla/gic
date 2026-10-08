import Image from "next/image";
import Link from "next/link";
import { media } from "@/lib/media";
import { documents, nav, site } from "@/content/site";

const logo = media("/media/brand/gic-logo-white.webp");
const vdc = media("/media/brand/vdc-logo.webp");

export function SiteFooter() {
  return (
    <footer className="bg-forest-deep text-white/80">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-5">
            <Image {...logo} alt="GITAM Innovation Challenge" className="h-14 w-auto" />
            <Image {...vdc} alt="Venture Development Centre" className="h-12 w-auto" />
          </div>
          <p className="mt-6 max-w-xs text-sm leading-relaxed">{site.description}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-lg text-white">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-gold">{n.label}</Link>
              </li>
            ))}
            <li><Link href="/register" className="hover:text-gold">Register</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg text-white">Downloads</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {documents.map((d) => (
              <li key={d.href}>
                <a href={d.href} className="hover:text-gold" download>{d.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Contact</h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic">
            <p>{site.contact.address}</p>
            <p><a className="hover:text-gold" href={site.links.vdc}>Venture Development Centre (VDC)</a></p>
            <p><a className="hover:text-gold" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></p>
            <p>
              {site.contact.phones.map((p, i) => (
                <span key={p}>
                  {i > 0 && " · "}
                  <a className="hover:text-gold" href={`tel:${p.replace(/\s/g, "")}`}>{p}</a>
                </span>
              ))}
            </p>
          </address>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {site.social.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-gold">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/55">
        © {site.edition}, GITAM Deemed to be University. All rights reserved.
      </div>
    </footer>
  );
}
