import { describe, expect, it } from 'vitest'
import { site } from '../config/site'
import { fill } from '../lib/fill'
import { evidence } from './evidence'
import { releaseStatus } from './releaseStatus'
import { siteCopy } from './siteCopy'

/** Every string of a piece of copy, placeholders filled the way the sections fill them. */
function visible(value: unknown): string[] {
  if (typeof value === 'string') {
    return [fill(value, { version: `v${site.version}`, license: site.license })]
  }
  if (value && typeof value === 'object') return Object.values(value).flatMap(visible)
  return []
}

const { install, openSource } = siteCopy
const text = [...visible(install), ...visible(openSource)]
const platform = (id: string) => releaseStatus.platforms.find((p) => p.id === id)!

describe('release facts', () => {
  it('is @kuyfi/kuyfi v0.1.0, under the MIT license, on Node 20 or later', () => {
    expect(releaseStatus.package).toBe('@kuyfi/kuyfi')
    expect(releaseStatus.release).toBe('0.1.0')
    expect(releaseStatus.node).toBe('>=20')
    expect(releaseStatus.license).toBe('MIT')
    expect(site.packageName).toBe(releaseStatus.package)
    expect(site.version).toBe(releaseStatus.release)
  })

  it('reports 150 of 150 Kuyfi product tests, the count evidence.ts holds', () => {
    expect(releaseStatus.productTests).toEqual({ passing: 150, total: 150 })
    expect(releaseStatus.productTests).toBe(evidence.project.tests)
  })

  it("says the tests are the product's, and never the landing page's", () => {
    expect(openSource.status.testsNote).toMatch(/product tests/)
    expect(text.join(' ')).not.toMatch(/landing/i)
  })

  it('states the Node requirement the same way in both places', () => {
    expect(install.requirement).toBe('Node.js 20+')
    expect(releaseStatus.node).toMatch(/^>=20$/)
  })
})

describe('platform validation', () => {
  it('validated macOS by hand', () => {
    expect(platform('macos')).toMatchObject({ name: 'macOS', validation: 'validated' })
  })

  it('validated Windows 11 by hand, in Windows Terminal and PowerShell', () => {
    expect(platform('windows')).toMatchObject({
      name: 'Windows 11',
      validation: 'validated',
      terminal: 'Windows Terminal / PowerShell',
    })
  })

  it('did NOT validate Linux by hand, and nothing implies it did', () => {
    expect(platform('linux')).toEqual({ id: 'linux', name: 'Linux', validation: 'not-validated' })
    expect(releaseStatus.platforms.filter((p) => p.validation === 'not-validated')).toHaveLength(1)
    expect(openSource.status.notValidated).toBe('NOT MANUALLY VALIDATED')
    expect(openSource.status.notValidated).not.toBe(openSource.status.validated)
  })

  it('agrees with the owner-provided project facts in evidence.ts', () => {
    const { validatedManually, notValidatedManuallyYet } = evidence.project
    const validated = releaseStatus.platforms
      .filter((p) => p.validation === 'validated')
      .map((p) => (p.terminal ? `${p.name} / ${p.terminal}` : p.name))
    expect(validated).toEqual([...validatedManually])
    expect(
      releaseStatus.platforms.filter((p) => p.validation === 'not-validated').map((p) => p.name),
    ).toEqual([...notValidatedManuallyYet])
  })

  it('does not say a platform is expected or supposed to work', () => {
    expect(text.join(' ')).not.toMatch(/expected to work|should work|works on|supported on/i)
  })
})

describe('links and commands', () => {
  it('points at the real GitHub repository, technical write-up and npm package', () => {
    expect(releaseStatus.links).toEqual({
      github: 'https://github.com/alex0tico/kuyfi',
      writeup: 'https://github.com/alex0tico/kuyfi/blob/main/docs/technical-writeup.md',
      npm: 'https://www.npmjs.com/package/@kuyfi/kuyfi',
    })
    for (const url of Object.values(releaseStatus.links)) expect(url).toMatch(/^https:\/\/[^#]+$/)
  })

  it('installs the real package and launches the real CLI, from one source', () => {
    expect(install.command).toBe('npm install -g @kuyfi/kuyfi')
    expect(install.command).toBe(site.installCommand)
    expect(install.command).toBe(`npm install -g ${releaseStatus.package}`)
    expect(install.then).toBe('kuyfi')
    expect(install.then).toBe(site.cliCommand)
  })
})

describe('open source copy', () => {
  it('uses the agreed labels and headings', () => {
    expect(install.kicker).toBe('[ 06 · INSTALL ]')
    expect(install.heading).toBe('Run Kuyfi locally.')
    expect(openSource.kicker).toBe('[ 07 · OPEN SOURCE ]')
    expect(openSource.heading).toBe('The implementation is public.')
  })

  it('states the license and version by filling them from the sources of truth', () => {
    expect(fill(openSource.body, { version: `v${site.version}`, license: site.license })).toBe(
      'The source code, architecture, release history and technical write-up are available publicly. Kuyfi v0.1.0 is released under the MIT license.',
    )
    // The copy itself holds no number: placeholders only.
    expect(openSource.body).toMatch(/\{version\}/)
    expect(openSource.body).toMatch(/\{license\}/)
  })

  it('limits the network claim to Stellar Testnet', () => {
    expect(openSource.status.network).toBe(
      'Documented audit evidence in this release uses Stellar Testnet.',
    )
    expect(releaseStatus.evidenceNetwork).toBe('Stellar Testnet')
    expect(text.join(' ')).not.toMatch(/mainnet/i)
  })

  it('points to the public repository for notes and limitations, without claiming there are none', () => {
    expect(openSource.status.limitations).toBe(
      'Current release notes and documented limitations are available in the public repository.',
    )
    expect(text.join(' ')).not.toMatch(/no known (issues|problems|limitations)/i)
  })
})

describe('guardrails: no overclaiming, no vanity metrics', () => {
  it('never claims production, enterprise or mainnet readiness, full support or guarantees', () => {
    expect(text.join(' ')).not.toMatch(
      /production[- ]ready|enterprise[- ]ready|battle[- ]tested|mainnet[- ](ready|validated)|production network|fully supported|cross-platform (guaranteed|support)|guarantee/i,
    )
  })

  it('shows no popularity numbers', () => {
    expect(text.join(' ')).not.toMatch(/\bdownloads?\b|\bstars?\b|\bcontributors?\b|\bforks?\b/i)
  })

  it('avoids the phrases the brief rules out', () => {
    expect(text.join(' ')).not.toMatch(
      /in seconds|one command away|supercharge|seamless|developer-first|built different|powerful|unlock|next-generation/i,
    )
  })
})
