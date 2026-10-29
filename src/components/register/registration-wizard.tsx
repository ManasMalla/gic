"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { registerTeam, type RegisterState } from "@/app/register/actions";
import { Button } from "@/components/ui/button";
import { tracks } from "@/content/tracks";
import { GENDERS, validateStep, type FieldErrors, type StepId } from "@/lib/registration/schema";
import { cn } from "@/lib/cn";
import { clearStoredReferral, readStoredReferral } from "@/lib/referral";
import { SelectField, TextAreaField, TextField } from "./fields";

const steps: { id: StepId; title: string }[] = [
  { id: "team", title: "Team & track" },
  { id: "members", title: "Team members" },
  { id: "confirm", title: "Review" },
];

// What the progress bar shows: the whole journey, including the two steps that happen after this form.
const journey = ["Team & track", "Team members", "Submit idea", "Pay now"];

const genderOptions = GENDERS.map((g) => ({ value: g, label: g.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) }));
const initial: RegisterState = { status: "idle" };

const owns: Record<StepId, string[]> = {
  team: ["track", "teamName", "referralCode", "institution", "address", "cityState"],
  members: ["founder", "cofounder", "member3", "member4", "member5", "member6"],
  confirm: ["declaration", "remarks"],
};

/** Steps 1-2 of the journey (after Google sign-in): who is on the team. The idea (step 3) and the payment (step 4, last) follow in the portal. */
export function TeamWizard({ defaultTrack, email, paidFirst = false, defaultReferral = "" }: { defaultTrack: "junior" | "main" | ""; email: string; paidFirst?: boolean; defaultReferral?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerTeam, initial);
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<string>(defaultTrack);
  const [memberCount, setMemberCount] = useState(2); // founder + co-founder are always shown
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Never lose a referral: the account's code is prefilled by the server; if it has not been linked yet (they just arrived and
  // signed in on this very page) fall back to what the browser remembers, or ask the server once more.
  useEffect(() => {
    const field = formRef.current?.elements.namedItem("referralCode") as HTMLInputElement | null;
    if (!field || field.value) return;
    const stored = readStoredReferral();
    if (stored) { field.value = stored; return; }
    fetch("/api/me/referral", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { code?: string | null } | null) => { if (d?.code && !field.value) field.value = d.code; })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (state.status === "success" || state.status === "exists") {
      clearStoredReferral(); // it now lives on the application itself
      // Already paid: no payment page, let the status page attach the payment and move on to the portal.
      router.push(paidFirst ? "/register/payment-status?status=success&paid=1" : "/portal");
    }
  }, [state, router, paidFirst]);

  const errors = { ...(state.status === "error" ? state.errors : {}), ...clientErrors };
  const maxMembers = track === "main" ? 6 : 4;
  const shown = Math.min(memberCount, maxMembers);
  const trackInfo = tracks.find((t) => t.id === track);

  function validateCurrent(): FieldErrors {
    return validateStep(steps[step].id, new FormData(formRef.current!));
  }
  function next() {
    const found = validateCurrent();
    setClientErrors(found);
    if (Object.keys(found).length === 0) setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateCurrent();
    setClientErrors(found);
    if (Object.keys(found).length) return;
    // Calling the action directly (instead of <form action>) stops React from resetting the form on errors.
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  const serverKeys = state.status === "error" ? Object.keys(state.errors) : [];
  const firstBad = serverKeys.length ? steps.findIndex((s) => serverKeys.some((k) => owns[s.id].includes(k.split(".")[0]))) : -1;
  const redirecting = state.status === "success" || state.status === "exists";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mx-auto max-w-3xl">
      <p className="mb-6 rounded-xl bg-mint-soft px-4 py-3 text-sm text-muted">
        Signed in as <strong className="text-ink">{email}</strong>. This account will manage your team&apos;s application.
      </p>

      {/* The whole journey. Paid first: "4 Pay now" is already done, so the order reads 4 (done) -> 1 -> 2 -> 3. */}
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Progress">
        {(paidFirst
          ? [{ n: 4, title: "Pay now", done: true }, { n: 1, title: "Team & track" }, { n: 2, title: "Team members" }, { n: 3, title: "Submit idea" }]
          : journey.map((title, i) => ({ n: i + 1, title }))
        ).map((item, i) => {
          const active = paidFirst ? Math.min(step, 1) + 1 === i : i === step;
          const filled = "done" in item && item.done ? true : paidFirst ? i <= Math.min(step, 1) + 1 : i <= step;
          return (
            <li key={item.title} aria-current={active ? "step" : undefined}>
              <div className={cn("h-1.5 rounded-full", filled ? "bg-brand" : "bg-line")} />
              <p className={cn("mt-2 text-xs font-semibold sm:text-sm", active ? "text-brand" : "text-muted")}>
                <span className="hidden sm:inline">{item.n}. </span>{item.title}{"done" in item && item.done ? " ✓" : ""}
              </p>
            </li>
          );
        })}
      </ol>

      {paidFirst && (
        <p role="status" className="mb-6 rounded-xl bg-mint-soft px-4 py-3 text-sm text-ink">
          <strong>We received your payment.</strong> Now tell us about your team. Use the <strong>email you paid with on GEvents</strong> as the Lead&apos;s email
          (or add it as a team member) so we can attach your payment automatically, then you&apos;ll submit your idea.
        </p>
      )}

      {state.status === "error" && state.message && (
        <div role="alert" className="mb-6 rounded-xl bg-coral/10 p-4 text-sm font-medium text-coral">
          {state.message}{" "}
          {firstBad >= 0 && firstBad !== step && (
            <button type="button" className="underline" onClick={() => setStep(firstBad)}>Go to “{steps[firstBad].title}”</button>
          )}
        </div>
      )}

      {/* All steps stay mounted (just hidden) so every field is submitted and nothing is lost between steps. */}
      <fieldset hidden={step !== 0} className="space-y-5">
        <legend className="mb-2 font-display text-3xl font-bold">Team &amp; track</legend>
        <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Track">
          {tracks.map((t) => (
            <label key={t.id} className={cn("cursor-pointer rounded-card border-2 p-5 transition-colors", track === t.id ? "border-brand bg-mint-soft" : "border-line hover:border-brand/40")}>
              <input type="radio" name="track" value={t.id} checked={track === t.id} onChange={() => setTrack(t.id)} className="sr-only" />
              <span className="font-display text-xl font-bold">{t.name}</span>
              <span className="mt-1 block text-sm text-muted">{t.audience}</span>
              <span className="mt-3 block font-semibold text-brand">₹{t.fee} per team · {t.teamSize}</span>
            </label>
          ))}
        </div>
        {errors.track && <p role="alert" className="text-xs font-medium text-coral">{errors.track}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Team name" name="teamName" maxLength={100} required error={errors.teamName} />
          <TextField label="Referral code (optional)" name="referralCode" maxLength={30} autoComplete="off" defaultValue={defaultReferral} error={errors.referralCode} />
        </div>
        <TextField label={track === "junior" ? "School name" : "College / institution"} name="institution" maxLength={150} required error={errors.institution} />
        <TextAreaField label="Address" name="address" maxLength={200} required error={errors.address} />
        <TextField label="City & state" name="cityState" maxLength={100} required error={errors.cityState} />
      </fieldset>

      <fieldset hidden={step !== 1} className="space-y-8">
        <legend className="mb-2 font-display text-3xl font-bold">Team members</legend>
        <p className="text-muted">{track === "main" ? "2–6" : "2–4"} members. Only the Lead and Co-lead are invited to the Grand Finale; everyone receives a certificate.</p>
        <Member prefix="founder" title="Lead (founder)" errors={errors} required />
        <Member prefix="cofounder" title="Co-lead" errors={errors} required />
        {[3, 4, 5, 6].filter((n) => n <= shown).map((n) => (
          <Member
            key={n}
            prefix={`member${n}`}
            title={`Member ${n} (optional)`}
            errors={errors}
            onRemove={n === shown ? () => setMemberCount(n - 1) : undefined}
          />
        ))}
        {shown < maxMembers && (
          <Button type="button" variant="ghost" onClick={() => setMemberCount(shown + 1)}>+ Add member {shown + 1}</Button>
        )}
      </fieldset>

      <fieldset hidden={step !== 2} className="space-y-6">
        <legend className="mb-2 font-display text-3xl font-bold">{paidFirst ? "Review & finish" : "Review & continue"}</legend>
        <div className="rounded-card bg-mint-soft p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">{paidFirst ? "Registration fee: paid ✓" : "Registration fee (paid last)"}</p>
          <p className="mt-1 font-display text-4xl font-bold">{trackInfo ? `₹${trackInfo.fee}` : "—"} <span className="text-base font-normal text-muted">per team</span></p>
          <ol className="mt-4 list-inside list-decimal space-y-1 text-sm text-muted">
            <li><strong className="text-ink">Save your team</strong> (this step)</li>
            <li><strong className="text-ink">Submit your idea</strong> in the team portal: details, pitch deck and a 1-minute video</li>
            <li><strong className="text-ink">Pay now</strong> on GITAM GEvents{paidFirst ? " (done, we have your payment)" : " as the last step. Your entry is confirmed once the payment goes through"}</li>
          </ol>
        </div>
        <TextAreaField label="Remarks (optional)" name="remarks" maxLength={100} rows={2} error={errors.remarks} />
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="declaration" className="mt-1 size-4 accent-brand" aria-invalid={errors.declaration ? true : undefined} />
          <span>I declare that the information provided is accurate and that all team members meet the eligibility criteria for the chosen track.</span>
        </label>
        {errors.declaration && <p role="alert" className="text-xs font-medium text-coral">{errors.declaration}</p>}
      </fieldset>

      <div className="mt-10 flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} className={cn(step === 0 && "invisible")}>← Back</Button>
        {step < steps.length - 1 ? (
          <Button type="button" variant="brand" onClick={next}>Continue →</Button>
        ) : (
          <Button type="submit" disabled={pending || redirecting}>{pending || redirecting ? "Saving…" : paidFirst ? "Save team & continue" : "Save team & submit my idea"}</Button>
        )}
      </div>
    </form>
  );
}

function Member({ prefix, title, errors, required, onRemove }: { prefix: string; title: string; errors: FieldErrors; required?: boolean; onRemove?: () => void }) {
  const f = (k: string) => `${prefix}.${k}`;
  return (
    <div className="rounded-card border border-line p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        {onRemove && <button type="button" onClick={onRemove} className="text-sm font-medium text-coral underline">Remove</button>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" name={f("name")} required={required} maxLength={100} error={errors[f("name")]} autoComplete="off" />
        <TextField label="Course & year" name={f("courseYear")} required={required} maxLength={100} error={errors[f("courseYear")]} />
        <TextField label="Email" name={f("email")} type="email" required={required} maxLength={100} error={errors[f("email")]} />
        <TextField label="Mobile" name={f("phone")} type="tel" inputMode="numeric" required={required} maxLength={15} error={errors[f("phone")]} />
        <SelectField label="Gender" name={f("gender")} required={required} error={errors[f("gender")]} options={genderOptions} />
      </div>
    </div>
  );
}
