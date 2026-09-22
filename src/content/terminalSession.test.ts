import { describe, expect, it } from 'vitest'
import { site } from '../config/site'
import { evidence } from './evidence'
import { siteCopy } from './siteCopy'
import { blockText, lineText, terminalSession, type TerminalSource } from './terminalSession'

/**
 * The transcript is real CLI output, so it is NOT held to the prose rules in siteCopy.test.ts (the CLI
 * prints an emoji, arrows and box characters itself). These tests hold it to something stricter: it
 * must be exactly what a captured session printed, and it must not contain anything invented.
 */

const { blocks, meta, target, provenance } = terminalSession
const block = (id: string) => blocks.find((b) => b.id === id)!
const sessionText = blocks.map(blockText).join('\n')

const SOURCES: readonly TerminalSource[] = ['captured-session', 'cli', 'demo', 'historical-run']

/** The scanner's own contract id shortening (dist/ui/format.js, truncateContractId). */
const truncate = (id: string, head = 6, tail = 5) => `${id.slice(0, head)}...${id.slice(-tail)}`

/**
 * Screen 1 of the captured session (kuyfi launched, 70 columns): every line exactly as the terminal
 * showed it. Generated from the capture, never edited.
 */
const CAPTURED_LAUNCH_SCREEN = [
  ' KUYFI v0.1 · SECURITY TERMINAL · Network: TESTNET · [ESC] Menu',
  '',
  '                       /\\_/\\                /\\_/\\',
  '                     ( o.o )   K U Y F I   ( o.o )',
  '                      > ^ <                 > ^ <',
  '                        [ CORE SECURITY MODULE ]',
  '',
  ' ┌──────────────────────────────────────────────────────────────────┐',
  ' │                                                                  │',
  ' │  [1]  OSINT Scanner       Map contract attack surface            │',
  ' │  [2]  Chaos Monkey        Fuzz & stress test a contract          │',
  ' │  [3]  System Logs         RPC connection status                  │',
  ' │  [4]  About               Project info                           │',
  ' │                                                                  │',
  ' │  ↑↓ navigate   Enter select   1–4 shortcut                       │',
  ' │                                                                  │',
  ' └──────────────────────────────────────────────────────────────────┘',
]

/** Screen 4 of the captured session: the OSINT Scanner result after entering the Contract ID. */
const CAPTURED_SCAN_SCREEN = [
  ' KUYFI v0.1 · SECURITY TERMINAL · Network: TESTNET · [ESC] Menu',
  '',
  ' ┌────────────────────────────────────────────────────────────────┐',
  ' │                                                                │',
  ' │ [ESC] Back                                                     │',
  ' │                                                                │',
  ' │ ┌────────────────────────────────────────────────────────────┐ │',
  ' │ │                                                            │ │',
  ' │ │ 🛡 ATTACK SURFACE MAP ─── CDYUQR...JTPV7 ─── 1,700 bytes    │ │',
  ' │ │                                                            │ │',
  ' │ │ ✔ Functions found: 3                                       │ │',
  ' │ │                                                            │ │',
  ' │ │ get_value() → Has Return                                   │ │',
  ' │ │ set_admin_value(admin: Address, value: I128) → Void        │ │',
  ' │ │ secure_set_admin_value(admin: Address, value: I128) → Void │ │',
  ' │ │                                                            │ │',
  ' │ └────────────────────────────────────────────────────────────┘ │',
  ' │                                                                │',
  ' │ ─────────────────────────────────────────────                  │',
  ' │ What do you want to do next?                                   │',
  ' │                                                                │',
  ' │ [S]  Scan another contract                                     │',
  ' │ [C]  Run Chaos Monkey on this contract                         │',
  ' │ [M]  Return to main menu                                       │',
  ' │ [Q]  Quit                                                      │',
  ' │ ─────────────────────────────────────────────                  │',
  ' │                                                                │',
  ' └────────────────────────────────────────────────────────────────┘',
]

describe('terminal session provenance', () => {
  it('records where every block comes from, and shows only the captured session', () => {
    expect(blocks.length).toBeGreaterThan(0)
    for (const b of blocks) {
      expect(SOURCES, b.id).toContain(b.source)
      expect(b.source, b.id).toBe('captured-session')
      expect(b.reference.length, b.id).toBeGreaterThan(20)
    }
  })

  it('records how the session was run: package, network, contract, mode and execution', () => {
    expect(provenance.package).toBe('@kuyfi/kuyfi@0.1.0')
    expect(provenance.package).toBe(`${site.packageName}@${evidence.project.version}`)
    expect(provenance.network).toBe('Stellar Testnet')
    expect(provenance.network).toBe(evidence.vulnerableFixture.network)
    expect(provenance.contractId).toBe('CDYUQRWYE6INSGTMJWHPU32VSWVOZ456EUHJMMQXTCFXPFUXPH2JTPV7')
    expect(provenance.contractId).toBe(evidence.vulnerableFixture.contractId)
    expect(provenance.mode).toBe('OSINT Scanner')
    expect(provenance.execution).toBe('read-only')
  })

  it('records that nothing but read-only ledger reads was observed', () => {
    expect(provenance.observed.transactions).toBe(0)
    expect(provenance.observed.rpcCalls).toEqual([{ method: 'getLedgerEntries', count: 2 }])
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
    expect(siteCopy.terminal.note).toMatch(/real session/i)
    expect(siteCopy.terminal.note).toMatch(/read-only/i)
  })
})

describe('terminal session is exactly the captured screens', () => {
  it('launch screen: every line as captured', () => {
    expect(block('menu').lines.map(lineText)).toEqual(CAPTURED_LAUNCH_SCREEN)
  })

  it('scan screen: every line as captured, including the CLI emoji and its one-cell quirk', () => {
    expect(block('scan').lines.map(lineText)).toEqual(CAPTURED_SCAN_SCREEN)
  })

  it('fits the 70 columns the session was captured at', () => {
    for (const line of blocks.flatMap((b) => b.lines.map(lineText))) {
      expect([...line].length).toBeLessThanOrEqual(70)
    }
  })

  it('keeps colour separate from text: segments only carry text and a role', () => {
    for (const b of blocks) {
      for (const line of b.lines) {
        for (const part of line) expect(Object.keys(part).sort()).toEqual(['role', 'text'])
      }
    }
  })
})

describe('terminal session: what the screens say', () => {
  const launch = block('menu').lines.map(lineText)
  const scan = block('scan').lines.map(lineText)
  const functionLines = scan.filter((line) => / → (Has Return|Void)\b/.test(line))

  it('starts with the TUI status bar and lists the four real modules', () => {
    expect(launch[0]).toBe(' KUYFI v0.1 · SECURITY TERMINAL · Network: TESTNET · [ESC] Menu')
    expect(launch.filter((line) => /\[\d\] {2}/.test(line))).toHaveLength(4)
  })

  it('prints the map header with the CLI shortening of the fixture id and its bytecode size', () => {
    const header = scan.find((line) => line.includes('ATTACK SURFACE MAP'))
    expect(header).toContain(
      `🛡 ATTACK SURFACE MAP ─── ${truncate(target.contractId)} ─── 1,700 bytes`,
    )
    expect(truncate(target.contractId)).toBe('CDYUQR...JTPV7')
  })

  it('reports the number of functions found, and it matches the lines and evidence.ts', () => {
    const found = scan.find((line) => line.includes('Functions found: '))
    expect(found).toContain(`✔ Functions found: ${functionLines.length}`)
    expect(functionLines).toHaveLength(evidence.vulnerableFixture.functions)
  })

  it('lists exactly the three functions of the fixture', () => {
    const names = functionLines.map((line) => line.match(/[a-z_]+(?=\()/)?.[0])
    expect(names).toEqual(['get_value', 'set_admin_value', 'secure_set_admin_value'])
  })

  it('offers the real post-scan menu, but the session never selected Chaos Monkey', () => {
    expect(scan.some((line) => line.includes('[C]  Run Chaos Monkey on this contract'))).toBe(true)
    expect(provenance.actions.join(' ')).not.toMatch(/chaos|press c/i)
  })
})

describe('terminal session: captions are not CLI output', () => {
  it('keeps the annotation between screens out of the transcript', () => {
    expect(block('scan').caption).toBe('Press 1, enter the Contract ID, press Enter')
    expect(block('command').caption).toBeUndefined()
    expect(block('menu').caption).toBeUndefined()
    for (const b of blocks) {
      if (b.caption) expect(sessionText, b.id).not.toContain(b.caption)
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

  it('has exactly the captured line counts: 1 command, 17 launch, 28 scan', () => {
    expect(blocks.map((b) => b.lines.length)).toEqual([1, 17, 28])
  })
})

describe('terminal copy', () => {
  it('uses the agreed label and heading', () => {
    expect(siteCopy.terminal.kicker).toBe('[ 04 · REAL CLI ]')
    expect(siteCopy.terminal.heading).toBe('Kuyfi, from the terminal.')
  })

  it('may say REAL CLI SESSION because the session was actually run, end to end', () => {
    expect(siteCopy.terminal.region).toBe('Real Kuyfi CLI session')
    expect(siteCopy.terminal.sessionTag).toBe('REAL CLI SESSION')
    expect(provenance.actions).toEqual([
      'launch kuyfi',
      'press 1',
      'type the Contract ID',
      'press Enter',
      'press q',
    ])
  })
})
