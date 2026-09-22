import { m, useReducedMotion, type Variants } from 'motion/react'
import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { siteCopy } from '../../content/siteCopy'
import styles from './HowItWorks.module.css'

const EASE = [0.16, 1, 0.3, 1] as const
const STEP_GAP = 0.14 // seconds between one step and the next

/**
 * Progression on entering the viewport: steps appear one after another and each connector draws
 * towards the next step. `--p` is a CSS custom property read by the connector's transform, so the
 * same animation runs along the x axis (wide layout) or the y axis (stacked layout).
 * Without variants applied (reduced motion) the CSS default is `--p: 1`: fully drawn.
 */
const list: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: STEP_GAP, delayChildren: 0.05 } },
}
const step: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
// Connectors are grandchildren of the list, so the list's stagger does not reach them: each one is
// delayed by its own index instead, right after its step has appeared.
const connector: Variants = {
  hidden: { '--p': 0 },
  shown: (index: number) => ({
    '--p': 1,
    transition: { duration: 0.5, delay: 0.05 + index * STEP_GAP + 0.2, ease: EASE },
  }),
}

/** Technical pipeline: horizontal rail on wide screens, stacked rows on small ones. */
export function HowItWorks() {
  const { howItWorks: copy } = siteCopy
  const reduceMotion = useReducedMotion()
  const last = copy.steps.length - 1

  const motionProps = reduceMotion
    ? {}
    : {
        variants: list,
        initial: 'hidden',
        whileInView: 'shown',
        viewport: { once: true, amount: 0.25 },
      }

  return (
    <Section id="how-it-works" labelledBy="how-it-works-title" atmosphere="grid">
      <div className={styles.head}>
        <Reveal className={styles.title}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="how-it-works-title" className={styles.heading}>
            {copy.heading}
          </h2>
        </Reveal>
        <Reveal className={styles.intro} delay={0.1}>
          <p className={styles.body}>{copy.body}</p>
        </Reveal>
      </div>

      <m.ol className={styles.pipeline} role="list" aria-label={copy.listLabel} {...motionProps}>
        {copy.steps.map((item, index) => {
          // A stage name is printed once, on the first step of its group.
          const startsGroup = index === 0 || copy.steps[index - 1].stage !== item.stage
          const isEnd = index === 0 || index === last
          return (
            <m.li
              key={item.label}
              className={styles.step}
              variants={reduceMotion ? undefined : step}
            >
              {/* Decorative: rail, node and connector are hidden from assistive tech. */}
              <span className={styles.rail} aria-hidden="true">
                <span className={isEnd ? `${styles.node} ${styles.nodeEnd}` : styles.node} />
                {index < last && (
                  <m.span
                    className={styles.connector}
                    custom={index}
                    variants={reduceMotion ? undefined : connector}
                  />
                )}
              </span>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.meta}>
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {startsGroup && <span className={styles.stage}>{item.stage}</span>}
              </span>
            </m.li>
          )
        })}
      </m.ol>
    </Section>
  )
}
