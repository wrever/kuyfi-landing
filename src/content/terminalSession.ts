import { site } from '../config/site'

/**
 * Real Kuyfi CLI session shown in the Terminal section. Data only, no presentation.
 *
 * Nothing here is invented. Every line comes from one of the sources below, and each block records
 * which one. The `source` and `reference` fields are internal notes: they are never rendered.
 *
 *   cli   Output of the published package @kuyfi/kuyfi@0.1.0 (`kuyfi --help`; and the real
 *         HomeScreen rendered offline from dist/screens/HomeScreen.js, which prints the menu).
 *   demo  docs/demo.md in github.com/alex0tico/kuyfi ("Demo: Step-by-Step Walkthrough", section 3),
 *         a run of the OSINT Scanner against Kuyfi's own intentionally vulnerable Testnet fixture.
 *         Its line formats match dist/screens/ScannerScreen.js of 0.1.0 exactly.
 *   historical-run  Reserved for a dated run recorded elsewhere. Not used yet.
 *
 * Cross-checks: the fixture (3 functions, 0 UDTs, 1,700 bytes of WASM, contract id) also appears in
 * docs/technical-writeup.md section 5 and in evidence.ts.
 *
 * The transcript is exempt from the prose rules in siteCopy.test.ts: it is CLI output, and the CLI
 * itself prints an emoji, arrows and box characters. Never edit a line to satisfy an editorial rule.
 *
 * Text is verbatim. `role` only carries colour: it follows the colours the real TUI (Ink) applies
 * to that token, mapped onto the site palette in Terminal.module.css.
 */

export type TerminalSource = 'cli' | 'demo' | 'historical-run'

export type TerminalRole =
  | 'prompt'
  | 'command'
  | 'brand' // magenta in the TUI
  | 'dim'
  | 'accent' // cyan in the TUI: keys, network
  | 'id' // yellow in the TUI: contract id
  | 'strong'
  | 'ok' // green in the TUI
  | 'fn'
  | 'punct'
  | 'arrow'
  | 'ret'
  | 'void'
  | 'selected'
  | 'muted'

export interface TerminalSegment {
  readonly text: string
  readonly role?: TerminalRole
}

/** A line is a list of segments. An empty list is a blank line. */
export type TerminalLine = readonly TerminalSegment[]

export interface TerminalBlock {
  readonly id: 'command' | 'menu' | 'scan'
  /** Internal provenance. Not rendered. */
  readonly source: TerminalSource
  readonly reference: string
  /** Site annotation between screens (what the user did). Not CLI output. */
  readonly caption?: string
  readonly lines: readonly TerminalLine[]
}

export interface TerminalSession {
  readonly meta: {
    readonly product: string
    readonly package: string
    readonly version: string
    readonly network: string
  }
  readonly target: {
    readonly description: string
    readonly contractId: string
  }
  readonly blocks: readonly TerminalBlock[]
}

const seg = (text: string, role?: TerminalRole): TerminalSegment => ({ text, role })
const BLANK: TerminalLine = []

/** One line of the attack surface map: `name(inputs) → Has Return | Void`, as the scanner prints it. */
function fnLine(name: string, inputs: string, returns: 'Has Return' | 'Void'): TerminalLine {
  return [
    seg(name, 'fn'),
    seg('(', 'punct'),
    seg(inputs, 'dim'),
    seg(')', 'punct'),
    seg(' → ', 'arrow'),
    seg(returns, returns === 'Void' ? 'void' : 'ret'),
  ]
}

/** One row of the main menu. The TUI pads titles to 20 columns; the first row is the selection. */
function menuRow(num: number, title: string, desc: string, selected = false): TerminalLine {
  return [
    seg('  '),
    seg(`[${num}]  `, selected ? 'brand' : 'muted'),
    seg(title.padEnd(20, ' '), selected ? 'selected' : 'muted'),
    seg(desc, 'dim'),
  ]
}

export const terminalSession: TerminalSession = {
  meta: {
    product: 'KUYFI',
    package: site.packageName,
    version: site.version,
    network: 'Stellar Testnet',
  },

  target: {
    description: "Kuyfi's own intentionally vulnerable Testnet fixture",
    contractId: 'CDYUQRWYE6INSGTMJWHPU32VSWVOZ456EUHJMMQXTCFXPFUXPH2JTPV7',
  },

  blocks: [
    {
      id: 'command',
      source: 'cli',
      reference: '`kuyfi --help`: "$ kuyfi  Launch the interactive TUI." README, Usage.',
      lines: [[seg('$', 'prompt'), seg(' '), seg(site.cliCommand, 'command')]],
    },
    {
      id: 'menu',
      source: 'cli',
      reference:
        'Real HomeScreen of @kuyfi/kuyfi@0.1.0 rendered offline (title padEnd(20)); same rows as docs/demo.md section 2. Box border and ASCII header omitted.',
      lines: [
        [
          seg('KUYFI v0.1', 'brand'),
          seg(' · ', 'dim'),
          seg('SECURITY TERMINAL', 'dim'),
          seg(' · ', 'dim'),
          seg('Network: ', 'dim'),
          seg('TESTNET', 'accent'),
          seg(' · ', 'dim'),
          seg('[ESC]', 'accent'),
          seg(' Menu', 'dim'),
        ],
        BLANK,
        menuRow(1, 'OSINT Scanner', 'Map contract attack surface', true),
        menuRow(2, 'Chaos Monkey', 'Fuzz & stress test a contract'),
        menuRow(3, 'System Logs', 'RPC connection status'),
        menuRow(4, 'About', 'Project info'),
        BLANK,
        [
          seg('  '),
          seg('↑↓', 'accent'),
          seg(' navigate   ', 'dim'),
          seg('Enter', 'accent'),
          seg(' select   ', 'dim'),
          seg('1–4', 'accent'),
          seg(' shortcut', 'dim'),
        ],
      ],
    },
    {
      id: 'scan',
      source: 'demo',
      reference:
        'docs/demo.md section 3 (verbatim); formats match dist/screens/ScannerScreen.js of 0.1.0. Fixture facts match technical-writeup.md section 5 and evidence.ts.',
      caption: 'Press 1, enter the Contract ID, press Enter',
      lines: [
        [
          seg('🛡 ATTACK SURFACE MAP', 'brand'),
          seg(' ─── ', 'dim'),
          seg('CDYUQR...JTPV7', 'id'),
          seg(' ─── ', 'dim'),
          seg('1,700', 'strong'),
          seg(' bytes', 'dim'),
        ],
        BLANK,
        [seg('✔ Functions found: ', 'ok'), seg('3', 'strong')],
        BLANK,
        fnLine('get_value', '', 'Has Return'),
        fnLine('set_admin_value', 'admin: Address, value: I128', 'Void'),
        fnLine('secure_set_admin_value', 'admin: Address, value: I128', 'Void'),
      ],
    },
  ],
}

/** Plain text of one line, exactly as the terminal would print it. */
export function lineText(line: TerminalLine): string {
  return line.map((part) => part.text).join('')
}

/** Plain text of a block: its lines joined by newlines. */
export function blockText(block: TerminalBlock): string {
  return block.lines.map(lineText).join('\n')
}
