import { m, type MotionStyle } from 'motion/react'
import { ButtonLink } from '../../components/ui/Button'
import { CopyCommand } from '../../components/ui/CopyCommand'
import { site } from '../../config/site'
import { siteCopy } from '../../content/siteCopy'
import styles from './Hero.module.css'

interface HeroCopyProps {
  /** Scroll-driven styles (opacity/translation). Omitted in the static composition. */
  wordmarkStyle?: MotionStyle
  copyStyle?: MotionStyle
}

export function HeroCopy({ wordmarkStyle, copyStyle }: HeroCopyProps) {
  const { hero } = siteCopy

  return (
    <div className={styles.content}>
      <div className={styles.inner}>
        <m.p className={styles.wordmark} style={wordmarkStyle}>
          KUYFI
        </m.p>
        <m.div className={styles.copy} style={copyStyle}>
          <p className={styles.status}>{hero.eyebrow}</p>
          <h1 id="hero-title" className={styles.headline}>
            {hero.headline}
          </h1>
          <p className={styles.lede}>{hero.lede}</p>
          <div className={styles.actions}>
            <CopyCommand command={site.installCommand} />
            <ButtonLink variant="secondary" href={site.githubUrl}>
              {hero.githubCta}
            </ButtonLink>
            <ButtonLink variant="secondary" href={site.docsUrl}>
              Documentation
            </ButtonLink>
          </div>
          <p className={styles.hint}>
            {hero.thenRun} <code>{site.cliCommand}</code> ·{' '}
            <span className={styles.slogan}>{site.slogan}</span>
          </p>
        </m.div>
      </div>
    </div>
  )
}
