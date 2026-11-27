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

In Phase A there is **no backend**: reports you submit are saved in the
browser's `localStorage` and confirmations are stored locally too.
Stats are always computed from the data file — never invented.

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
  page.tsx            # landing page
  explore/page.tsx    # map + list explorer
  reports/page.tsx    # all reports
  reports/[id]/page.tsx  # report details
  report/new/page.tsx # report form
components/
  MapView.tsx         # Leaflet map (dynamic, client-only)
  Navbar.tsx / Footer.tsx / ReportCard.tsx / Badges.tsx
  LanguageProvider.tsx
data/demo-reports.ts  # the 10 demo reports + stats/duplicate/nearby helpers
lib/i18n.ts           # BN/EN dictionary
lib/store.ts          # localStorage reports + confirmations
```

## Design system

- Primary: Deep Forest Green (`#14532d` family), Secondary: Midnight Navy
- Background: warm neutral white `#faf9f6`, Surface: pure white
- Text: deep charcoal `#1c2420`, secondary muted slate
- Semantic: red = critical/damage, orange = waterlogging, yellow = construction, blue = info/obstruction, green = resolved
- Fonts: Hind Siliguri (Bangla) + Inter (English) via Google Fonts

## Phase B (next)

- MongoDB + Mongoose models (`MONGODB_URI` in `.env.example`)
- Better Auth — registration, login, sessions, roles (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- Cloudinary image uploads (`CLOUDINARY_*`)
- API routes replacing `localStorage` persistence
- Server-side community verification (one action per account, not per browser)
- Passcode-protected admin review (approve / reject / status change)
- Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

See `.env.example` for the full list of placeholders — **no real secrets are in this repo**.

## Demo data

All 10 seeded reports have `isDemo: true` and show a visible **Demo** badge
in the UI. They are realistic Bangladeshi locations with realistic descriptions,
but they are sample data — do not present them as live reports.
