import { describe, expect, it } from 'vitest'
import { site } from '../config/site'
import { evidence } from './evidence'
import { siteCopy } from './siteCopy'
import { blockText, lineText, terminalSession, type TerminalSource } from './terminalSession'

/**
 * The transcript is real CLI output, so it is NOT held to the prose rules in siteCopy.test.ts (the CLI
 * prints an emoji, arrows and box characters itself). These tests hold it to something stricter:
 * it must match the product and the source of truth, and it must not contain anything invented.
 */

const { blocks, meta, target } = terminalSession
const block = (id: string) => blocks.find((b) => b.id === id)!
const sessionText = blocks.map(blockText).join('\n')

const SOURCES: readonly TerminalSource[] = ['cli', 'demo', 'historical-run']

/** The scanner's own contract id shortening (dist/ui/format.js, truncateContractId). */
const truncate = (id: string, head = 6, tail = 5) => `${id.slice(0, head)}...${id.slice(-tail)}`

describe('terminal session provenance', () => {
  it('records where every block comes from', () => {
    expect(blocks.length).toBeGreaterThan(0)
    for (const b of blocks) {
      expect(SOURCES, b.id).toContain(b.source)
      expect(b.reference.length, b.id).toBeGreaterThan(20)
    }
  })

  it('shows the real command of the published package', () => {
    expect(site.cliCommand).toBe('kuyfi')
    expect(blockText(block('command'))).toBe('$ kuyfi')
  })

  it('describes the same product as the rest of the site and evidence.ts', () => {
    expect(meta.version).toBe(site.version)
    expect(meta.version).toBe(evidence.project.version)
    expect(meta.package).toBe(site.packageName)
    expect(meta.network).toBe(evidence.vulnerableFixture.network)
  })

  it('targets the intentionally vulnerable fixture, and says so', () => {
    expect(target.contractId).toBe(evidence.vulnerableFixture.contractId)
    expect(target.description).toMatch(/intentionally vulnerable/i)
    expect(siteCopy.terminal.note).toMatch(/intentionally vulnerable/i)
    expect(siteCopy.terminal.note).toMatch(/read-only/i)
  })
})

describe('terminal session: main menu', () => {
  const lines = block('menu').lines.map(lineText)

  it('prints the status bar exactly as the TUI does', () => {
    expect(lines[0]).toBe('KUYFI v0.1 · SECURITY TERMINAL · Network: TESTNET · [ESC] Menu')
  })

  it('lists the four real modules, titles padded to 20 columns as HomeScreen does', () => {
    const rows = lines.filter((line) => /^ {2}\[\d\] {2}/.test(line))
    expect(rows).toEqual([
      '  [1]  OSINT Scanner       Map contract attack surface',
      '  [2]  Chaos Monkey        Fuzz & stress test a contract',
      '  [3]  System Logs         RPC connection status',
      '  [4]  About               Project info',
    ])
    // Two spaces, "[n]" and two spaces, then a 20 column title, then the description.
    for (const row of rows) {
      expect(row.slice(7, 27)).toHaveLength(20)
      expect(row.slice(27)).toMatch(/^\S/)
    }
  })

  it('ends with the real key hints', () => {
    expect(lines.at(-1)).toBe('  ↑↓ navigate   Enter select   1–4 shortcut')
  })
})

describe('terminal session: OSINT Scanner attack surface map', () => {
  const lines = block('scan').lines.map(lineText)
  const functionLines = lines.filter((line) => / → (Has Return|Void)$/.test(line))

  it('prints the map header with the CLI shortening of the fixture id and its bytecode size', () => {
    expect(lines[0]).toBe(`🛡 ATTACK SURFACE MAP ─── ${truncate(target.contractId)} ─── 1,700 bytes`)
    expect(truncate(target.contractId)).toBe('CDYUQR...JTPV7')
  })

  it('reports the number of functions found, and it matches the lines and evidence.ts', () => {
    const found = lines.find((line) => line.startsWith('✔ Functions found: '))
    expect(found).toBe(`✔ Functions found: ${functionLines.length}`)
    expect(functionLines).toHaveLength(evidence.vulnerableFixture.functions)
  })

  it('lists exactly the three functions of the fixture, in the scanner format', () => {
    expect(functionLines).toEqual([
      'get_value() → Has Return',
      'set_admin_value(admin: Address, value: I128) → Void',
      'secure_set_admin_value(admin: Address, value: I128) → Void',
    ])
    for (const line of functionLines) {
      expect(line).toMatch(/^[a-z_]+\((|[a-z_]+: [A-Za-z0-9]+(, [a-z_]+: [A-Za-z0-9]+)*)\) → /)
    }
  })

  it('keeps the annotation between screens out of the CLI output', () => {
    expect(block('scan').caption).toBe('Press 1, enter the Contract ID, press Enter')
    expect(block('command').caption).toBeUndefined()
    expect(block('menu').caption).toBeUndefined()
    for (const b of blocks) {
      expect(b.caption ?? '', b.id).not.toMatch(/[—―]/)
      expect(b.caption ?? '', b.id).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })
})

describe('terminal session: nothing invented', () => {
  it('has no findings, vector counts, transaction hashes or classification output', () => {
    expect(sessionText).not.toMatch(/KYF-\d+/)
    expect(sessionText).not.toMatch(/\b[0-9a-f]{64}\b/)
    expect(sessionText).not.toMatch(/\b(CRITICAL|HIGH|MEDIUM|LOW)\b/)
    expect(sessionText).not.toMatch(
      /POTENTIAL_VULN|UNEXPECTED_ERROR|UNCONTROLLED_PANIC|PRECONDITION_FAIL/,
    )
    expect(sessionText).not.toMatch(/vectors?|broadcast|Tx\b|finding/i)
  })

  it('names no contract id other than the fixture', () => {
    const ids = sessionText.match(/\bC[A-Z0-9]{5}\.\.\.[A-Z0-9]{5}\b|\bC[A-Z0-9]{55}\b/g) ?? []
    expect(new Set(ids)).toEqual(new Set([truncate(target.contractId)]))
  })

  it('has no line that is not one of the sources documented above', () => {
    // 1 command line + 8 menu lines + 7 map lines. A new line means a new source must be documented.
    expect(blocks.map((b) => b.lines.length)).toEqual([1, 8, 7])
  })
})

describe('terminal copy', () => {
  it('uses the agreed label and heading', () => {
    expect(siteCopy.terminal.kicker).toBe('[ 04 · REAL CLI ]')
    expect(siteCopy.terminal.heading).toBe('Kuyfi, from the terminal.')
  })

  it('names the region and the session for assistive tech and the header', () => {
    expect(siteCopy.terminal.region).toBe('Real Kuyfi CLI session')
    expect(siteCopy.terminal.sessionTag).toBe('REAL CLI SESSION')
  })
})
