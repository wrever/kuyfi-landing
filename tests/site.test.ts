import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Whole-site guardrails: nothing dead, nothing left over from scaffolding. */

const root = process.cwd()

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const source = [...walk(join(root, 'src')), join(root, 'index.html')].filter(
  (file) => /\.(tsx?|css|html)$/.test(file) && !/\.test\.ts$/.test(file),
)
const read = (file: string) => readFileSync(file, 'utf8')

describe('no dead links', () => {
  it('has no href="#" and no empty href', () => {
    for (const file of source) {
      const text = read(file)
      const where = relative(root, file)
      expect(text, where).not.toMatch(/href\s*=\s*(["'])#?\1/)
      expect(text, where).not.toMatch(/href\s*=\s*\{\s*(["'`])#?\1\s*\}/)
    }
  })

  it('has no link to a community or social page that was not approved', () => {
    for (const file of source.filter((f) => /\.tsx?$/.test(f))) {
      expect(read(file), relative(root, file)).not.toMatch(
        /discord\.|twitter\.com|linkedin\.com|t\.me\/|youtube\.com|\bx\.com\//i,
      )
    }
  })
})

describe('no placeholders left', () => {
  it('has no "[ CONTENT CONTINUES ]" marker and no component for it', () => {
    for (const file of source) {
      const text = read(file)
      const where = relative(root, file)
      expect(text, where).not.toMatch(/CONTENT CONTINUES/i)
      expect(text, where).not.toMatch(/ContentPlaceholder/)
    }
    expect(existsSync(join(root, 'src', 'sections', 'ContentPlaceholder.tsx'))).toBe(false)
  })

  it('has no lorem ipsum, TODO or "coming soon" in the page source', () => {
    for (const file of source.filter((f) => /\.tsx?$/.test(f))) {
      expect(read(file), relative(root, file)).not.toMatch(/lorem ipsum|coming soon|TODO|FIXME/i)
    }
  })
})

describe('GitHub readiness: the MIT license the site claims actually exists', () => {
  it('has a root LICENSE file that is the MIT license, matching package.json and the site copy', () => {
    const license = read(join(root, 'LICENSE'))
    expect(license).toMatch(/^MIT License/)
    expect(license).toMatch(/Copyright \(c\) 2026 Kuyfi/)

    const pkg = JSON.parse(read(join(root, 'package.json'))) as { license?: string }
    expect(pkg.license).toBe('MIT')
  })
})
