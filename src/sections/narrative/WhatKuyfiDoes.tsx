import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { siteCopy } from '../../content/siteCopy'
import styles from './WhatKuyfiDoes.module.css'

/** Editorial split: heading and prose on the left, a documentation-style flow on the right. */
export function WhatKuyfiDoes() {
  const { whatKuyfiDoes: copy } = siteCopy

  return (
    <Section id="what-kuyfi-does" labelledBy="what-kuyfi-does-title" atmosphere="lead">
      <div className={styles.split}>
        <Reveal className={styles.text}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="what-kuyfi-does-title" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{copy.body}</p>
        </Reveal>

        <Reveal className={styles.visual} delay={0.12}>
          {/* The rail, nodes and chevrons are CSS only, so a screen reader hears three plain items. */}
          <ol className={styles.flow} role="list" aria-label={copy.flowLabel}>
            {copy.flow.map((step) => (
              <li key={step.term} className={styles.step}>
                <span className={styles.term}>{step.term}</span>
                <span className={styles.detail}>{step.detail}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  )
}
