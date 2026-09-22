# kuyfi-landing

Official landing page for [Kuyfi](https://github.com/alex0tico/kuyfi) — native black-box security
for Soroban.

**Status:** early build. Foundation, visual tokens and the scroll-driven hero only. Not deployed.

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

## Layout

```
src/
  components/   shared UI building blocks
  sections/     page sections (Hero first)
  hooks/        reusable hooks
  lib/          pure logic (heroTimeline, tested)
  config/       site-wide constants (links, version, install command)
  content/      typed content sources of truth (no presentation)
  styles/       design tokens, reset, globals
  assets/       bundled media (hashed by Vite)
public/         static files served as-is
```
