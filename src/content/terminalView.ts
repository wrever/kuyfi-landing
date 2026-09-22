import type { TerminalBlock, TerminalSession } from './terminalSession'

/**
 * How the captured session is laid out on the page. This is presentation only: the transcript itself
 * lives in terminalSession.ts and is never copied or edited here.
 *
 * By default the terminal shows the command and the real result screen, because that screen is the
 * one that demonstrates the product. Every other block of the captured session (the launch screen)
 * goes behind "View launch screen". Together they are the whole transcript, each block in exactly one
 * place, so nothing is duplicated for assistive tech.
 */
export const DEFAULT_VIEW: readonly TerminalBlock['id'][] = ['command', 'scan']

export interface SplitSession {
  /** Shown as soon as the terminal is on screen. */
  main: readonly TerminalBlock[]
  /** The rest of the real session, behind the disclosure. In transcript order. */
  rest: readonly TerminalBlock[]
}

export function splitSession(
  session: TerminalSession,
  view: readonly TerminalBlock['id'][] = DEFAULT_VIEW,
): SplitSession {
  return {
    main: session.blocks.filter((block) => view.includes(block.id)),
    rest: session.blocks.filter((block) => !view.includes(block.id)),
  }
}
