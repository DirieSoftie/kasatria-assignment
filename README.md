# Kasatria Software Developer Internship – Assignment

An interactive 3D visualization of 200 people from a Google Sheet, rendered in the style of the [three.js CSS3D periodic table](https://threejs.org/examples/#css3d_periodictable) demo. Google-authenticated, deployed on Vercel.

**Live demo:** https://kasatria.rayhanc.com

## Features

- **Google sign-in** via a Google Cloud OAuth client, gating the entire app through Clerk middleware
- **200 people** loaded from a published Google Sheet CSV, parsed server-side with a 1-hour ISR cache
- **Four layouts** with animated transitions:
  - Table (20 columns × 10 rows)
  - Sphere
  - Double Helix (two strands offset by π)
  - Grid (5 × 4 × 10)
- **Net-worth-based tile colors:** red under $100K, orange over $100K, green over $200K
- Trackball camera controls, hover highlight, smooth tweened transitions

## Tech stack

- **Next.js 15** (App Router, TypeScript, Turbopack)
- **React 19**
- **three.js** (`CSS3DRenderer` + `TrackballControls`)
- **@tweenjs/tween.js** for layout transitions
- **Clerk** for authentication (backed by custom Google OAuth credentials)
- **csv-parse** for server-side sheet parsing
- **Tailwind CSS 4**
- Deployed on **Vercel**

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Requires a `.env.local` with:

```
GOOGLE_SHEET_CSV_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
```

## Project structure

```
app/
  page.tsx                    Server component, fetches people, renders loader
  PeriodicTableLoader.tsx     Client bridge for dynamic({ ssr: false })
  PeriodicTable.tsx           Client component, three.js scene in useEffect
  layout.tsx                  Root layout, wraps app in ClerkProvider
  globals.css                 Tailwind + tile styles
  sign-in/[[...sign-in]]/     Clerk sign-in page
lib/
  people.ts                   Server-only CSV fetcher/parser
middleware.ts                 Clerk auth middleware
```

## Implementation notes

- Three.js work is confined to a single `useEffect` with full cleanup (RAF cancellation, listener removal, `TrackballControls` disposal, scene teardown) so React 19 StrictMode's dev double-mount doesn't leave orphaned renderers.
- Data fetching runs server-side, which keeps `GOOGLE_SHEET_CSV_URL` out of the client bundle and lets the CSV be parsed once per hour rather than on every request.
- The `PeriodicTableLoader` bridge exists because Next 15 requires `dynamic({ ssr: false })` to be called from a client component, while `page.tsx` needs to stay a server component to fetch data.
- Tile background is set inline (with random alpha), but border and glow use a CSS custom property (`--tile-color`) so `:hover` can override without losing to inline-style specificity.
