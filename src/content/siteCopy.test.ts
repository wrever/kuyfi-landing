import { describe, expect, it } from 'vitest'
import { osintExample } from './interfaceExamples'
import { siteCopy } from './siteCopy'

/** Every string in a content tree, with its dotted path. */
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
const exampleEntries = collect(osintExample)

/** Strings that legitimately contain digits (version, command, requirement, numbered kickers). */
const MAY_CONTAIN_DIGITS = /^(hero\.eyebrow|install\.command|install\.requirement|.*\.kicker)$/

const EM_DASH = /[—―]/
const EMOJI = /\p{Extended_Pictographic}/u
const BUZZWORDS =
  /\b(revolutionary|game-changing|next-generation|built for the future|unlock\w*|supercharge\w*|seamless\w*|powerful yet simple|redefin\w* security)\b/i
const FRAGMENTS = /(^|[.!?]\s)(No source|No assumptions|Full security|Full control)\./
const OVERCLAIMS =
  /\b(secure contracts?|0 vulnerabilities|no vulnerabilities|vulnerability-free|fully audited|guaranteed?|safe|bulletproof|unhackable)\b/i
const COMPETITORS =
  /\b(certora|certik|otter-?sec|halborn|trail of bits|slither|mythril|echidna|veridise|coinspect|quantstamp|openzeppelin)\b/i
const SUPERIORITY =
  /\b(better than|superior|outperforms?|more (accurate|thorough|complete) than|instead of (a |an )?(source|manual)?\s?audit)\b/i

describe('siteCopy editorial rules', () => {
  it('has copy to check', () => {
    expect(entries.length).toBeGreaterThan(10)
  })

  it('uses no em dash (or horizontal bar) as a writing device', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(EM_DASH)
    }
  })

  it('uses no emojis', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(EMOJI)
    }
  })

  it('avoids landing-page buzzwords', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(BUZZWORDS)
    }
  })

  it('avoids artificial sentence fragments', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(FRAGMENTS)
    }
  })

  it('never concludes that a contract is secure, safe, fully audited or vulnerability-free', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(OVERCLAIMS)
    }
  })

  it('does not name competing tools or firms', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(COMPETITORS)
    }
  })

  it('does not claim black-box testing is better than source-level auditing', () => {
    for (const [path, text] of entries) {
      expect(text, path).not.toMatch(SUPERIORITY)
    }
  })

  it('does not surface evidence numbers before the Evidence section is designed', () => {
    for (const [path, text] of entries) {
      if (!MAY_CONTAIN_DIGITS.test(path)) expect(text, path).not.toMatch(/\d/)
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

describe('interface examples', () => {
  it('follow the same editorial rules', () => {
    expect(exampleEntries.length).toBeGreaterThan(5)
    for (const [path, text] of exampleEntries) {
      expect(text, path).not.toMatch(EM_DASH)
      expect(text, path).not.toMatch(EMOJI)
      expect(text, path).not.toMatch(OVERCLAIMS)
    }
  })

  it('are always presented as examples, never as real output', () => {
    expect(siteCopy.ui.exampleTag).toBe('INTERFACE EXAMPLE')
    expect(siteCopy.osintScanner.panel.note).toMatch(/not the output of a real scan/i)
    expect(siteCopy.chaosMonkey.panel.note).toMatch(/^Illustrative/)
  })

  it('classify conservatively: an ambiguous result is a signal, not a vulnerability', () => {
    const { classificationRows, note } = siteCopy.chaosMonkey.panel
    const result = classificationRows.find((row) => row.key === 'CLASSIFIED AS')
    expect(result?.value).toBe('manual review signal')
    expect(result?.value).not.toMatch(/vulnerab/i)
    expect(note).toMatch(/not a confirmed vulnerability/i)
  })
})

describe('core narrative', () => {
  const narrative = [
    siteCopy.whatKuyfiDoes,
    siteCopy.whyBlackBox,
    siteCopy.howItWorks,
    siteCopy.osintScanner,
    siteCopy.chaosMonkey,
    siteCopy.terminal,
  ]

  it('gives every section a bracketed label and a heading', () => {
    for (const section of narrative) {
      expect(section.kicker).toMatch(/^\[ .+ \]$/)
      expect(section.heading.length).toBeGreaterThan(0)
    }
  })

  it('positions black-box testing as complementary to a source-level audit', () => {
    expect(siteCopy.whyBlackBox.note).toMatch(/does not replace a full source-level audit/)
  })

  it('keeps the distinction between a type-correct and a semantically valid input', () => {
    expect(siteCopy.chaosMonkey.emphasis).toMatch(/type-correct value is not necessarily/)
    expect(siteCopy.chaosMonkey.emphasis).toMatch(/instead of automatically turning every runtime/)
  })

  it('describes the pipeline in the agreed order', () => {
    expect(siteCopy.howItWorks.steps.map((step) => step.label)).toEqual([
      'Contract ID',
      'Fetch deployed WASM / specification',
      'Reconstruct attack surface',
      'Generate type-aware vectors',
      'Simulate and classify',
      'JSON / PDF report',
    ])
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
