import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { siteCopy } from '../../content/siteCopy'
import styles from './WhyBlackBox.module.css'

/** Large statement on the left, restrained prose offset to the right, lots of negative space. */
export function WhyBlackBox() {
  const { whyBlackBox: copy } = siteCopy

  return (
    <Section id="why-black-box" labelledBy="why-black-box-title">
      <Reveal className={styles.head}>
        <Kicker>{copy.kicker}</Kicker>
        <h2 id="why-black-box-title" className={styles.heading}>
          {copy.heading}
        </h2>
      </Reveal>

      <Reveal className={styles.prose} delay={0.1}>
        <p className={styles.body}>{copy.body}</p>
        <p className={styles.note}>{copy.note}</p>
      </Reveal>
    </Section>
  )
}
