import { m, type MotionStyle } from 'motion/react'
import { ButtonLink } from '../../components/ui/Button'
import { CopyCommand } from '../../components/ui/CopyCommand'
import { site } from '../../config/site'
import styles from './Hero.module.css'

interface HeroCopyProps {
  /** Scroll-driven styles (opacity/translation). Omitted in the static composition. */
  wordmarkStyle?: MotionStyle
  copyStyle?: MotionStyle
}

export function HeroCopy({ wordmarkStyle, copyStyle }: HeroCopyProps) {
  return (
    <div className={styles.content}>
      <div className={styles.inner}>
        <m.p className={styles.wordmark} style={wordmarkStyle}>
          KUYFI
        </m.p>
        <m.div className={styles.copy} style={copyStyle}>
          <p className={styles.status}>v{site.version} · Open source</p>
          <h1 id="hero-title" className={styles.headline}>
            Native black-box security for Soroban.
          </h1>
          <p className={styles.lede}>
            Analyze deployed Soroban contracts from their on-chain interface, without requiring
            source code.
          </p>
          <div className={styles.actions}>
            <CopyCommand command={site.installCommand} />
            <ButtonLink variant="secondary" href={site.githubUrl}>
              View on GitHub
            </ButtonLink>
          </div>
          <p className={styles.hint}>
            Then run <code>{site.cliCommand}</code> ·{' '}
            <span className={styles.slogan}>{site.slogan}</span>
          </p>
        </m.div>
      </div>
    </div>
  )
}
