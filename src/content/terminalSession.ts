import { site } from '../config/site'

/**
 * Real Kuyfi CLI session shown in the Terminal section. Data only, no presentation.
 *
 * The visible transcript is one session, captured end to end from the published package:
 *
 *   package    @kuyfi/kuyfi@0.1.0, launched as `kuyfi` (global install)
 *   terminal   a real pseudo-terminal (Windows ConPTY), 70 columns by 40 rows, read through a
 *              terminal emulator so the text below is exactly what was on screen
 *   actions    launch `kuyfi`, press 1 (OSINT Scanner), type the Contract ID, press Enter, press q
 *   target     Kuyfi's own intentionally vulnerable Stellar Testnet fixture
 *   execution  read-only. Only the OSINT Scanner ran; Chaos Monkey was never opened. A guard
 *              loaded into the process logged every outgoing request and aborted on anything that
 *              was not a read-only Soroban RPC call. It saw exactly two: POST getLedgerEntries,
 *              twice. No transaction was simulated, signed, broadcast or created.
 *
 * Two of the four screens of the session are shown, each in full and unedited: the screen at launch
 * and the screen after the scan. The two in between (the Contract ID prompt, empty and typed) are
 * represented by `caption`, which is a site annotation and never CLI output.
 *
 * Text is verbatim: no character was added, removed or corrected. That includes a quirk of the CLI
 * itself: it pads the row with the emoji as if the emoji were one cell wide, and a terminal draws it two
 * cells wide, so that one row of the real output is a cell wider than its neighbours. `role` only carries colour, derived from the ANSI colour attributes of the
 * capture and mapped onto the site palette in Terminal.module.css.
 *
 * The transcript is exempt from the prose rules in siteCopy.test.ts: it is CLI output. Never edit a
 * line to satisfy an editorial rule.
 *
 * Earlier this transcript was assembled from docs/demo.md and the package's source. It matched this
 * capture on every line they had in common, and has been replaced by it.
 */

export type TerminalSource = 'captured-session' | 'cli' | 'demo' | 'historical-run'

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

/** How the session was produced. Internal: not rendered. */
export interface TerminalProvenance {
  readonly package: string
  readonly network: string
  readonly contractId: string
  readonly mode: string
  readonly execution: 'read-only'
  readonly capturedOn: string
  readonly terminal: { readonly columns: number; readonly rows: number }
  readonly actions: readonly string[]
  /** What the request guard observed while the session ran. */
  readonly observed: {
    readonly rpcCalls: readonly { readonly method: string; readonly count: number }[]
    readonly transactions: 0
  }
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
  readonly provenance: TerminalProvenance
  readonly blocks: readonly TerminalBlock[]
}

const seg = (text: string, role?: TerminalRole): TerminalSegment => ({ text, role })
const BLANK: TerminalLine = []

const CONTRACT_ID = 'CDYUQRWYE6INSGTMJWHPU32VSWVOZ456EUHJMMQXTCFXPFUXPH2JTPV7'

export const terminalSession: TerminalSession = {
  meta: {
    product: 'KUYFI',
    package: site.packageName,
    version: site.version,
    network: 'Stellar Testnet',
  },

  target: {
    description: "Kuyfi's own intentionally vulnerable Testnet fixture",
    contractId: CONTRACT_ID,
  },

  provenance: {
    package: `${site.packageName}@${site.version}`,
    network: 'Stellar Testnet',
    contractId: CONTRACT_ID,
    mode: 'OSINT Scanner',
    execution: 'read-only',
    capturedOn: '2026-09-21',
    terminal: { columns: 70, rows: 40 },
    actions: ['launch kuyfi', 'press 1', 'type the Contract ID', 'press Enter', 'press q'],
    observed: { rpcCalls: [{ method: 'getLedgerEntries', count: 2 }], transactions: 0 },
  },

  blocks: [
    {
      id: 'command',
      source: 'captured-session',
      reference: 'The command that launched the captured session: `kuyfi`, the TUI.',
      lines: [[seg('$', 'prompt'), seg(' '), seg(site.cliCommand, 'command')]],
    },
    {
      id: 'menu',
      source: 'captured-session',
      reference: 'Screen 1 of 4 of the captured session: the main menu right after launch.',
      lines: [
        [
          seg(' '),
          seg('KUYFI v0.1', 'brand'),
          seg(' · SECURITY TERMINAL · Network: ', 'dim'),
          seg('TESTNET', 'accent'),
          seg(' · ', 'dim'),
          seg('[ESC]', 'accent'),
          seg(' Menu', 'dim'),
        ],
        BLANK,
        [seg('                       '), seg('/\\_/\\                /\\_/\\', 'brand')],
        [seg('                     '), seg('( o.o )   K U Y F I   ( o.o )', 'brand')],
        [seg('                      '), seg('> ^ <                 > ^ <', 'brand')],
        [seg('                        '), seg('[ CORE SECURITY MODULE ]', 'accent')],
        BLANK,
        [
          seg(' '),
          seg('┌──────────────────────────────────────────────────────────────────┐', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                  │', 'dim'),
        ],
        [
          seg(' '),
          seg('│  ', 'dim'),
          seg('[1]  ', 'brand'),
          seg('OSINT Scanner       ', 'selected'),
          seg('Map contract attack surface', 'dim'),
          seg('            '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│  ', 'dim'),
          seg('[2]  Chaos Monkey        ', 'muted'),
          seg('Fuzz & stress test a contract', 'dim'),
          seg('          '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│  ', 'dim'),
          seg('[3]  System Logs', 'muted'),
          seg('         '),
          seg('RPC connection status', 'dim'),
          seg('                  '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│  ', 'dim'),
          seg('[4]  About', 'muted'),
          seg('               '),
          seg('Project info', 'dim'),
          seg('                           '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                  │', 'dim'),
        ],
        [
          seg(' '),
          seg('│  ', 'dim'),
          seg('↑↓ ', 'accent'),
          seg('navigate   ', 'dim'),
          seg('Enter ', 'accent'),
          seg('select   ', 'dim'),
          seg('1–4 ', 'accent'),
          seg('shortcut', 'dim'),
          seg('                       '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                  │', 'dim'),
        ],
        [
          seg(' '),
          seg('└──────────────────────────────────────────────────────────────────┘', 'dim'),
        ],
      ],
    },
    {
      id: 'scan',
      source: 'captured-session',
      reference:
        'Screen 4 of 4 of the captured session: the OSINT Scanner result after entering the Contract ID and pressing Enter. Screens 2 and 3 (prompt, empty and typed) are not shown.',
      caption: 'Press 1, enter the Contract ID, press Enter',
      lines: [
        [
          seg(' '),
          seg('KUYFI v0.1', 'brand'),
          seg(' · SECURITY TERMINAL · Network: ', 'dim'),
          seg('TESTNET', 'accent'),
          seg(' · ', 'dim'),
          seg('[ESC]', 'accent'),
          seg(' Menu', 'dim'),
        ],
        BLANK,
        [
          seg(' '),
          seg('┌────────────────────────────────────────────────────────────────┐', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                │', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('[ESC] ', 'accent'),
          seg('Back', 'dim'),
          seg('                                                     '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                │', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('┌────────────────────────────────────────────────────────────┐ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│                                                            │ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│ ', 'dim'),
          seg('🛡 ATTACK SURFACE MAP', 'brand'),
          seg(' ─── ', 'dim'),
          seg('CDYUQR...JTPV7', 'id'),
          seg(' ─── ', 'dim'),
          seg('1,700', 'strong'),
          seg(' bytes', 'dim'),
          seg('    '),
          seg('│ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│                                                            │ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│ ', 'dim'),
          seg('✔ Functions found: ', 'ok'),
          seg('3', 'selected'),
          seg('                                       '),
          seg('│ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│                                                            │ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│ ', 'dim'),
          seg('get_value', 'fn'),
          seg('() ', 'accent'),
          seg('→ ', 'brand'),
          seg('Has Return', 'ret'),
          seg('                                   '),
          seg('│ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│ ', 'dim'),
          seg('set_admin_value', 'fn'),
          seg('(', 'accent'),
          seg('admin: Address, value: I128', 'dim'),
          seg(') ', 'accent'),
          seg('→ ', 'brand'),
          seg('Void        ', 'muted'),
          seg('│ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│ ', 'dim'),
          seg('secure_set_admin_value', 'fn'),
          seg('(', 'accent'),
          seg('admin: Address, value: I128', 'dim'),
          seg(') ', 'accent'),
          seg('→ ', 'brand'),
          seg('Void ', 'muted'),
          seg('│ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('│                                                            │ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('└────────────────────────────────────────────────────────────┘ ', 'dim'),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                │', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('─────────────────────────────────────────────', 'dim'),
          seg('                  '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('What do you want to do next?', 'strong'),
          seg('                                   '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                │', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('[S]', 'accent'),
          seg('  Scan another contract', 'dim'),
          seg('                                     '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('[C]', 'accent'),
          seg('  Run Chaos Monkey on this contract', 'dim'),
          seg('                         '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('[M]', 'accent'),
          seg('  Return to main menu', 'dim'),
          seg('                                       '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('[Q]', 'accent'),
          seg('  Quit', 'dim'),
          seg('                                                      '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│ ', 'dim'),
          seg('─────────────────────────────────────────────', 'dim'),
          seg('                  '),
          seg('│', 'dim'),
        ],
        [
          seg(' '),
          seg('│                                                                │', 'dim'),
        ],
        [
          seg(' '),
          seg('└────────────────────────────────────────────────────────────────┘', 'dim'),
        ],
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
