# RASTA KEMON — রাস্তা কেমন

**"বের হওয়ার আগে জেনে নিন, আপনার সামনের রাস্তা কেমন।"**
**"Know Your Road Before You Go."**

Community-powered road intelligence platform for Bangladesh.
Bangla first, English second.

## What this is (Phase A)

Phase A is the **design + core experience** — a working Next.js app with:

- Landing page with a live Leaflet map preview, stats computed from demo data
- Explore page (`/explore`) — split-screen map + report list on desktop, full-width map + bottom sheet on mobile
- Report submission (`/report/new`) — form with map-click location picking, photo upload with preview, Bangla validation, duplicate warning (~150 m, same category)
- Report details (`/reports/[id]`) — status timeline, nearby reports, mini map, community confirmation ("আমিও দেখেছি")
- Reports list (`/reports`)
- Bangla / English language switcher (full UI dictionary in `lib/i18n.ts`)
- 10 clearly-labelled **Demo** reports in `data/demo-reports.ts` (Dhaka, Chattogram, Sylhet, Khulna)

In Phase A there was **no backend**: reports were saved in the browser's
`localStorage` and confirmations were stored locally too.
**Phase B replaces that with a real backend** (below) — the app now reads
and writes MongoDB through API routes, with the 10 demo reports as a
labelled fallback when the database is empty or unreachable.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
```

Requirements: Node.js 18+ (tested on Node 24), npm 10+.

## Project structure

```
app/
  layout.tsx          # fonts (Hind Siliguri + Inter), nav, footer
  page.tsx            # landing page (API stats + reports, demo fallback)
  explore/page.tsx    # map + list explorer
  reports/page.tsx    # all reports
  reports/[id]/page.tsx  # report details + community actions
  report/new/page.tsx # report form (auth required, API submit)
  login/page.tsx / register/page.tsx  # Better Auth pages
  dashboard/page.tsx  # personal dashboard (server-protected)
  admin/page.tsx      # admin panel (server-protected, admin role only)
  api/                # auth, reports, stats, upload, my/*, admin/*
components/
  MapView.tsx         # Leaflet map with marker clustering
  Navbar.tsx / Footer.tsx / ReportCard.tsx / Badges.tsx
  LanguageProvider.tsx / AuthForm.tsx
  DashboardClient.tsx / AdminClient.tsx
data/demo-reports.ts  # the 10 demo reports + stats/duplicate/nearby helpers
lib/
  mongodb.ts / auth.ts / auth-client.ts / server-auth.ts
  validation.ts (Zod) / serialize.ts / api.ts (client fetch layer)
  i18n.ts             # BN/EN dictionary
  store.ts            # date/number formatting helpers
models/               # Mongoose: Report, Confirmation, StatusEvent
scripts/seed.ts       # seed the 10 demo reports (npm run seed)
scripts/make-admin.ts # grant the admin role (npm run make-admin)
```

## Design system

- Primary: Deep Forest Green (`#14532d` family), Secondary: Midnight Navy
- Background: warm neutral white `#faf9f6`, Surface: pure white
- Text: deep charcoal `#1c2420`, secondary muted slate
- Semantic: red = critical/damage, orange = waterlogging, yellow = construction, blue = info/obstruction, green = resolved
- Fonts: Hind Siliguri (Bangla) + Inter (English) via Google Fonts

## Phase B (backend — done)

- **MongoDB + Mongoose** (`lib/mongodb.ts`, `models/Report.ts`,
  `models/Confirmation.ts`, `models/StatusEvent.ts`) — 2dsphere index for
  duplicate detection (~150 m, same category), unique index for one
  community action per user per report per kind.
- **Better Auth** (`lib/auth.ts`) — email/password sign-up, login, logout,
  sessions; `role` field (`user`/`admin`, default `user`, never settable
  from the client). Google OAuth wires up automatically when
  `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set.
- **API routes** (`app/api/...`) — reports (list/create with Zod validation
  + duplicate 409), report details + timeline + nearby, confirm
  (confirm/resolved/flag — never auto-changes official status), stats
  (computed from the DB), photo upload (Cloudinary, clear 503 when not
  configured), my reports/activity/profile, admin reports/status/clear-demo/stats.
- **Pages** — `/login`, `/register`, `/dashboard` (my reports, activity,
  profile settings), `/admin` (review queue, approve/reject, status
  changes with timeline events, flagged reports, delete-demo button).
  Both are server-protected (`/admin` = admin role only).
- **Marker clustering** on the Explore + landing maps; landing map now
  starts zoomed on Dhaka (zoom 11) instead of the wide Bangladesh view.

### Phase B setup (what Shuvo still needs to do)

1. **MongoDB Atlas** — create a free M0 cluster, a database user, and
   allow network access (`0.0.0.0/0` for Vercel). Copy the connection
   string into `MONGODB_URI`.
2. **Local dev** — copy `.env.example` to `.env.local` and fill the values,
   then:
   ```bash
   npm install
   npm run seed        # inserts the 10 demo reports (idempotent)
   npm run dev         # http://localhost:3000
   ```
3. **First admin** — register an account on the site, then:
   ```bash
   npm run make-admin -- you@example.com
   ```
   The `/admin` page only opens for that account afterwards.
4. **Vercel** — set the same env vars in Project → Settings →
   Environment Variables (Production + Preview), then redeploy.
   `BETTER_AUTH_URL` must be `https://rasta-kemon.vercel.app` in
   production. Without `MONGODB_URI` the site still renders with the
   labelled demo data, but login, reporting and admin answer 503.
5. **Google OAuth (optional)** — Google Cloud project → OAuth client
   (web app) → authorized redirect URI
   `https://rasta-kemon.vercel.app/api/auth/callback/google` → set
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
6. **Cloudinary (optional)** — account → set `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Until then, photo
   upload answers 503 and reports submit without a photo.

See `.env.example` for the full list of placeholders — **no real secrets
are in this repo**.

### What could NOT be tested in the VM

The VM cannot reach MongoDB Atlas (DNS/egress blocked), so the live
database, auth flow and Cloudinary upload were **not** tested here.
`npm run build` passes and the pages render; Shuvo must test login,
reporting, confirmation and admin on his PC / Vercel with real env vars.

## Demo data

All 10 seeded reports have `isDemo: true` and show a visible **Demo** badge
in the UI. They are realistic Bangladeshi locations with realistic descriptions,
but they are sample data — do not present them as live reports.
