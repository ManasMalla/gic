"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { submitRegistration, type RegisterState } from "@/app/register/actions";
import { ButtonLink, Button } from "@/components/ui/button";
import { themes } from "@/content/themes";
import { tracks } from "@/content/tracks";
import { site } from "@/content/site";
import { GENDERS, MAX_DECK_BYTES, validateDeck, validateStep, type FieldErrors, type StepId } from "@/lib/registration/schema";
import { cn } from "@/lib/cn";
import { FileField, SelectField, TextAreaField, TextField } from "./fields";

const steps: { id: StepId; title: string }[] = [
  { id: "team", title: "Team & track" },
  { id: "idea", title: "Your idea" },
  { id: "members", title: "Team members" },
  { id: "confirm", title: "Review" },
];

const genderOptions = GENDERS.map((g) => ({ value: g, label: g.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) }));
const initial: RegisterState = { status: "idle" };

export function RegistrationWizard() {
  const params = useSearchParams();
  const startTrack = params.get("track") === "junior" ? "junior" : params.get("track") === "main" ? "main" : "";
  const [state, formAction, pending] = useActionState(submitRegistration, initial);
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<string>(startTrack);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const errors = { ...(state.status === "error" ? state.errors : {}), ...clientErrors };
  const trackInfo = tracks.find((t) => t.id === track);

  if (state.status === "success") return <Success {...state} />;

  function validateCurrent(): FieldErrors {
    const fd = new FormData(formRef.current!);
    const found = validateStep(steps[step].id, fd);
    if (steps[step].id === "idea") {
      const deckErr = validateDeck(fd.get("pitchDeck") instanceof File ? (fd.get("pitchDeck") as File) : null);
      if (deckErr) found.pitchDeck = deckErr;
    }
    return found;
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

  // If the server rejects a field from an earlier step, jump back to it.
  const serverErrorKeys = state.status === "error" ? Object.keys(state.errors) : [];
  const firstBad = serverErrorKeys.length ? steps.findIndex((s) => serverErrorKeys.some((k) => stepOwns(s.id, k))) : -1;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mx-auto max-w-3xl">
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Progress">
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
        <SelectField label="Innovation theme" name="theme" required error={errors.theme} options={themes.map((t) => ({ value: t.id, label: t.name }))} hint="Pick the theme closest to your idea." />
      </fieldset>

      <fieldset hidden={step !== 1} className="space-y-5">
        <legend className="mb-2 font-display text-3xl font-bold">Your idea</legend>
        <TextField label="Idea / venture title" name="ideaTitle" maxLength={150} required error={errors.ideaTitle} />
        <TextAreaField label="Problem statement" name="problemStatement" maxLength={300} required error={errors.problemStatement} />
        <TextAreaField label="Idea summary" name="ideaSummary" maxLength={600} required error={errors.ideaSummary} />
        <FileField label="Pitch deck" name="pitchDeck" accept=".pdf,.ppt,.pptx" required error={errors.pitchDeck} hint={`PDF, PPT or PPTX, up to ${MAX_DECK_BYTES / 1024 / 1024} MB. `} />
        <p className="-mt-3 text-xs text-muted">
          Use the <a className="font-semibold text-brand underline" href="/documents/GIC-2026-Pitch-Deck-Template.pptx">official 2026 template</a>.
        </p>
        <TextField label="1-minute pitch video link" name="pitchVideoLink" type="url" inputMode="url" placeholder="https://youtube.com/… or Drive link" maxLength={255} required error={errors.pitchVideoLink} />
      </fieldset>

      <fieldset hidden={step !== 2} className="space-y-8">
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

      <fieldset hidden={step !== 3} className="space-y-6">
        <legend className="mb-2 font-display text-3xl font-bold">Review &amp; continue</legend>
        <div className="rounded-card bg-mint-soft p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Registration fee</p>
          <p className="mt-1 font-display text-4xl font-bold">{trackInfo ? `₹${trackInfo.fee}` : "—"} <span className="text-base font-normal text-muted">per team</span></p>
          <p className="mt-3 text-sm text-muted">
            After you submit, we save your application and send you to <strong>GITAM GEvents</strong> to pay the fee. Keep your application reference handy.
          </p>
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
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Submit & continue to payment"}</Button>
        )}
      </div>
    </form>
  );
}

function stepOwns(step: StepId, key: string) {
  const root = key.split(".")[0];
  const map: Record<StepId, string[]> = {
    team: ["track", "teamName", "institution", "address", "cityState", "theme"],
    idea: ["ideaTitle", "problemStatement", "ideaSummary", "pitchVideoLink", "pitchDeck"],
    members: ["founder", "cofounder", "member3", "member4", "member5", "member6"],
    confirm: ["declaration", "remarks"],
  };
  return map[step].includes(root);
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

function Success({ reference, fee, paymentUrl }: Extract<RegisterState, { status: "success" }>) {
  return (
    <div className="mx-auto max-w-2xl rounded-[1.75rem] bg-forest p-8 text-center text-white sm:p-12">
      <p className="mx-auto grid size-14 place-items-center rounded-full bg-gold text-2xl text-ink" aria-hidden>✓</p>
      <h2 className="mt-5 font-display text-4xl font-bold">Application saved</h2>
      <p className="mt-3 text-white/75">One last step — pay the registration fee of <strong className="text-white">₹{fee}</strong> on GITAM GEvents to confirm your team.</p>
      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-mint">Your application reference</p>
      <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-gold">{reference}</p>
      <p className="mt-2 text-sm text-white/60">Quote this on GEvents and in any email to {site.contact.email}.</p>
      <div className="mt-8">
        <ButtonLink href={paymentUrl} external>Continue to payment ↗</ButtonLink>
      </div>
    </div>
  );
}
