# Calliope — The Crooked Moon campaign site

React + TypeScript (Vite) SPA with Vercel serverless functions in `api/` (Upstash Redis). Deployed on Vercel from `main`.

- Routes: `/thecrookedmoon` (campaign), `/thecrookedmoon/apply` (registration), `/thecrookedmoon/admin` (CMS), `/thecrookedmoon/activities/crossword`.
- Design handoffs from Claude Design live in `design/` (specs + `reference/` prototypes). Import a new handoff with `npm run design:import` (reads newest `~/Downloads/DnD*.zip`). Treat `design/` as source of truth for look and behaviour; don't hand-edit it, it gets overwritten on import.

## Always test end to end after any change

Every change, however small, gets tested end to end twice before it is called done: locally, then on the live deploy. Do not report a change as finished until both pass. If a step can't be run, say so explicitly instead of implying it passed.

### 1. Locally, before committing
1. `npx tsc -b`, `npm run lint`, `npm run build` — all must pass.
2. Run the app and exercise the changed flow in a real browser (Playwright is available via `npx playwright`), plus a quick smoke pass over the other routes listed above.
   - `npm run dev` serves the SPA only; `/api/*` is not served by Vite. To test API-backed flows, run `vercel dev` (needs the Vercel CLI and `.env.local`) or mock the API responses in Playwright.
3. Check the states the change touches, not just the happy path: loading, empty, error/failed fetch, mobile width (~375px) and desktop, reduced motion where animation is involved.
4. Check the browser console for errors.

### 2. Live, after pushing
1. Wait for the Vercel deploy of the pushed commit to finish.
2. Repeat the end-to-end check against the live URL: the changed flow plus the smoke pass over all routes, including real `/api/*` calls.
3. If anything fails live, report it immediately and fix it; don't leave a broken deploy on `main`.

Live URL: https://www.chocobie.site/thecrookedmoon

Testing reduces risk; it doesn't prove zero bugs. Report exactly what was tested, how, and anything not covered.
