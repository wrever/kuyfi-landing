import { describe, expect, it } from 'vitest'
import { site } from '../config/site'
import { blockText, terminalSession } from './terminalSession'
import { footer } from './footer'
import { releaseStatus } from './releaseStatus'
import { siteCopy } from './siteCopy'

const footerText = [
  footer.brand,
  footer.wordmark,
  footer.slogan,
  footer.menuTag,
  Object.values(footer.statusBar).join(' '),
  footer.project.label,
  ...footer.project.links.flatMap((link) => [link.name, link.host]),
  footer.release.label,
  footer.release.version,
  footer.release.license,
  footer.network.label,
  footer.network.text,
  footer.usage.label,
  footer.usage.text,
  footer.copyright,
  footer.disclaimer,
].join(' ')

/** The real menu screen of the captured CLI session, verbatim (see terminalSession.ts). */
const realMenuScreen = blockText(terminalSession.blocks.find((b) => b.id === 'menu')!)

describe('closing', () => {
  it('is the line and nothing else: no paragraph, no second message', () => {
    expect(siteCopy.closing).toEqual({ line: 'Before the Breach.' })
    expect(siteCopy.closing.line).toBe(site.slogan)
  })
})

describe('footer links', () => {
  it('has exactly the three approved links, numbered in order, all real', () => {
    expect(footer.project.links).toEqual([
      {
        index: 1,
        name: 'GitHub',
        href: 'https://github.com/alex0tico/kuyfi',
        host: 'github.com/alex0tico/kuyfi',
      },
      {
        index: 2,
        name: 'npm',
        href: 'https://www.npmjs.com/package/@kuyfi/kuyfi',
        host: 'npmjs.com',
      },
      {
        index: 3,
        name: 'Technical write-up',
        href: 'https://github.com/alex0tico/kuyfi/blob/main/docs/technical-writeup.md',
        host: 'github.com',
      },
    ])
    expect(footer.project.links.map((link) => link.href)).toEqual([
      releaseStatus.links.github,
      releaseStatus.links.npm,
      releaseStatus.links.writeup,
    ])
    for (const { href } of footer.project.links) expect(href).toMatch(/^https:\/\/[^#]+$/)
  })

  it('invents no social account, community or placeholder page', () => {
    expect(footerText).not.toMatch(
      /discord|twitter|linkedin|telegram|youtube|instagram|slack|\bx\.com\b|coming soon|deck|docs/i,
    )
  })
})

describe('footer TUI chrome', () => {
  it('brackets the menu tag and every menu index like the site does elsewhere', () => {
    expect(footer.menuTag).toBe('[ MENU ]')
    expect(footer.project.links.map((l) => l.index)).toEqual([1, 2, 3])
  })

  it('spaces the wordmark like the real CLI sets its own lockup', () => {
    expect(footer.wordmark).toBe('K U Y F I')
  })

  it('borrows its status-bar phrasing from the real captured CLI session, not from invented text', () => {
    expect(footer.statusBar.role).toBe('SECURITY TERMINAL')
    expect(footer.statusBar.network).toBe('TESTNET')
    expect(realMenuScreen).toContain(footer.statusBar.role)
    expect(realMenuScreen).toContain(`Network: ${footer.statusBar.network}`)
  })

  it("states the real release next to that phrasing, not the CLI screen's own shorthand", () => {
    expect(footer.statusBar.release).toBe(`v${site.version}`)
  })
})

describe('footer facts', () => {
  it('states version 0.1.0 and the MIT license, from the same source as the rest of the site', () => {
    expect(footer.release.version).toBe('v0.1.0')
    expect(footer.release.version).toBe(`v${site.version}`)
    expect(footer.release.license).toBe('MIT license')
    expect(footer.release.license).toContain(site.license)
  })

  it('limits the evidence network claim to Stellar Testnet', () => {
    expect(footer.network.text).toBe('Evidence shown on this site uses Stellar Testnet.')
  })

  it('never overclaims platform, production or Mainnet readiness', () => {
    expect(footerText).not.toMatch(
      /mainnet[- ](ready|validated|support(ed)?)|production[- ](network|ready)|enterprise[- ]ready|battle[- ]tested|guarantee/i,
    )
  })

  it('warns about Mainnet only to say Kuyfi should not be run there without authorization', () => {
    expect(footer.usage.label).toBe('RESPONSIBLE USE')
    expect(footer.usage.text).toBe(
      'Chaos Monkey may submit transactions to Stellar Testnet. Do not run it against Mainnet ' +
        'contracts without explicit authorization.',
    )
    expect(footer.usage.text).not.toMatch(/mainnet (is|now)? ?supported/i)
  })

  it('scopes the warning to Chaos Monkey, not to Kuyfi as a whole: the scanner is read-only', () => {
    // OSINT Scanner never submits a transaction (see siteCopy.osintScanner.support); only Chaos
    // Monkey can. The warning must not read as if every Kuyfi run sends transactions.
    expect(footer.usage.text).toMatch(/^Chaos Monkey/)
    expect(footer.usage.text).not.toMatch(/Kuyfi sends|Kuyfi (always |itself )?submits/i)
  })

  it('keeps the approved disclaimer and adds no other legal claim beyond the usage note', () => {
    expect(footer.disclaimer).toBe('Not affiliated with the Stellar Development Foundation.')
    expect(footer.copyright).toBe('© 2026 Kuyfi')
    expect(footerText).not.toMatch(/all rights reserved|trademark|patent|liab|warrant/i)
  })

  it('keeps the copyright sign out of the copy, where the editorial rules would read it as a pictograph', () => {
    expect(JSON.stringify(siteCopy.footer)).not.toContain('©')
  })

  it('has no em dash, in a footer that is easy to write hastily', () => {
    expect(footerText).not.toMatch(/[—―]/)
  })
})
