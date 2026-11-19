import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { media } from "@/lib/media";
import { nav } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

const logo = media("/media/brand/gic-logo.webp");

/** VDC-style bar: light and translucent, colour logos, ink links, one dark-green button. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-beige/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-[88rem] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" aria-label="GITAM Innovation Challenge — home">
            <Image {...logo} alt="GITAM Innovation Challenge" className="h-10 w-auto" priority />
          </Link>
        </div>
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold text-night-2 transition-colors hover:bg-cream"
                >
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
          <ButtonLink href="/register" className="px-5 py-2.5 whitespace-nowrap max-sm:hidden">
            Register your team
          </ButtonLink>
          <MobileNav items={nav} />
        </div>
      </div>
    </header>
  );
}
