import styles from './Kicker.module.css'

/** Working label above a heading, e.g. "[ 01 · WHAT KUYFI DOES ]". */
export function Kicker({ children }: { children: string }) {
  return <p className={styles.kicker}>{children}</p>
}
