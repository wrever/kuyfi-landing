# kuyfi-landing

Official landing page for [Kuyfi](https://github.com/alex0tico/kuyfi) — native black-box security
for Soroban.

**Status:** early build. Foundation, visual tokens, the scroll-driven hero, the core narrative
(What Kuyfi does, Why black-box, Pipeline, OSINT Scanner, Chaos Monkey), a static page atmosphere,
the real CLI terminal, the Evidence section (three records built from `content/evidence.ts`),
Install, Open Source with the v0.1.0 release status (`content/releaseStatus.ts`), Open Core, the
Updates subscription (`api/subscribe.ts`), the closing and a TUI-styled footer. Not deployed.

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
| `npm run docs:sync`    | Build sibling `kuyfi/docs-site` → `public/docs` |
| `npm run lint`         | ESLint                                   |
| `npm run format`       | Prettier (write)                         |
| `npm run format:check` | Prettier (check only)                    |
| `npm test`             | Vitest (single run)                      |

## Product docs (`/docs`)

The Astro docs live in [`alex0tico/kuyfi`](https://github.com/alex0tico/kuyfi) under `docs-site/` (branch `Docs`). This landing serves them at **https://kuyfi.vercel.app/docs** by shipping a static copy in `public/docs/`.

```bash
# From this repo, with ../kuyfi checked out on Docs:
npm run docs:sync
npm run build
npm run preview   # open http://localhost:4173/docs/
```

Then commit `public/docs/` (+ `vercel.json`) and push so Vercel redeploys the landing.

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

### Testing a real subscription

This creates a real subscriber and sends a real email. Use an address you own, on purpose; nothing
here should be run against a stranger's address or automated.

1. **Get the key.** Buttondown dashboard → **API** → **Keys**. Use the account's existing key if this
   is meant to land in the list the previous landing already built, rather than creating a new list.
2. **Set it locally.** `cp .env.example .env.local`, then set `BUTTONDOWN_API_KEY=<the key>` in
   `.env.local`. That file is gitignored; it never gets committed.
3. **Run the real function.** Install the Vercel CLI if needed (`npm i -g vercel`), then `vercel dev`
   from this directory. The first run may ask to link the folder to a Vercel project or scope; linking
   to a scratch/personal scope is fine for this test and does not affect the production project.
4. **Submit the form.** Open the URL `vercel dev` prints, scroll to Updates, enter your address, submit.
5. **Expect "check your email," not "subscribed."** Buttondown's default is double opt-in: a new
   subscriber starts `unactivated` until they confirm. The form's success message reflects that
   ("Almost done. Check your email to confirm your subscription."), not a claim that you are already on
   the list.
6. **Confirm.** Open the confirmation email from Buttondown and follow its link. That is what actually
   activates the subscription; nothing on this site's side does it.
7. **Submit the same address again.** This is the part actually worth testing: Buttondown's
   documented behavior is to reject a duplicate `email_address` (see `api/subscribe.ts`'s comment on
   `mapUpstream`), but its docs do not name the exact error code for that case, so this endpoint
   recognizes it by pattern (`already`, `exist`, `duplicate` in the code). Confirm the form now shows
   "This email address is already subscribed." If it instead shows the generic error message, the
   real error code differs from the pattern and `mapUpstream` needs that code added.
8. **If something fails**, check the terminal running `vercel dev` (or `vercel logs` for a deployed
   preview): `handleSubscribe` logs a short event name plus the upstream HTTP status and error code on
   any non-success path (`console.error('[subscribe]', event, details)`), and never logs the address,
   the request body or the key.

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
public/         static files served as-is: favicon, apple-touch-icon, the OG/Twitter card image
docs/           release-checklist.md: real-device, GitHub and Vercel readiness notes
```
