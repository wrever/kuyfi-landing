import { Reveal } from '../../components/motion/Reveal'
import { Section } from '../../components/ui/Section'
import { siteCopy } from '../../content/siteCopy'
import mark from '../../assets/brand/kuyfi-mark.svg'
import styles from './Closing.module.css'

/**
 * The closing moment: the mark, lit through its keyhole, and the line. It explains nothing new.
 * The hero stays the cinematic peak; this is a quiet, static ending in the same atmosphere.
 */
export function Closing() {
  return (
    <Section id="closing" labelledBy="closing-title" atmosphere="closing">
      <Reveal className={styles.stage}>
        {/* Decorative: the existing Kuyfi mark with its background removed. The line names it. */}
        <div className={styles.mark} aria-hidden="true">
          <img className={styles.image} src={mark} alt="" width="650" height="800" />
        </div>
        <h2 id="closing-title" className={styles.line}>
          {siteCopy.closing.line}
        </h2>
        <span className={styles.rule} aria-hidden="true" />
      </Reveal>
    </Section>
  )
}
