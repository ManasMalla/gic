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

## The applicant journey

1. **Apply** → `/register`. Signed-out visitors see "Continue with Google".
2. **Sign in with Google** (OIDC, PKCE, ID-token verified). One Google account = one team application.
3. **Team details** (track, team, members). No idea fields yet. Saved as `awaiting_payment` with a reference like `GIC26-R4A2DK3Q-6`.
4. **Pay on GEvents** (`/register/payment`). We pass `?ref=…&track=…`; GEvents calls our webhook when paid.
5. **`/register/payment-status`** polls until the webhook lands (also shows failed / refunded).
6. **Portal** (`/portal`) opens only once paid: choose a theme, write the idea, upload the deck + video link.
   Editable any number of times until `IDEA_EDIT_DEADLINE` (default 31 Oct 2026 23:59 IST), then read-only.

New applications stop at `REGISTRATION_DEADLINE` (default 31 Oct 2026 23:59 IST). Both are backend env vars.

## Architecture

```
Browser ──▶ Next.js (Cloud Run) ──▶ Deno API (Cloud Run) ──▶ Cloud SQL (Postgres)
              │  session cookie           ▲  x-internal-token + verified x-user-email
              │  (signed JWT)             │
              └─ Google OIDC              └─ POST /api/webhooks/gevents/payment  ◀── GEvents (HMAC-signed)
```

- The **website verifies the user's Google identity** and forwards the verified email to the backend with a
  shared internal token. The backend scopes every query to that email (no user id ever comes from client input).
- **Payments** are matched by reference, then transaction id, then payer/owner email; anything uncertain goes to an
  admin review queue (`/api/admin/payments`). See `docs/gevents-payment-webhook.md`.
- Sessions are an HS256 JWT in an HTTP-only, SameSite=Lax cookie (7 days).

### Google sign-in setup (one-time, manual)

1. Cloud Console → **APIs & Services → OAuth consent screen** (External is fine; add scopes `openid email profile`).
2. **Credentials → Create credentials → OAuth client ID → Web application.**
   Authorised redirect URIs, one per origin you serve from:
   `https://gic.gitam.edu/api/auth/callback`, the `*.run.app` URL(s) `…/api/auth/callback`, `http://localhost:3000/api/auth/callback`.
3. `deploy/set-google-oauth.sh` stores the client id/secret (and generates the session key) in Secret Manager.
4. `APP_ALLOWED_ORIGINS` must list exactly the origins above (guards the redirect URI).
5. Local testing without Google: set `AUTH_DEV_LOGIN=true` (the compose file does). It is hard-disabled on Cloud Run.

### Running everything locally

```bash
docker compose up --build        # site http://localhost:8090 · API http://localhost:8091/api/health
cd backend && deno task test     # needs DATABASE_URL etc. (see backend/src/integration_test.ts)
```

### Deploying

`deploy/deploy.sh` (one-time infra + first deploy), `deploy/redeploy.sh backend|frontend [--no-build]`,
`deploy/load-balancer.sh` (static IP, HTTPS, `gic.gitam.edu` routing).

**Still open:** captcha/rate-limiting on the sign-in/registration endpoints; admin UI for the payment review queue;
confirmation emails; a way for teams to change member details after paying (currently via email to the organisers).

## Source of truth for content

Competition details (dates, fees, prizes, FAQ) follow the live gic.gitam.edu
site. `content/sponsorship.ts` follows the 2026 partnership brochure, which
differs in places (see git history / handoff notes).
