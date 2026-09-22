import { describe, expect, it } from 'vitest'
import { siteCopy } from './siteCopy'
import { blockText, terminalSession } from './terminalSession'
import { DEFAULT_VIEW, splitSession } from './terminalView'

const { blocks } = terminalSession
const { main, rest } = splitSession(terminalSession)

describe('terminal view: what is on screen by default', () => {
  it('shows the command and the real result screen', () => {
    expect(DEFAULT_VIEW).toEqual(['command', 'scan'])
    expect(main.map((b) => b.id)).toEqual(['command', 'scan'])
    expect(main.map(blockText).join('\n')).toContain('🛡 ATTACK SURFACE MAP')
    expect(main.map(blockText).join('\n')).toContain('✔ Functions found: 3')
  })

  it('keeps the interaction caption with the result, apart from the output', () => {
    expect(main.find((b) => b.id === 'scan')?.caption).toBe(
      'Press 1, enter the Contract ID, press Enter',
    )
  })
})

describe('terminal view: what moves behind "View launch screen"', () => {
  it('is the launch screen, and it is still in the transcript data', () => {
    expect(rest.map((b) => b.id)).toEqual(['menu'])
    expect(blocks.map((b) => b.id)).toContain('menu')
    expect(blockText(blocks.find((b) => b.id === 'menu')!)).toContain('CORE SECURITY MODULE')
    expect(blockText(rest[0])).toContain('[1]  OSINT Scanner')
  })

  it('labels the launch screen as a site annotation and for assistive tech, with no digits', () => {
    const { fullSession, fullRegion, fullCaption } = siteCopy.terminal
    expect(fullSession).toBe('View launch screen')
    expect(fullRegion).toBe('Launch screen of the real Kuyfi CLI session')
    expect(fullCaption).toBe('Launch screen, before choosing a module')
  })
})

describe('terminal view: nothing lost, nothing repeated', () => {
  it('shows every block of the session exactly once between the two views', () => {
    expect([...main, ...rest].map((b) => b.id).sort()).toEqual(blocks.map((b) => b.id).sort())
    expect(main.filter((b) => rest.includes(b))).toEqual([])
  })

  it('leaves the transcript as captured: same blocks, same line counts', () => {
    expect(blocks.map((b) => b.lines.length)).toEqual([1, 17, 28])
    expect(main.reduce((n, b) => n + b.lines.length, 0)).toBe(29)
    expect(rest.reduce((n, b) => n + b.lines.length, 0)).toBe(17)
  })

  it('splits without touching the data: the blocks are the very same objects', () => {
    for (const block of [...main, ...rest]) expect(blocks).toContain(block)
  })
})
