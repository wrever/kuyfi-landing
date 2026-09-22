import type { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  id: string
  /** id of the section's h2. */
  labelledBy: string
  children: ReactNode
}

/** Page section: full-bleed ink, content held to the site container. */
export function Section({ id, labelledBy, children }: SectionProps) {
  return (
    <section id={id} className={styles.section} aria-labelledby={labelledBy}>
      <div className={styles.inner}>{children}</div>
    </section>
  )
}
