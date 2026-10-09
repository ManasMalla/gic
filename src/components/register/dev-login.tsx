/** Local testing only: rendered when AUTH_DEV_LOGIN=true (never on Cloud Run). */
export function DevLogin({ next }: { next: string }) {
  return (
    <form action="/api/auth/dev" method="get" className="mx-auto mt-6 max-w-lg rounded-xl border border-dashed border-gold bg-cream-soft p-5 text-sm">
      <p className="font-semibold">Dev sign-in (local only)</p>
      <input type="hidden" name="next" value={next} />
      <div className="mt-3 flex gap-2">
        <input name="email" type="email" required placeholder="anyone@example.com" className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2" />
        <button className="rounded-lg bg-ink px-4 py-2 font-semibold text-white">Sign in</button>
      </div>
    </form>
  );
}
