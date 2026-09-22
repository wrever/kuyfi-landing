import { useRef, type CSSProperties } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import type { TerminalBlock, TerminalLine, TerminalSession } from '../../content/terminalSession'
import { splitSession } from '../../content/terminalView'
import styles from './Terminal.module.css'

interface TerminalProps {
  session: TerminalSession
  /** Accessible name of the transcript region. */
  label: string
  /** Tag in the header, e.g. "REAL CLI SESSION". */
  tag: string
  /** Line under the terminal that says where the transcript comes from. */
  note: string
  /** The part of the real session kept behind a native disclosure. */
  fullSession: {
    /** Text of the summary, e.g. "View full session". */
    summary: string
    /** Accessible name of the region inside, which shows only what the main view leaves out. */
    region: string
    /** Site annotation above that screen. Not CLI output. */
    caption: string
  }
}

/** Position of a line in the reveal sequence. Read by CSS as `--i`. */
function order(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}

/**
 * Code points IBM Plex Mono's Latin subset covers: U+0020 to U+00FF, general punctuation
 * U+2010 to U+2027, and the up and down arrows. Everything else (box drawing, the check mark, the
 * right arrow, emoji) falls back to another font.
 */
function inPlex(codePoint: number): boolean {
  return (
    (codePoint >= 0x20 && codePoint <= 0xff) ||
    (codePoint >= 0x2010 && codePoint <= 0x2027) ||
    codePoint === 0x2191 ||
    codePoint === 0x2193
  )
}

interface Piece {
  text: string
  /** Terminal cells the piece occupies, when it is set outside Plex Mono. */
  cells?: number
}

/**
 * A terminal is a grid. Each run of characters outside Plex Mono is set in a cell of exact width
 * (1ch per character, 2ch for an emoji, as a terminal draws it), so whatever the fallback font
 * measures, the rest of the line and the right border of a box stay on the grid.
 */
function pieces(text: string): Piece[] {
  const out: Piece[] = []
  for (const char of text) {
    const codePoint = char.codePointAt(0)!
    const outside = !inPlex(codePoint)
    const last = out.at(-1)
    if (last && (last.cells !== undefined) === outside) {
      last.text += char
      if (outside) last.cells! += codePoint > 0xffff ? 2 : 1
    } else {
      out.push(outside ? { text: char, cells: codePoint > 0xffff ? 2 : 1 } : { text: char })
    }
  }
  return out
}

/** A segment made only of box-drawing characters and spaces: a frame, not content. */
const isFrame = (text: string) => /^[\s┌┐└┘─│]*[┌┐└┘─│][\s┌┐└┘─│]*$/u.test(text)

function Text({ text }: { text: string }) {
  return pieces(text).map((piece, i) =>
    piece.cells === undefined ? (
      piece.text
    ) : (
      <span key={i} className={styles.cells} style={{ width: `${piece.cells}ch` }}>
        {piece.text}
      </span>
    ),
  )
}

function Line({ line, index }: { line: TerminalLine; index: number }) {
  if (line.length === 0) {
    return <span className={`${styles.line} ${styles.blank}`} style={order(index)} />
  }

  return (
    <span className={styles.line} style={order(index)}>
      {line.map((part, i) => (
        <span
          key={i}
          className={part.role ? styles[part.role] : undefined}
          aria-hidden={isFrame(part.text) || undefined}
        >
          <Text text={part.text} />
        </span>
      ))}
    </span>
  )
}

function Block({ block, start }: { block: TerminalBlock; start: number }) {
  let index = start
  return (
    <div className={styles.block} data-block={block.id}>
      {block.caption && (
        <span className={styles.caption} style={order(index++)}>
          {block.caption}
        </span>
      )}
      {block.lines.map((line, i) => (
        <Line key={i} line={line} index={index++} />
      ))}
    </div>
  )
}

/** Lines a block puts on screen: its lines, plus its caption. */
const weight = (block: TerminalBlock) => block.lines.length + (block.caption ? 1 : 0)

/**
 * Terminal for a real, recorded CLI session. The main view shows the command and the result screen;
 * the rest of the session is one native disclosure away, in the same transcript order and never
 * repeated. The whole transcript is always in the DOM as text.
 *
 * The main view reveals once, when the terminal reaches the viewport (opacity only, staggered in
 * transcript order) and is not hidden at all with reduced motion. Everything is a scroll region
 * (focusable), so narrow screens scroll it sideways instead of shrinking the type.
 */
export function Terminal({ session, label, tag, note, fullSession }: TerminalProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -18% 0px' })
  const reduceMotion = useReducedMotion()
  const state = reduceMotion || inView ? 'shown' : 'pending'

  const { meta } = session
  const { main, rest } = splitSession(session)

  /** Where each block begins in the reveal sequence: the lines and captions before it. */
  const starts = main.map((_, i) => main.slice(0, i).reduce((n, block) => n + weight(block), 0))

  return (
    <figure ref={ref} className={styles.terminal} data-state={state}>
      <div className={styles.window}>
        <header className={styles.bar}>
          <p className={styles.identity}>
            <span className={styles.product}>{meta.product}</span>
            <span className={styles.version}>
              {meta.package} {meta.version}
            </span>
          </p>
          <p className={styles.tags}>
            <span className={styles.network}>{meta.network}</span>
            <span className={styles.tag}>{tag}</span>
          </p>
        </header>

        <div role="region" aria-label={label} tabIndex={0} className={styles.screen}>
          <div className={styles.transcript}>
            {main.map((block, i) => (
              <Block key={block.id} block={block} start={starts[i]} />
            ))}
          </div>
        </div>

        {rest.length > 0 && (
          <details className={styles.session}>
            <summary className={styles.summary}>{fullSession.summary}</summary>
            <div
              role="region"
              aria-label={fullSession.region}
              tabIndex={0}
              className={`${styles.screen} ${styles.sessionScreen}`}
            >
              <div className={styles.transcript}>
                <span className={styles.caption}>{fullSession.caption}</span>
                {rest.map((block) => (
                  <Block key={block.id} block={block} start={0} />
                ))}
              </div>
            </div>
          </details>
        )}
      </div>

      <figcaption className={styles.note}>{note}</figcaption>
    </figure>
  )
}
