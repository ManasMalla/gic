import { getSession } from "@/lib/auth/session";

/** Signed-in user shown in the header. Reads the session, so it must be rendered inside <Suspense>. */
export async function UserMenu() {
  const user = await getSession();
  if (!user) return null;
  return (
    <div className="hidden items-center gap-1 sm:flex">
      <a href="/portal" className="rounded-full px-3 py-2 text-sm font-medium text-ink/80 hover:bg-mint-soft hover:text-brand">
        My portal
      </a>
      <span className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white" title={user.email} aria-hidden>
        {user.name.charAt(0).toUpperCase()}
      </span>
      <form action="/api/auth/signout" method="post">
        <button className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-mint-soft hover:text-brand">Sign out</button>
      </form>
    </div>
  );
}
