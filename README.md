# GITAM Innovation Challenge — website

Next.js (App Router, TypeScript, Tailwind v4). Fully self-hosted: no runtime
requests to `gic.gitam.edu`, `cdn.gitam.edu`, or any third-party CDN.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
npm run media:manifest   # re-run after adding/removing images in public/media
```

> Next.js 16 with `cacheComponents` on. Read `node_modules/next/dist/docs/` before
> relying on older Next knowledge (see `AGENTS.md`).

## Where things live

```
src/
  app/                    routes (all statically prerendered)
    page.tsx              home — composes sections
    sponsors/             partnership page (from the 2026 brochure)
    register/             registration wizard + server action
  components/
    ui/                   Container, Section/SectionHeading, Button, RichText
    layout/               header, footer, mobile nav
    sections/             one file per homepage section
    sponsors/             sponsor-page sections
    register/             wizard + form fields
  content/                ALL copy & data as typed modules  <- edit text here
    site.ts  tracks.ts  timeline.ts  themes.ts  process.ts  prizes.ts
    people.ts  partners.ts  experience.ts  faq.ts  sponsorship.ts
    media.generated.json  (generated: image sizes)
  lib/
    media.ts              media("/media/x.webp") -> { src, width, height }
    gevents.ts            payment hand-off to GEvents (single place to change)
    registration/         zod schema + repository (storage boundary)
  fonts/                  Forma DJR Display (self-hosted via next/font/local)
public/
  media/                  WebP images (gallery capped at 1920px)
  videos/                 H.264 720p MP4 + WebP posters
  documents/              brochures, results, pitch-deck template
```

Design tokens (colours, fonts, radii) are in `src/app/globals.css` under `@theme`.

## Registration flow

`/register` is a 4-step wizard (team → idea → members → review). Validation uses
one zod schema (`lib/registration/schema.ts`) on both client and server.
On submit, the server action (`app/register/actions.ts`) validates, stores the
application via `RegistrationRepository`, and returns an application reference.
The user then continues to GEvents to pay.

**Not production-ready yet — decisions needed:**

1. `lib/registration/repository.ts` ships a **local-disk** adapter (`.data/`,
   git-ignored). Replace with a real DB + object storage (e.g. Postgres + S3/R2).
2. `lib/gevents.ts` sends people to the GEvents registration page; it accepts no
   prefilled data, so we show our reference to quote. Agree a callback/deep-link
   contract with the GEvents team to mark applications as paid automatically.
3. No accounts/auth yet (profile, project updates, submissions). Planned as an
   `(app)` route group behind auth, separate from the public marketing routes.
4. No captcha / rate-limiting on the form — add before launch.

## Source of truth for content

Competition details (dates, fees, prizes, FAQ) follow the live gic.gitam.edu
site. `content/sponsorship.ts` follows the 2026 partnership brochure, which
differs in places (see git history / handoff notes).
