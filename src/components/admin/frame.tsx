import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { can, ROLE_LABEL, type Me } from "@/lib/staff";

const tabs = [
  { href: "/admin", label: "Overview", id: "overview", perm: "statsTrackCounts" },
  { href: "/admin/referrals", label: "Referral codes", id: "referrals", perm: "referralsCreate" },
  { href: "/admin/applications", label: "Applications", id: "applications", perm: "applications" },
  { href: "/admin/payments", label: "Payments", id: "payments", perm: "applications" },
  { href: "/admin/team", label: "Team & roles", id: "team", perm: "roles" },
] as const;

export function AdminFrame({ me, active, title, notice, error, children }: {
  me: Me; active: (typeof tabs)[number]["id"]; title: string; notice?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <>
      <section className="bg-forest py-10 text-white">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-mint">Admin · {ROLE_LABEL[me.role]}</p>
          <h1 className="mt-3 font-display text-4xl font-bold">{title}</h1>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Admin sections">
            {tabs.filter((t) => can(me, t.perm)).map((t) => (
              <Link key={t.id} href={t.href} aria-current={t.id === active ? "page" : undefined}
                className={cn("rounded-full px-4 py-2 text-sm font-semibold", t.id === active ? "bg-gold text-ink" : "bg-white/10 hover:bg-white/20")}>
                {t.label}
              </Link>
            ))}
          </nav>
        </Container>
      </section>
      <section className="py-10">
        <Container>
          {notice && <p role="status" className="mb-6 rounded-xl bg-mint-soft px-4 py-3 text-sm font-medium text-brand">{notice}</p>}
          {error && <p role="alert" className="mb-6 rounded-xl bg-coral/10 px-4 py-3 text-sm font-medium text-coral">{error}</p>}
          {children}
        </Container>
      </section>
    </>
  );
}

export function NoAccess({ email }: { email: string }) {
  return (
    <Container className="py-24 text-center">
      <h1 className="font-display text-4xl font-bold">No access</h1>
      <p className="mt-3 text-muted">{email} isn&apos;t an organiser account. Ask a super admin to add you.</p>
    </Container>
  );
}

export const th = "px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted";
export const td = "px-3 py-2 align-top text-sm";
export const input = "rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
/** A dropdown that looks the same in every browser (see .select-themed in globals.css). */
export const select = `${input} select-themed`;
export const btn = "rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark";
export const btnDanger = "rounded-full px-3 py-1.5 text-sm font-semibold text-coral hover:bg-coral/10";
