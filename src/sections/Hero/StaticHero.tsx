import { HeroCopy } from './HeroCopy'
import { HeroMedia } from './HeroMedia'
import styles from './Hero.module.css'

/**
 * Reduced-motion alternative (also used on very short landscape screens, where the sticky dive
 * would clip the copy). A single, coherent still composition: frame-1, all copy visible.
 * No scroll-linked motion, no video, no parallax, no bloom.
 */
export function StaticHero() {
  return (
    <section className={styles.rigStatic} aria-labelledby="hero-title">
      <div className={styles.stageStatic}>
        <div className={`${styles.camera} ${styles.cameraStatic}`}>
          <HeroMedia />
        </div>
        <div className={styles.scrim} aria-hidden="true" />
        <HeroCopy />
      </div>
    </section>
  )
}
