import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The mailing provider's key must live only on the server. These tests read the repository as text
 * and fail if it could reach the browser, be committed, or be created by a test run.
 *
 * The property that matters is "a real env file must never enter the repository, its history or the
 * client bundle" — not "a developer may never have a local env file". So the checks here ask git
 * directly (what's tracked, what's ignored, what was ever committed), rather than walking the disk,
 * which would also trip over an untracked, correctly-ignored `.env.local` kept around for manual
 * testing.
 */

const root = process.cwd()
const at = (...parts: string[]) => join(root, ...parts)
const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })

/** Every path git tracks, forward-slashed regardless of OS. */
function gitLsFiles(): string[] {
  return git('ls-files').split('\n').filter(Boolean)
}

/** Whether git's own rules (.gitignore and friends) would ignore this path. Doesn't require the
 *  path to exist, and never reads its contents. */
function isGitIgnored(pathspec: string): boolean {
  try {
    git('check-ignore', '-q', pathspec)
    return true
  } catch (error) {
    // `git check-ignore` exits 1 for "not ignored" (a normal outcome here); anything else is real.
    if (error && typeof error === 'object' && 'status' in error && error.status === 1) return false
    throw error
  }
}

/** Paths ever added under this pathspec in any branch's history, across the whole repository. */
function everCommitted(pathspec: string): string[] {
  return git('log', '--all', '--name-only', '--pretty=format:', '--', pathspec)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function walk(dir: string, skip: readonly string[] = []): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (skip.includes(name)) return []
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path, skip) : [path]
  })
}

const clientFiles = [
  ...walk(at('src')).filter((file) => !/\.test\.ts$/.test(file)),
  at('index.html'),
  at('vite.config.ts'),
]
// Normalized to `\n` so line-based assertions below don't depend on the checkout's line endings
// (Windows' autocrlf turns committed LF files into CRLF on disk; macOS/Linux keep LF).
const read = (file: string) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n')

describe('the provider key stays on the server', () => {
  it('is never named in browser code, in index.html or in the Vite config', () => {
    for (const file of clientFiles) {
      const text = read(file)
      const where = relative(root, file)
      expect(text, where).not.toMatch(/buttondown/i)
      expect(text, where).not.toMatch(/api\.buttondown/i)
    }
  })

  it('is never exposed through import.meta.env, VITE_ variables or Vite define', () => {
    for (const file of clientFiles) {
      const text = read(file)
      const where = relative(root, file)
      expect(text, where).not.toMatch(/import\.meta\.env\.[A-Z_]*(KEY|TOKEN|SECRET)/)
      expect(text, where).not.toMatch(/VITE_[A-Z_]*(KEY|TOKEN|SECRET)/)
    }
    expect(read(at('vite.config.ts'))).not.toMatch(/\bdefine\b|loadEnv|envPrefix/)
  })

  it('is read by the function from the environment and never written into it', () => {
    const api = read(at('api', 'subscribe.ts'))
    expect(api).toMatch(/process\.env\.BUTTONDOWN_API_KEY/)
    expect(api).not.toMatch(/Token [A-Za-z0-9]{16,}/)
    expect(api).not.toMatch(/\b[0-9a-f]{32,}\b/i)
  })

  it('has an .env.example with the variable name and no value', () => {
    const example = read(at('.env.example'))
    expect(example).toMatch(/^BUTTONDOWN_API_KEY=$/m)
    const assignments = example.split('\n').filter((line) => /^[A-Z_]+=/.test(line))
    expect(assignments).toEqual(['BUTTONDOWN_API_KEY='])
  })

  it('ignores every real env file, with .env.example as the only tracked exception', () => {
    // Functional check (does git actually ignore it?), not a check of .gitignore's exact wording.
    expect(isGitIgnored('.env')).toBe(true)
    expect(isGitIgnored('.env.local')).toBe(true)
    expect(isGitIgnored('.env.production')).toBe(true) // stands in for the whole .env.* family
    expect(isGitIgnored('.vercel')).toBe(true)
    expect(isGitIgnored('.env.example')).toBe(false)
  })

  it('tracks .env.example only: no real env file is committed, however many exist untracked', () => {
    // A correctly-ignored .env.local kept around for local Buttondown testing must not fail this:
    // the property that matters is nothing real ever enters git, not that none exists on disk.
    const trackedEnvFiles = gitLsFiles().filter((file) => /(^|\/)\.env(\..+)?$/.test(file))
    expect(trackedEnvFiles).toEqual(['.env.example'])
  })

  it('no real env file was ever committed to git history, on any branch', () => {
    for (const pathspec of ['.env', '.env.local', '.env.*']) {
      const everReal = everCommitted(pathspec).filter((file) => file !== '.env.example')
      expect(everReal, pathspec).toEqual([])
    }
  })
})

describe('the function directory', () => {
  it('holds only the subscription function: anything else there would be deployed as its own endpoint', () => {
    // Vercel does not route entries whose name starts with `_` (e.g. api/_lib), so shared,
    // non-endpoint code can live there without becoming a Function of its own.
    const routable = readdirSync(at('api')).filter((name) => !name.startsWith('_'))
    expect(routable).toEqual(['subscribe.ts'])
  })
})

describe('local development is documented, and no fake success path exists', () => {
  it('README explains `vercel dev` and the environment variable', () => {
    const readme = read(at('README.md'))
    expect(readme).toMatch(/vercel dev/)
    expect(readme).toMatch(/BUTTONDOWN_API_KEY/)
    expect(readme).toMatch(/\.env\.local/)
  })

  it('the browser code has no demo or mock subscription path', () => {
    for (const file of clientFiles.filter((f) => /subscribe/i.test(f))) {
      expect(read(file), relative(root, file)).not.toMatch(/mock|demo mode|fake success|simulate/i)
    }
  })

  it('the repository can be searched: the api file exists where Vercel looks for it', () => {
    expect(existsSync(at('api', 'subscribe.ts'))).toBe(true)
  })
})
