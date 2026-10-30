"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { removeVideo, saveAndSubmit, saveIdea, uploadDeck, type SaveIdeaState } from "@/app/portal/actions";
import { uploadVideoInParts } from "@/lib/portal/upload";
import { Button } from "@/components/ui/button";
import { FileField, SelectField, TextAreaField, TextField } from "@/components/register/fields";
import { themes } from "@/content/themes";
import type { MyApplication } from "@/lib/backend";
import { MAX_DECK_BYTES, MAX_VIDEO_BYTES, validateVideo } from "@/lib/portal/schema";

const initial: SaveIdeaState = { status: "idle" };
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const fmt = (iso: string | number) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const errorOf = (s: SaveIdeaState) => (s.status === "error" ? s : undefined);

/**
 * The idea, in steps on one page: details → pitch deck → pitch video (a link OR a file) → Submit.
 * Each file has its own small Upload button (shown once a file is chosen). Submit refuses while a chosen file is still un-uploaded.
 */
export function IdeaForm({ initialApp, payUrl = null, fee = 0 }: { initialApp: MyApplication; payUrl?: string | null; fee?: number }) {
  const router = useRouter();
  const [app, setApp] = useState(initialApp);
  useEffect(() => setApp(initialApp), [initialApp]);
  const readOnly = !app.canEditIdea;

  const [details, detailsAction, savingDetails] = useActionState(saveIdea, initial);
  const [deckState, deckAction, uploadingDeck] = useActionState(uploadDeck, initial);
  // The video FILE goes up in parts (see lib/portal/upload.ts); progress and errors live here, not in a server action.
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState("");
  const [removeState, removeAction, removing] = useActionState(removeVideo, initial);
  const [submitState, submitAction, submitting] = useActionState(saveAndSubmit, initial);

  // Every successful step returns the fresh application: show it, and refresh the server data too.
  useEffect(() => {
    const latest = [details, deckState, removeState, submitState]
      .flatMap((s) => (s.status === "saved" ? [s] : []))
      .sort((a, b) => b.savedAt - a.savedAt)[0];
    if (latest) { setApp(latest.application); router.refresh(); }
  }, [details, deckState, removeState, submitState, router]);

  // A chosen-but-not-uploaded file blocks Submit.
  const [pendingDeck, setPendingDeck] = useState(false);
  const [pendingVideo, setPendingVideo] = useState(false);
  const [blocked, setBlocked] = useState("");
  const deckForm = useRef<HTMLFormElement>(null);
  const videoForm = useRef<HTMLFormElement>(null);
  useEffect(() => { if (deckState.status === "saved") { setPendingDeck(false); deckForm.current?.reset(); } }, [deckState]);
  async function onVideoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = (e.currentTarget.elements.namedItem("pitchVideo") as HTMLInputElement).files?.[0];
    const err = file ? validateVideo(file) : "Choose a video file";
    if (!file || err) { setVideoError(err ?? "Choose a video file"); return; }
    setVideoError(""); setVideoProgress(0); setUploadingVideo(true);
    const result = await uploadVideoInParts(file, setVideoProgress);
    setUploadingVideo(false);
    if (result.ok) { setApp(result.application); setPendingVideo(false); videoForm.current?.reset(); router.refresh(); } else setVideoError(result.message);
  }

  const errors = details.status === "error" ? details.errors : {};
  const idea = app.idea;
  const submitted = !!app.submittedAt;
  const paid = app.status === "paid";
  // Pay after submitting. If editing has closed (deadline) a team that never submitted may still pay.
  const canPay = submitted || !app.canEditIdea;
  const missing = [
    !idea.theme || !idea.ideaTitle || !idea.problemStatement || !idea.ideaSummary ? "Idea details" : null,
    !app.deck ? "Pitch deck" : null,
    !idea.pitchVideoLink && !app.video ? "Video (link or file)" : null,
  ].filter(Boolean) as string[];

  function onDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const native = e.nativeEvent as SubmitEvent;
    const finalStep = (native.submitter as HTMLButtonElement | null)?.value === "submit";
    if (finalStep) {
      const pending = [pendingDeck && "pitch deck", pendingVideo && "video"].filter(Boolean).join(" and ");
      if (pending) {
        const msg = `You chose a ${pending} file but haven't clicked Upload. Click Upload first, then Submit.`;
        setBlocked(msg);
        window.alert(msg);
        return;
      }
    }
    setBlocked("");
    // Calling the action directly keeps typed values in place when validation fails (no automatic form reset).
    const fd = new FormData(e.currentTarget);
    startTransition(() => (finalStep ? submitAction(fd) : detailsAction(fd)));
  }

  const note = (s: SaveIdeaState) => errorOf(s)?.message;
  const flash = [note(details), note(deckState), videoError, note(removeState), note(submitState), blocked].find(Boolean);

  return (
    <div className="space-y-8">
      {flash && <div role="alert" className="rounded-xl bg-coral/10 p-4 text-sm font-medium text-coral">{flash}</div>}
      {details.status === "saved" && (
        <div role="status" className="rounded-xl bg-mint-soft p-4 text-sm font-medium text-brand">✓ Details saved at {fmt(details.savedAt)}.</div>
      )}

      {/* 1 — details. The video link input (step 3) and the final Submit button (step 4) belong to this form too. */}
      <form id="idea-details" onSubmit={onDetailsSubmit} noValidate className="space-y-6">
        <h3 className="font-display text-xl font-bold">Your idea</h3>
        <fieldset disabled={readOnly} className="space-y-6 disabled:opacity-80">
          <SelectField
            key={`theme-${idea.theme}`} label="Innovation theme" name="theme" required error={errors.theme}
            options={themes.map((t) => ({ value: t.id, label: t.name }))} defaultValue={idea.theme ?? ""} hint="Pick the theme closest to your idea."
          />
          <TextField key={`t-${idea.ideaTitle}`} label="Idea / venture title" name="ideaTitle" maxLength={150} required defaultValue={idea.ideaTitle ?? ""} error={errors.ideaTitle} />
          <TextAreaField key={`p-${idea.problemStatement}`} label="Problem statement" name="problemStatement" maxLength={300} required defaultValue={idea.problemStatement ?? ""} error={errors.problemStatement} />
          <TextAreaField key={`s-${idea.ideaSummary}`} label="Idea summary" name="ideaSummary" maxLength={600} required defaultValue={idea.ideaSummary ?? ""} error={errors.ideaSummary} />
        </fieldset>
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" value="save" variant="brand" disabled={savingDetails}>{savingDetails ? "Saving…" : "Save details"}</Button>
            {app.ideaUpdatedAt && <span className="text-sm text-muted">Last saved {fmt(app.ideaUpdatedAt)}</span>}
          </div>
        )}
      </form>

      {/* 2 — pitch deck */}
      <section className="space-y-3 rounded-card border border-line p-5">
        <h3 className="font-display text-xl font-bold">Pitch deck</h3>
        {app.deck && (
          <p className="text-sm">
            Current deck: <a href={app.deck.url ?? "/portal/deck"} className="font-semibold text-brand underline">{app.deck.filename}</a> <span className="text-muted">({kb(app.deck.size)})</span>
          </p>
        )}
        {!app.deck && readOnly && <p className="text-sm text-muted">Not uploaded yet.</p>}
        {!readOnly && (
          <form ref={deckForm} action={deckAction} className="flex flex-wrap items-end gap-3">
            <FileField
              label={app.deck ? "Replace deck" : "Choose your deck"} name="pitchDeck" accept=".pdf,.ppt,.pptx" className="min-w-64 flex-1"
              error={errorOf(deckState)?.errors.pitchDeck} hint={`PDF, PPT or PPTX, up to ${MAX_DECK_BYTES / 1024 / 1024} MB. `}
              onChange={(e) => { setPendingDeck(!!e.currentTarget.files?.length); setBlocked(""); }}
            />
            {pendingDeck && <Button type="submit" variant="brand" disabled={uploadingDeck}>{uploadingDeck ? "Uploading…" : "Upload"}</Button>}
          </form>
        )}
        {!readOnly && (
          <p className="text-xs text-muted">
            Use the <a className="font-semibold text-brand underline" href="/documents/GIC-2026-Pitch-Deck-Template.pptx">official 2026 template</a>.
          </p>
        )}
      </section>

      {/* 3 — pitch video: a link OR a file, in one place. The link is saved with "Save details" / Submit (form="idea-details"). */}
      <section className="space-y-4 rounded-card border border-line p-5">
        <div>
          <h3 className="font-display text-xl font-bold">Pitch video</h3>
          <p className="mt-1 text-sm text-muted">Add a link <strong className="text-ink">or</strong> upload a video file. Either one is enough.</p>
        </div>

        {readOnly ? (
          idea.pitchVideoLink ? (
            <p className="break-all text-sm"><a href={idea.pitchVideoLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">{idea.pitchVideoLink}</a></p>
          ) : null
        ) : (
          <TextField
            key={`v-${idea.pitchVideoLink}`} form="idea-details" label="Video link" name="pitchVideoLink" type="url" inputMode="url"
            placeholder="https://youtube.com/… or Drive link" maxLength={255} defaultValue={idea.pitchVideoLink ?? ""} error={errors.pitchVideoLink}
            hint="Saved when you press Save details or Submit."
          />
        )}

        {(app.videoUploadAvailable || app.video) && (
          <>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted" aria-hidden>
              <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
            </div>
            {app.video && (
              <p className="text-sm">
                <a href={app.video.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">{app.video.filename}</a>{" "}
                <span className="text-muted">({kb(app.video.size)})</span>
              </p>
            )}
            {!readOnly && app.videoUploadAvailable && (
              <form ref={videoForm} onSubmit={onVideoSubmit} className="flex flex-wrap items-end gap-3">
                <FileField
                  label={app.video ? "Replace video file" : "Upload a video file"} name="pitchVideo" accept="video/mp4,video/quicktime,video/webm,.mp4,.m4v,.mov,.webm" className="min-w-64 flex-1"
                  hint={`MP4, MOV or WebM, up to ${MAX_VIDEO_BYTES / 1024 / 1024} MB.`}
                  onChange={(e) => { setPendingVideo(!!e.currentTarget.files?.length); setBlocked(""); setVideoError(""); }}
                />
                {pendingVideo && <Button type="submit" variant="brand" disabled={uploadingVideo}>{uploadingVideo ? `Uploading… ${videoProgress}%` : "Upload"}</Button>}
                {uploadingVideo && <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={videoProgress} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-brand transition-[width]" style={{ width: `${videoProgress}%` }} /></div>}
              </form>
            )}
            {!readOnly && app.video && (
              <form action={removeAction}><Button type="submit" variant="ghost" disabled={removing}>{removing ? "Removing…" : "Remove video file"}</Button></form>
            )}
          </>
        )}
      </section>

      {/* submit */}
      {!readOnly && (
        <section className={`space-y-3 rounded-card p-5 ${submitted ? "bg-mint-soft" : "bg-cream-soft"}`}>
          <h3 className="font-display text-xl font-bold">Submit your idea</h3>
          {submitted ? (
            <p className="text-sm">
              <strong className="text-brand">Submitted ✓</strong> on {fmt(app.submittedAt!)}. You can still change anything above until the deadline: just save or upload again, nothing needs re-submitting.
            </p>
          ) : (
            <p className="text-sm text-muted">
              {missing.length ? <>Still needed: <strong className="text-ink">{missing.join(", ")}</strong>.</> : "Everything is in. Submit when you're ready."}
            </p>
          )}
          {!submitted && (
            <Button type="submit" form="idea-details" name="intent" value="submit" disabled={submitting || missing.length > 0}>
              {submitting ? "Submitting…" : "Submit idea"}
            </Button>
          )}
        </section>
      )}

      {/* Step 4 of the journey, and the last: pay. Offered to the people who can edit; open once the idea is submitted. */}
      {app.viewerRole !== "member" && (
        <section className={`space-y-3 rounded-card border p-5 ${paid ? "border-brand bg-mint-soft" : "border-line"}`}>
          <h3 className="font-display text-xl font-bold">Step 4: pay the registration fee</h3>
          {paid ? (
            <p className="text-sm"><strong className="text-brand">Payment confirmed ✓</strong> Your entry is complete. You can still edit your idea until the deadline.</p>
          ) : (
            <>
              <p className="text-sm text-muted">
                {canPay
                  ? <>Pay <strong className="text-ink">₹{fee.toLocaleString("en-IN")}</strong> per team on GITAM GEvents to confirm your entry. Use the team Lead&apos;s email there so we can match your payment automatically.</>
                  : <>Submit your idea first, then come back here to pay <strong className="text-ink">₹{fee.toLocaleString("en-IN")}</strong> per team. Your entry is confirmed once the payment goes through.</>}
              </p>
              {canPay && payUrl ? (
                <a href={payUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#f0c451]">Pay ₹{fee.toLocaleString("en-IN")} on GEvents ↗</a>
              ) : (
                <button type="button" disabled className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink opacity-50">Pay on GEvents</button>
              )}
              {canPay && <p className="text-xs text-muted">After paying you&apos;re brought back here. If this page still says pending, it updates within a minute.</p>}
            </>
          )}
        </section>
      )}
    </div>
  );
}
