import { getSession } from "@/lib/auth/session";

/** Signed-in user shown in the header. Reads the session, so it must be rendered inside <Suspense>. */
export async function UserMenu() {
  const user = await getSession();
  if (!user) return null;
  return (
    <div className="hidden items-center gap-1 sm:flex">
      <a href="/portal" className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 hover:bg-white/10 hover:text-white">
        My portal
      </a>
      <span className="grid size-8 place-items-center rounded-full bg-lit text-sm font-bold text-night" title={user.email} aria-hidden>
        {user.name.charAt(0).toUpperCase()}
      </span>
      <form action="/api/auth/signout" method="post">
        <button className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 hover:bg-white/10 hover:text-white">Sign out</button>
      </form>
    </div>
  );
}
