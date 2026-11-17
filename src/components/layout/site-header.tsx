import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { media } from "@/lib/media";
import { nav } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

const logo = media("/media/brand/gic-logo-white.webp");

/** Floating glass bar. The home hero slides up behind it (see Hero); other pages simply start below it. */
export function SiteHeader() {
  return (
    <header className="on-dark sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full border border-white/10 bg-night-2/90 pl-5 pr-2.5 text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] backdrop-blur-xl">
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" aria-label="GITAM Innovation Challenge — home">
            <Image {...logo} alt="GITAM Innovation Challenge" className="h-9 w-auto" priority />
          </Link>
          <span aria-hidden className="text-lg font-light text-white/40">×</span>
          {/* Plain <img>: next/image does not optimise SVG. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/logos/bower-white.svg" alt="Bower School of Entrepreneurship" width={100} height={30} className="h-5 w-auto" />
        </div>
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-baseline gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span className="text-lit/70 group-hover:text-lit">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
          <ButtonLink href="/register" className="px-5 py-2.5 text-sm whitespace-nowrap max-sm:hidden">
            Register
          </ButtonLink>
          <MobileNav items={nav} />
        </div>
      </div>
    </header>
  );
}
