"use client";

import { startTransition, useActionState, useState } from "react";
import { saveIdea, type SaveIdeaState } from "@/app/portal/actions";
import { Button } from "@/components/ui/button";
import { FileField, SelectField, TextAreaField, TextField } from "@/components/register/fields";
import { themes } from "@/content/themes";
import type { MyApplication } from "@/lib/backend";
import { MAX_DECK_BYTES } from "@/lib/portal/schema";

const initial: SaveIdeaState = { status: "idle" };
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const fmt = (iso: string | number) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export function IdeaForm({ initialApp }: { initialApp: MyApplication }) {
  const [state, formAction, pending] = useActionState(saveIdea, initial);
  // After a successful save we show what the server now holds (e.g. the stored deck's name).
  const app = state.status === "saved" ? state.application : initialApp;
  const [editing, setEditing] = useState(!initialApp.ideaComplete);
  const readOnly = !app.canEditIdea;
  const errors = state.status === "error" ? state.errors : {};

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Calling the action directly keeps typed values in place when validation fails (no automatic form reset).
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  const idea = app.idea;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {state.status === "error" && state.message && (
        <div role="alert" className="rounded-xl bg-coral/10 p-4 text-sm font-medium text-coral">{state.message}</div>
      )}
      {state.status === "saved" && (
        <div role="status" className="rounded-xl bg-mint-soft p-4 text-sm font-medium text-brand">
          ✓ Saved at {fmt(state.savedAt)}. You can keep editing until the deadline.
        </div>
      )}

      <fieldset disabled={readOnly || (!editing && app.ideaComplete)} className="space-y-6 disabled:opacity-80">
        <SelectField
          key={`theme-${idea.theme}`} label="Innovation theme" name="theme" required error={errors.theme}
          options={themes.map((t) => ({ value: t.id, label: t.name }))} defaultValue={idea.theme ?? ""}
          hint="Pick the theme closest to your idea."
        />
        <TextField key={`t-${idea.ideaTitle}`} label="Idea / venture title" name="ideaTitle" maxLength={150} required defaultValue={idea.ideaTitle ?? ""} error={errors.ideaTitle} />
        <TextAreaField key={`p-${idea.problemStatement}`} label="Problem statement" name="problemStatement" maxLength={300} required defaultValue={idea.problemStatement ?? ""} error={errors.problemStatement} />
        <TextAreaField key={`s-${idea.ideaSummary}`} label="Idea summary" name="ideaSummary" maxLength={600} required defaultValue={idea.ideaSummary ?? ""} error={errors.ideaSummary} />
        <TextField key={`v-${idea.pitchVideoLink}`} label="1-minute pitch video link" name="pitchVideoLink" type="url" inputMode="url" placeholder="https://youtube.com/… or Drive link" maxLength={255} required defaultValue={idea.pitchVideoLink ?? ""} error={errors.pitchVideoLink} />

        <div>
          <FileField
            label={app.deck ? "Replace pitch deck (optional)" : "Pitch deck"} name="pitchDeck" accept=".pdf,.ppt,.pptx"
            required={!app.deck} error={errors.pitchDeck} hint={`PDF, PPT or PPTX, up to ${MAX_DECK_BYTES / 1024 / 1024} MB.`}
          />
          {app.deck && (
            <p className="mt-2 text-sm text-muted">
              Current deck: <strong className="text-ink">{app.deck.filename}</strong> ({kb(app.deck.size)}). Leave the box empty to keep it.
            </p>
          )}
          <p className="mt-1 text-xs text-muted">
            Use the <a className="font-semibold text-brand underline" href="/documents/GIC-2026-Pitch-Deck-Template.pptx">official 2026 template</a>.
          </p>
        </div>
        <input type="hidden" name="hasExistingDeck" value={app.deck ? "1" : "0"} />
      </fieldset>

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          {app.ideaComplete && !editing ? (
            <Button type="button" variant="brand" onClick={() => setEditing(true)}>Edit my idea</Button>
          ) : (
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : app.ideaComplete ? "Save changes" : "Submit idea"}</Button>
          )}
          {app.ideaUpdatedAt && <span className="text-sm text-muted">Last saved {fmt(app.ideaUpdatedAt)}</span>}
        </div>
      )}
    </form>
  );
}
