import styles from './ContentPlaceholder.module.css'

/** Temporary marker after the hero. Not a designed section. */
export function ContentPlaceholder() {
  return (
    <section className={styles.root} aria-label="Placeholder">
      <p className={styles.label}>[ CONTENT CONTINUES ]</p>
    </section>
  )
}
