# kuyfi-landing

Official landing page for [Kuyfi](https://github.com/alex0tico/kuyfi) — native black-box security
for Soroban.

**Status:** early build. Foundation, visual tokens, the scroll-driven hero, the core narrative
(What Kuyfi does, Why black-box, Pipeline, OSINT Scanner, Chaos Monkey), a static page atmosphere,
the real CLI terminal, the Evidence section (three records built from `content/evidence.ts`),
Install, Open Source with the v0.1.0 release status (`content/releaseStatus.ts`), the Updates
subscription (`api/subscribe.ts`), the closing and the footer. Not deployed.

`Kuyfi_landing_v2` (a sibling folder in the workspace) is the visual reference prototype and is
left untouched.

## Stack

React 19 · Vite · TypeScript · Motion for React · CSS Modules + global tokens · ESLint
(typescript-eslint) · Prettier · Vitest.

## Scripts

| Command                | What it does                             |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Local dev server                         |
| `npm run build`        | Type-check (`tsc -b`) + production build |
| `npm run preview`      | Serve the production build locally       |
| `npm run lint`         | ESLint                                   |
| `npm run format`       | Prettier (write)                         |
| `npm run format:check` | Prettier (check only)                    |
| `npm test`             | Vitest (single run)                      |

## Testing on another device

```bash
npm run dev -- --host
```

Vite prints a `Network` URL (for example `http://192.168.x.x:5173/`). Open it from a phone on the same
local network to check touch scrolling, the hero dive and the portrait layouts on real hardware. This
workflow has been validated manually.

## Updates subscription (local development)

The Updates form posts to `/api/subscribe`, a Vercel function in `api/subscribe.ts` that calls the
mailing provider (Buttondown) with a key that exists only on the server.

- **Variable:** `BUTTONDOWN_API_KEY`. Copy `.env.example` to `.env.local` and fill it in. Real env files
  are gitignored; never commit a value, and never give it a `VITE_` prefix (that would ship it to the
  browser).
- **Plain `npm run dev` does not run the function.** The page and the form still work, but submitting
  shows the error message, because there is no server behind `/api/subscribe`. There is deliberately
  no demo mode that pretends a subscription succeeded.
- **To try the real flow locally:** install the Vercel CLI and run `vercel dev` (it serves the site and
  the function together, with `.env.local`). Submitting creates a real subscriber and sends a real
  confirmation email, so only do it with an address you own, on purpose.
- **Tests never subscribe anyone.** `tests/api/subscribe.test.ts` answers as the provider with a mock
  and replaces the global `fetch` with one that fails if used.

## Layout

```
src/
  components/   shared UI building blocks
  sections/     page sections (Hero, narrative/)
  hooks/        reusable hooks
  lib/          pure logic (heroTimeline, tested)
  config/       site-wide constants (links, version, install command)
  content/      typed content sources of truth (siteCopy, interfaceExamples, evidence,
                terminalSession: the real CLI transcript, with its provenance;
                evidenceRecords: facts from evidence.ts joined with the Evidence copy)
  styles/       design tokens, reset, globals
  assets/       bundled media (hashed by Vite)
api/            Vercel functions (only subscribe.ts: nothing else in this folder is deployed as an endpoint)
tests/          tests that read the repository or run the api handler
public/         static files served as-is
```
