"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { registerTeam, type RegisterState } from "@/app/register/actions";
import { Button } from "@/components/ui/button";
import { tracks } from "@/content/tracks";
import { GENDERS, validateStep, type FieldErrors, type StepId } from "@/lib/registration/schema";
import { cn } from "@/lib/cn";
import { SelectField, TextAreaField, TextField } from "./fields";

const steps: { id: StepId; title: string }[] = [
  { id: "team", title: "Team & track" },
  { id: "members", title: "Team members" },
  { id: "confirm", title: "Review" },
];

const genderOptions = GENDERS.map((g) => ({ value: g, label: g.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) }));
const initial: RegisterState = { status: "idle" };

const owns: Record<StepId, string[]> = {
  team: ["track", "teamName", "institution", "address", "cityState"],
  members: ["founder", "cofounder", "member3", "member4", "member5", "member6"],
  confirm: ["declaration", "remarks"],
};

/** Step 1 of the journey (after Google sign-in): who is on the team. Payment is next, the idea comes later in the portal. */
export function TeamWizard({ defaultTrack, email }: { defaultTrack: "junior" | "main" | ""; email: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerTeam, initial);
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<string>(defaultTrack);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" || state.status === "exists") router.push("/register/payment");
  }, [state, router]);

  const errors = { ...(state.status === "error" ? state.errors : {}), ...clientErrors };
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

      <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s.id} aria-current={i === step ? "step" : undefined}>
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-brand" : "bg-line")} />
            <p className={cn("mt-2 text-xs font-semibold sm:text-sm", i === step ? "text-brand" : "text-muted")}>
              <span className="hidden sm:inline">{i + 1}. </span>{s.title}
            </p>
          </li>
        ))}
      </ol>

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
        <TextField label="Team name" name="teamName" maxLength={100} required error={errors.teamName} />
        <TextField label={track === "junior" ? "School name" : "College / institution"} name="institution" maxLength={150} required error={errors.institution} />
        <TextAreaField label="Address" name="address" maxLength={200} required error={errors.address} />
        <TextField label="City & state" name="cityState" maxLength={100} required error={errors.cityState} />
      </fieldset>

      <fieldset hidden={step !== 1} className="space-y-8">
        <legend className="mb-2 font-display text-3xl font-bold">Team members</legend>
        <p className="text-muted">{track === "main" ? "2–6" : "2–4"} members. Only the Lead and Co-lead are invited to the Grand Finale; everyone receives a certificate.</p>
        <Member prefix="founder" title="Lead (founder)" errors={errors} required />
        <Member prefix="cofounder" title="Co-lead" errors={errors} required />
        <Member prefix="member3" title="Member 3 (optional)" errors={errors} />
        <Member prefix="member4" title="Member 4 (optional)" errors={errors} />
        {track === "main" && (
          <>
            <Member prefix="member5" title="Member 5 (optional)" errors={errors} />
            <Member prefix="member6" title="Member 6 (optional)" errors={errors} />
          </>
        )}
      </fieldset>

      <fieldset hidden={step !== 2} className="space-y-6">
        <legend className="mb-2 font-display text-3xl font-bold">Review &amp; continue</legend>
        <div className="rounded-card bg-mint-soft p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Registration fee</p>
          <p className="mt-1 font-display text-4xl font-bold">{trackInfo ? `₹${trackInfo.fee}` : "—"} <span className="text-base font-normal text-muted">per team</span></p>
          <ol className="mt-4 list-inside list-decimal space-y-1 text-sm text-muted">
            <li><strong className="text-ink">Save your team</strong> (this step)</li>
            <li>Pay the fee on <strong className="text-ink">GITAM GEvents</strong></li>
            <li>Once payment is confirmed, open the <strong className="text-ink">portal</strong> to choose your theme and submit your idea — you can edit it until the deadline.</li>
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
          <Button type="submit" disabled={pending || redirecting}>{pending || redirecting ? "Saving…" : "Save team & continue to payment"}</Button>
        )}
      </div>
    </form>
  );
}

function Member({ prefix, title, errors, required }: { prefix: string; title: string; errors: FieldErrors; required?: boolean }) {
  const f = (k: string) => `${prefix}.${k}`;
  return (
    <div className="rounded-card border border-line p-6">
      <h3 className="mb-4 font-display text-xl font-bold">{title}</h3>
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
