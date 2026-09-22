import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The mailing provider's key must live only on the server. These tests read the repository as text
 * and fail if it could reach the browser, be committed, or be created by a test run.
 */

const root = process.cwd()
const at = (...parts: string[]) => join(root, ...parts)

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
const read = (file: string) => readFileSync(file, 'utf8')

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

  it('ignores real env files and keeps only the example', () => {
    const ignore = read(at('.gitignore')).split('\n')
    expect(ignore).toContain('.env')
    expect(ignore).toContain('.env.*')
    expect(ignore).toContain('!.env.example')
    expect(ignore).toContain('.vercel')
  })

  it('has no real env file in the repository tree', () => {
    const files = walk(root, ['node_modules', '.git', 'dist', '.vercel']).map((file) =>
      relative(root, file),
    )
    expect(files.filter((file) => /(^|[\\/])\.env(\..+)?$/.test(file))).toEqual(['.env.example'])
  })
})

describe('the function directory', () => {
  it('holds only the subscription function: test files there would be deployed as endpoints', () => {
    expect(readdirSync(at('api'))).toEqual(['subscribe.ts'])
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
