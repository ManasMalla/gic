import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { IdeaForm } from "@/components/portal/idea-form";
import { getSession } from "@/lib/auth/session";
import { fetchMyApplication } from "@/lib/backend";

export const metadata: Metadata = { title: "Team portal" };

export default function PortalPage() {
  return (
    <>
      <section className="bg-forest py-12 text-white sm:py-16">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-mint">Team portal · Step 4 of 4: submit your idea</p>
          <Suspense fallback={<h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Loading…</h1>}>
            <Heading />
          </Suspense>
        </Container>
      </section>
      <section className="py-12 sm:py-16">
        <Container>
          <Suspense fallback={<p className="text-center text-muted">Loading your application…</p>}>
            <Body />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function load() {
  const user = await getSession();
  if (!user) redirect("/signin?next=/portal");
  const app = await fetchMyApplication(user.email);
  if (!app) redirect("/register");
  if (app.status !== "paid") redirect("/register/payment"); // the portal opens only after payment is confirmed
  return { user, app };
}

async function Heading() {
  const { app } = await load();
  return <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{app.team.teamName}</h1>;
}

async function Body() {
  const { user, app } = await load();
  // Pinned to IST: the server renders in UTC, and a deadline must read the same for everyone.
  const member = app.viewerRole === "member";
  const deadline = new Date(app.ideaEditDeadline).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" }) + " IST";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        <h2 className="font-display text-3xl font-bold">Your idea</h2>
        <p className="mt-2 text-muted">
          {member ? "Your team's submission, as it stands." : <>Choose your theme and tell us about your idea. You can edit everything — including your deck — as often as you like
          until <strong className="text-ink">{deadline}</strong>.</>}
        </p>
        {member && (
          <p role="status" className="mt-5 rounded-xl bg-mint-soft p-4 text-sm font-medium text-brand">
            You&apos;re viewing this team as a member. The idea is managed by <strong>{app.ownerEmail}</strong>, the account that registered the team, so it&apos;s read-only here.
          </p>
        )}
        {!member && !app.canEditIdea && (
          <p role="status" className="mt-5 rounded-xl bg-cream-soft p-4 text-sm font-medium">
            The editing deadline has passed. Your submission is shown below as it was locked.
          </p>
        )}
        <div className="mt-8">
          <IdeaForm initialApp={app} />
        </div>
      </div>

      <aside className="space-y-4 self-start">
        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Registration</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1 text-sm font-semibold text-brand"><span aria-hidden>✓</span> Payment confirmed</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-muted">Reference</dt><dd className="font-mono font-bold text-brand">{app.reference}</dd></div>
            <div><dt className="text-muted">Track</dt><dd className="font-semibold capitalize">{app.track}</dd></div>
            <div><dt className="text-muted">Institution</dt><dd className="font-semibold">{app.team.institution}</dd></div>
            <div><dt className="text-muted">Signed in as{member ? " (team member)" : ""}</dt><dd className="break-all font-semibold">{user.email}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">
            Need to change team members or details? Email <a className="font-semibold text-brand underline" href="mailto:gic@gitam.edu">gic@gitam.edu</a> with your reference.
          </p>
        </div>
        {app.members.length > 0 && (
          <div className="rounded-card border border-line bg-white p-6 text-sm shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Team</p>
            <ul className="mt-3 space-y-2">
              {app.members.map((m) => (
                <li key={m.email}><span className="font-semibold">{m.name || m.email}</span> <span className="text-muted">· {m.role}</span><div className="break-all text-xs text-muted">{m.email}</div></li>
              ))}
            </ul>
          </div>
        )}
        <div className={`rounded-card p-6 text-sm ${app.ideaComplete ? "bg-mint-soft" : "bg-cream-soft"}`}>
          <p className="font-display text-lg font-bold">{app.ideaComplete ? "Idea submitted ✓" : "Idea not submitted yet"}</p>
          <p className="mt-1 text-muted">
            {member ? (app.ideaComplete ? "The team has submitted everything." : "The team hasn't finished the submission yet.") : app.ideaComplete ? "You're all set. Edit any time before the deadline." : "Complete every field and upload your deck to submit."}
          </p>
        </div>
      </aside>
    </div>
  );
}
