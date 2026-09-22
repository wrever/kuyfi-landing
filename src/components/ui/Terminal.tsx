import { useRef, type CSSProperties } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import type { TerminalLine, TerminalSession } from '../../content/terminalSession'
import styles from './Terminal.module.css'

interface TerminalProps {
  session: TerminalSession
  /** Accessible name of the transcript region. */
  label: string
  /** Tag in the header, e.g. "REAL CLI SESSION". */
  tag: string
  /** Line under the terminal that says where the excerpt comes from. */
  note: string
}

/** Position of a line in the reveal sequence. Read by CSS as `--i`. */
function order(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}

function Line({ line, index }: { line: TerminalLine; index: number }) {
  if (line.length === 0) {
    return <span className={`${styles.line} ${styles.blank}`} style={order(index)} />
  }

  return (
    <span className={styles.line} style={order(index)}>
      {line.map((part, i) => (
        <span key={i} className={part.role ? styles[part.role] : undefined}>
          {part.text}
        </span>
      ))}
    </span>
  )
}

/**
 * Terminal for a real, recorded CLI session. The whole transcript is always in the DOM, in reading
 * order, as text: the reveal only changes opacity, once, when the terminal reaches the viewport, and
 * is skipped entirely with reduced motion. The transcript is a scroll region (focusable) so narrow
 * screens scroll it sideways instead of shrinking the type.
 */
export function Terminal({ session, label, tag, note }: TerminalProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -18% 0px' })
  const reduceMotion = useReducedMotion()
  const state = reduceMotion || inView ? 'shown' : 'pending'

  const { meta, blocks } = session
  let index = 0

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
            {blocks.map((block) => (
              <div key={block.id} className={styles.block} data-block={block.id}>
                {block.caption && (
                  <span className={styles.caption} style={order(index++)}>
                    {block.caption}
                  </span>
                )}
                {block.lines.map((line, i) => (
                  <Line key={i} line={line} index={index++} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <figcaption className={styles.note}>{note}</figcaption>
    </figure>
  )
}
