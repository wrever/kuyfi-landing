import { describe, expect, it } from 'vitest'
import { siteCopy } from './siteCopy'

/** Every string in the copy tree, with its dotted path. */
function collect(value: unknown, path = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]]
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      collect(child, path ? `${path}.${key}` : key),
    )
  }
  return []
}

const entries = collect(siteCopy)

/** Strings that legitimately contain digits (version, command, requirement). */
const MAY_CONTAIN_DIGITS = new Set(['hero.eyebrow', 'install.command', 'install.requirement'])

describe('siteCopy editorial rules', () => {
  it('has copy to check', () => {
    expect(entries.length).toBeGreaterThan(10)
  })

  it('uses no em dash (or horizontal bar) as a writing device', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(/[—―]/)
    }
  })

  it('uses no emojis', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })

  it('avoids landing-page buzzwords', () => {
    const banned =
      /\b(revolutionary|game-changing|next-generation|built for the future|unlock\w*|supercharge\w*|seamless\w*|powerful yet simple|redefin\w* security)\b/i
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(banned)
    }
  })

  it('avoids artificial sentence fragments', () => {
    const fragments = /(^|[.!?]\s)(No source|No assumptions|Full security)\./
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(fragments)
    }
  })

  it('never concludes that a contract is secure, safe, fully audited or vulnerability-free', () => {
    const banned =
      /\b(secure contracts?|0 vulnerabilities|no vulnerabilities|fully audited|guaranteed?|safe)\b/i
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(banned)
    }
  })

  it('does not surface evidence numbers before the Evidence section is designed', () => {
    for (const [path, text] of entries) {
      if (!MAY_CONTAIN_DIGITS.has(path)) expect(text, path).not.toMatch(/\d/)
    }
    expect(siteCopy).not.toHaveProperty('evidence')
  })

  it('is tidy: no doubled or surrounding whitespace', () => {
    for (const [path, text] of entries) {
      expect(text, path).toBe(text.trim())
      expect(text, path).not.toMatch(/\s{2,}/)
    }
  })
})

describe('siteCopy facts', () => {
  it('keeps the hero headline and the slogan agreed in the brief', () => {
    expect(siteCopy.hero.headline).toBe('Black-box security for Soroban.')
    expect(siteCopy.closing.line).toBe('Before the Breach.')
  })

  it('installs the real package and runs the real CLI', () => {
    expect(siteCopy.install.command).toBe('npm install -g @kuyfi/kuyfi')
    expect(siteCopy.install.then).toBe('kuyfi')
    expect(siteCopy.install.requirement).toBe('Node.js 20+')
  })
})
