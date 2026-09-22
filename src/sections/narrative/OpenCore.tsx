import { Reveal } from '../../components/motion/Reveal'
import { ButtonLink } from '../../components/ui/Button'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { openCore } from '../../content/openCore'
import styles from './OpenCore.module.css'

/**
 * The product model: what is open source today, and what a future paid layer might add on top of
 * the same engine. Two panels, not three equal cards, in the site's own gold/purple language: gold
 * for what ships today, purple's dashed mark for what is only a direction under consideration.
 */
export function OpenCore() {
  const { free, planned } = openCore

  return (
    <Section id="open-core" labelledBy="open-core-title" atmosphere="openCore">
      <Reveal className={styles.head}>
        <Kicker>{openCore.kicker}</Kicker>
        <h2 id="open-core-title" className={styles.heading}>
          {openCore.heading}
        </h2>
        <p className={styles.intro}>{openCore.intro}</p>
      </Reveal>

      <div className={styles.panels}>
        <Reveal className={styles.panel} delay={0.06}>
          <p className={`${styles.panelKicker} ${styles.free}`}>{free.kicker}</p>
          <h3 className={styles.panelTitle}>{free.title}</h3>
          <ul className={`${styles.items} ${styles.shipped}`} role="list">
            {free.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ButtonLink variant="primary" href={free.href} className={styles.cta}>
            {free.cta}
          </ButtonLink>
        </Reveal>

        <Reveal className={`${styles.panel} ${styles.plannedPanel}`} delay={0.12}>
          <p className={`${styles.panelKicker} ${styles.planned}`}>{planned.kicker}</p>
          <h3 className={styles.panelTitle}>{planned.title}</h3>
          <ul className={`${styles.items} ${styles.exploring}`} role="list">
            {planned.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.note}>{planned.note}</p>
          <ButtonLink variant="secondary" href={planned.href} className={styles.cta}>
            {planned.cta}
          </ButtonLink>
        </Reveal>
      </div>

      <Reveal>
        <p className={styles.closing}>{openCore.closing}</p>
      </Reveal>
    </Section>
  )
}
