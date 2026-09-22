# Release checklist

Working notes for turning this build into a deployed release. Nothing here has been done yet;
each section says explicitly what is still open.

## Real-device checklist (not yet performed)

Earlier phases were manually validated on a real phone (see the README's "Testing on another
device" section, which predates the sections below). Everything added since then is validated only
in headless Chrome at fixed widths, and still needs a pass on real hardware:

- [ ] Hero: autoplay starts without a tap, the video loops seamlessly, `frame-1`/`frame-2` (now
      AVIF/WebP) look identical to the previous PNG version.
- [ ] Touch scroll through the whole page feels normal (no jank, no scroll-jacking outside the hero).
- [ ] The keyhole dive: scrolling down plays it, scrolling back up reverses it correctly at any point.
- [ ] Behavior with the browser's dynamic address bar showing/hiding (iOS Safari, Chrome Android).
- [ ] Orientation change (portrait to landscape and back) partway through the hero and elsewhere.
- [ ] Pipeline section: the connector lines and stacked/table/grid layout at each breakpoint.
- [ ] Terminal: internal horizontal scroll on the transcript at narrow widths; "View launch screen"
      opens and closes with a tap.
- [ ] Evidence: the Copy button on a contract ID; the toast/status text is readable.
- [ ] Install: the Copy button on the install and launch commands.
- [ ] Open Core: the two panels stack cleanly; both CTAs are easy to tap.
- [ ] Updates: the email input does not trigger an unwanted zoom on focus (iOS); the Subscribe
      button and every message state (invalid, already subscribed, rate limited, error, success).
- [ ] A real Buttondown submission end to end (see the instructions elsewhere in this document).
- [ ] Footer links (GitHub, npm, technical write-up) open correctly from a phone browser.

## GitHub readiness

Proposed repository: `alex0tico/kuyfi-landing` (not created).

- [x] README describes the stack, scripts, layout, mobile testing (`--host`), and Buttondown local
      setup without a secret (`vercel dev`, `.env.local`, `BUTTONDOWN_API_KEY`).
- [x] `.gitignore` excludes `.env`, `.env.*` (keeping `!.env.example`) and `.vercel`.
- [x] `LICENSE` (MIT) added at the repository root, matching `package.json`'s `license` field and
      the site's own "MIT license" claim in Open Source and the footer.
- [ ] No remote configured yet (`git remote -v` is empty) and no push has been made. Creating the
      GitHub repository and adding the remote is a decision for the project owner, not done here.
- [ ] No CONTRIBUTING.md, issue templates or CI workflow exist yet. Not required to open the repo,
      worth adding if outside contributions are expected.

## Vercel readiness

The production site (`https://kuyfi.vercel.app/`) already exists as a Vercel project. The plan is to
reuse it, not create a second project. Before any deploy, recover from the Vercel dashboard:

- [ ] Project name and the Git repository currently connected to it (if any; the old landing's
      source is not in this repository).
- [ ] Root Directory setting (matters if the Vercel project expects the app at the repo root, and
      this repository is later connected as a monorepo subfolder or vice versa).
- [ ] Framework Preset (should detect Vite; confirm it is not still set for the previous stack).
- [ ] Build Command and Output Directory (expected: `npm run build` (or default) and `dist`, per
      `vite.config.ts`; confirm against whatever the dashboard currently has).
- [ ] Environment Variables already set there, in particular whether a Buttondown key already
      exists under some name (`BUTTONDOWN_API_KEY` or otherwise) from the previous integration.
- [ ] Domains attached to the project.
- [ ] Production branch (commonly `main`; confirm, since this repository's default branch is `main`).
- [ ] The current Production deployment: what it serves right now, and whether it is the old landing
      or something else.
- [ ] Function logs for the old `/api/subscribe`, to understand the previously observed
      `500 FUNCTION_INVOCATION_FAILED` on GET before this repository's version replaces it.

None of this has been read from the dashboard by this work; it requires dashboard access this
session does not have. No link, deploy or environment variable was created or changed.
