import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { media } from "@/lib/media";
import { nav, site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { CountdownBar } from "./countdown-bar";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

const logo = media("/media/brand/gic-logo.webp");
const bower = media("/media/logos/bower.webp");

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
          <Link href="/" aria-label="GITAM Innovation Challenge — home">
            <Image {...logo} alt="GITAM Innovation Challenge" className="h-10 w-auto sm:h-11" priority />
          </Link>
          <span aria-hidden className="text-lg font-light text-muted">×</span>
          <Image {...bower} alt="Bower School of Entrepreneurship" className="h-7 w-auto sm:h-9" priority />
        </div>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-mint-soft hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
          <ButtonLink href="/register" className="px-5 py-2.5 whitespace-nowrap max-sm:hidden">
            Apply now
          </ButtonLink>
          <MobileNav items={nav} />
        </div>
      </div>
      <CountdownBar closesAt={site.registration.closesAt} closesLabel={site.registration.closes} />
    </header>
  );
}
