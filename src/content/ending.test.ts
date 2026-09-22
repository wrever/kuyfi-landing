import { describe, expect, it } from 'vitest'
import { site } from '../config/site'
import { footer } from './footer'
import { releaseStatus } from './releaseStatus'
import { siteCopy } from './siteCopy'

const footerText = [
  footer.brand,
  footer.slogan,
  footer.product.label,
  ...footer.product.links.map((link) => link.name),
  footer.version.label,
  footer.version.release,
  footer.version.license,
  footer.network.label,
  footer.network.text,
  footer.copyright,
  footer.disclaimer,
].join(' ')

describe('closing', () => {
  it('is the line and nothing else: no paragraph, no second message', () => {
    expect(siteCopy.closing).toEqual({ line: 'Before the Breach.' })
    expect(siteCopy.closing.line).toBe(site.slogan)
  })
})

describe('footer links', () => {
  it('has exactly the three approved links, all real and pointing at the same places as the site', () => {
    expect(footer.product.links).toEqual([
      { name: 'GitHub', href: 'https://github.com/alex0tico/kuyfi' },
      { name: 'npm', href: 'https://www.npmjs.com/package/@kuyfi/kuyfi' },
      {
        name: 'Technical write-up',
        href: 'https://github.com/alex0tico/kuyfi/blob/main/docs/technical-writeup.md',
      },
    ])
    expect(footer.product.links.map((link) => link.href)).toEqual([
      releaseStatus.links.github,
      releaseStatus.links.npm,
      releaseStatus.links.writeup,
    ])
    for (const { href } of footer.product.links) expect(href).toMatch(/^https:\/\/[^#]+$/)
  })

  it('invents no social account, community or "coming soon" page', () => {
    expect(footerText).not.toMatch(
      /discord|twitter|linkedin|telegram|youtube|slack|\bx\.com\b|coming soon|deck|docs/i,
    )
  })
})

describe('footer facts', () => {
  it('states version 0.1.0 and the MIT license, from the same source as the rest of the site', () => {
    expect(footer.version.release).toBe('v0.1.0')
    expect(footer.version.release).toBe(`v${site.version}`)
    expect(footer.version.license).toBe('MIT license')
    expect(footer.version.license).toContain(site.license)
  })

  it('limits the network context to Stellar Testnet', () => {
    expect(footer.network.text).toBe('Evidence shown on this site uses Stellar Testnet.')
    expect(footerText).not.toMatch(/mainnet|production|enterprise|audited|guarantee/i)
  })

  it('keeps the approved disclaimer and adds no other legal claim', () => {
    expect(footer.disclaimer).toBe('Not affiliated with the Stellar Development Foundation.')
    expect(footer.copyright).toBe('© 2026 Kuyfi')
    expect(footerText).not.toMatch(/all rights reserved|trademark|patent|liab|warrant/i)
  })

  it('keeps the copyright sign out of the copy, where the editorial rules would read it as a pictograph', () => {
    expect(JSON.stringify(siteCopy.footer)).not.toContain('©')
  })
})
