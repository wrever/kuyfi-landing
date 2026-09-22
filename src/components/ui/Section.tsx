import type { ReactNode } from 'react'
import styles from './Section.module.css'

/** Which static atmosphere a section sits in. Defined per section in Section.module.css. */
export type Atmosphere =
  | 'lead'
  | 'void'
  | 'grid'
  | 'osint'
  | 'chaos'
  | 'terminal'
  | 'evidence'
  | 'install'
  | 'source'
  | 'openCore'
  | 'updates'
  | 'closing'

interface SectionProps {
  id: string
  /** id of the section's h2. */
  labelledBy: string
  atmosphere?: Atmosphere
  children: ReactNode
}

/**
 * Page section: full-bleed ink with a static atmosphere behind it, content held to the site
 * container. Nothing in the atmosphere is interactive or animated.
 */
export function Section({ id, labelledBy, atmosphere, children }: SectionProps) {
  const className = atmosphere ? `${styles.section} ${styles[atmosphere]}` : styles.section

  return (
    <section id={id} className={className} aria-labelledby={labelledBy}>
      <div className={styles.inner}>{children}</div>
    </section>
  )
}
