import { ButtonLink } from "@/components/ui/button";

/** Shown wherever a signed-in user is required. `next` is where they land after Google sign-in. */
export function SignInCard({ next, title = "Sign in to apply", error }: { next: string; title?: string; error?: string }) {
  const messages: Record<string, string> = {
    not_configured: "Google sign-in isn't configured on this environment yet.",
    cancelled: "Sign-in was cancelled. You can try again.",
    state: "Your sign-in session expired. Please try again.",
    failed: "We couldn't verify your Google account. Please try again.",
  };
  return (
    <div className="mx-auto max-w-lg rounded-[1.75rem] border border-line bg-white p-8 text-center shadow-card sm:p-10">
      <h2 className="font-display text-3xl font-bold">{title}</h2>
      <p className="mt-3 text-muted">
        Use your Google (Gmail) account. It becomes your team&apos;s login to track payment and submit or edit your idea later.
      </p>
      {error && messages[error] && <p role="alert" className="mt-5 rounded-xl bg-coral/10 p-3 text-sm font-medium text-coral">{messages[error]}</p>}
      <ButtonLink href={`/api/auth/google?next=${encodeURIComponent(next)}`} variant="brand" className="mt-7 w-full gap-3 py-3.5 text-base">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.9-5.35 3.9a6 6 0 1 1 0-12c1.5 0 2.85.55 3.9 1.45l2.1-2.1A9 9 0 1 0 12 21c5.2 0 8.6-3.65 8.6-8.8 0-.4-.05-.8-.15-1.1z" />
        </svg>
        Continue with Google
      </ButtonLink>
      <p className="mt-4 text-xs text-muted">We only read your name and verified email.</p>
    </div>
  );
}
