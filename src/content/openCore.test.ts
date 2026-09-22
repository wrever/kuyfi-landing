import { describe, expect, it } from 'vitest'
import { site } from '../config/site'
import { openCore } from './openCore'

// Excludes the kicker: like every section's kicker, it carries a bracketed section number.
const allText = [
  openCore.heading,
  openCore.intro,
  openCore.free.kicker,
  openCore.free.title,
  ...openCore.free.items,
  openCore.free.cta,
  openCore.planned.kicker,
  openCore.planned.title,
  ...openCore.planned.items,
  openCore.planned.note,
  openCore.planned.cta,
  openCore.closing,
].join(' ')

describe('Open Core: label and destinations', () => {
  it('uses the agreed label and heading', () => {
    expect(openCore.kicker).toBe('[ 08 · OPEN CORE ]')
    expect(openCore.heading).toBe('Free at the core. Sustainable at scale.')
  })

  it('sends "View on GitHub" to the real repository', () => {
    expect(openCore.free.cta).toBe('View on GitHub')
    expect(openCore.free.href).toBe(site.githubUrl)
  })

  it('sends "Get product updates" to the Updates section on this same page', () => {
    expect(openCore.planned.cta).toBe('Get product updates')
    expect(openCore.planned.href).toBe('#updates')
  })
})

describe('Open Core: free forever is what already ships', () => {
  it('lists only features that exist today, elsewhere on this same site', () => {
    const text = openCore.free.items.join(' ')
    expect(text).toMatch(/OSINT Scanner/)
    expect(text).toMatch(/Chaos Monkey/)
    expect(text).toMatch(/terminal/i)
    expect(text).toMatch(/GitHub/)
    expect(text).toMatch(/MIT license/)
  })
})

describe('Open Core: the planned layer never claims to exist yet', () => {
  it('is explicitly a set of directions, not current features', () => {
    expect(openCore.planned.note).toBe(
      'These are directions under consideration, not features available today.',
    )
  })

  it("never repeats the free tier's own local JSON/PDF export as if it were a new, paid feature", () => {
    for (const item of openCore.planned.items) {
      expect(item).not.toMatch(/\bJSON\b/)
      expect(item).not.toMatch(/\bPDF\b/)
    }
  })

  it('never states availability, a price or a date for the planned layer', () => {
    expect(allText).not.toMatch(/\$|per month|\/mo\b|available now|ships (on|in)/i)
    expect(allText).not.toMatch(/\d/)
  })

  it('hedges the closing line: a possibility, not a commitment', () => {
    expect(openCore.closing).toMatch(/would help fund/)
    expect(openCore.closing).toMatch(/is a commitment or a timeline/)
  })
})

describe('Open Core: editorial guardrails specific to this section', () => {
  it('never uses waitlist language: Kuyfi is already public and installable', () => {
    expect(allText).not.toMatch(
      /waitlist|early access|coming soon|be first|join (before|the)|before launch|launch(es|ing)? soon/i,
    )
  })

  it('avoids startup buzzwords for the planned layer', () => {
    expect(allText).not.toMatch(
      /game-changing|next-generation|disrupt|10x|rocket ?ship|hustle|grind|unicorn/i,
    )
  })

  it('has no em dash as a writing device', () => {
    expect(allText).not.toMatch(/[—―]/)
  })
})
