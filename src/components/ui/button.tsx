import Link from "next/link";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary: "bg-gold text-ink hover:bg-[#f0c451]",
  brand: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-current/30 hover:bg-white/10",
  ghost: "text-brand hover:bg-brand/10",
} as const;

type Variant = keyof typeof variants;

export function ButtonLink({
  href,
  variant = "primary",
  className,
  external,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & { href: string; variant?: Variant; external?: boolean }) {
  const cls = cn(base, variants[variant], className);
  if (external || /^(https?:|mailto:|tel:)/.test(href) || /\.(pdf|pptx)$/.test(href)) {
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...(props as object)} />
    );
  }
  return <Link href={href} className={cls} {...props} />;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
