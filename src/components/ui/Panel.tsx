import type { ReactNode } from 'react'
import styles from './Panel.module.css'

interface PanelProps {
  title: string
  /** Tag in the header, e.g. "INTERFACE EXAMPLE". */
  tag: string
  /** Line under the body that says what the panel is (and is not). */
  note: string
  /** Faint local light behind the panel. Decoration only. */
  glow?: 'gold' | 'purple'
  children: ReactNode
}

/**
 * Technical panel: thin border, mono header with an explicit "example" tag, groups separated by
 * hairlines. Used for interface examples, never for real output.
 */
export function Panel({ title, tag, note, glow, children }: PanelProps) {
  return (
    <figure className={styles.panel} data-glow={glow}>
      <figcaption className={styles.head}>
        <span className={styles.title}>{title}</span>
        <span className={styles.tag}>{tag}</span>
      </figcaption>
      <div className={styles.body}>{children}</div>
      <p className={styles.note}>{note}</p>
    </figure>
  )
}

/** A labelled block inside a panel. */
export function PanelGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.group}>
      <p className={styles.groupLabel}>{label}</p>
      {children}
    </div>
  )
}
