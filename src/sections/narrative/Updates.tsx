import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { SubscribeForm } from '../../components/ui/SubscribeForm'
import { siteCopy } from '../../content/siteCopy'
import styles from './Updates.module.css'

/** Updates: a newsletter for release notes and technical updates, not a waitlist. Kuyfi is public. */
export function Updates() {
  const { updates: copy } = siteCopy

  return (
    <Section id="updates" labelledBy="updates-title" atmosphere="updates">
      <div className={styles.layout}>
        <Reveal className={styles.text}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="updates-title" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{copy.body}</p>
        </Reveal>

        <Reveal className={styles.visual} delay={0.12}>
          <SubscribeForm />
        </Reveal>
      </div>
    </Section>
  )
}
