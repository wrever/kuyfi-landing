import { useEffect, useRef } from 'react'
import { m, useScroll, useSpring, useTransform } from 'motion/react'
import { useHeroVideoPlayback } from '../../hooks/useHeroVideoPlayback'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePointerParallax } from '../../hooks/usePointerParallax'
import {
  HERO_SPRING,
  bloomOpacity,
  copyInteractive,
  copyOpacity,
  copyShift,
  dive,
  diveProgress,
  exitInk,
  exitTint,
  frame2Opacity,
  parallaxFalloff,
  wordmarkOpacity,
  wordmarkShift,
} from '../../lib/heroTimeline'
import { HeroCopy } from './HeroCopy'
import { HeroMedia } from './HeroMedia'
import styles from './Hero.module.css'

/**
 * The scroll-driven hero.
 *
 *   scrollYProgress (0 → 1 over the sticky rig) → useSpring → useTransform → style
 *
 * Everything downstream is a MotionValue written straight to the DOM: no React re-render per
 * scroll frame, no scroll listener of our own, no perpetual requestAnimationFrame. The spring only
 * runs while it is moving. Progress is a pure function of scroll position, so scrolling back up
 * reverses the hero exactly.
 */
export function ScrollDive() {
  const rigRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({ target: rigRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, HERO_SPRING)

  // On reload mid-page, start where the scroll is instead of springing up from 0.
  useEffect(() => {
    progress.jump(scrollYProgress.get())
    let first = true
    return scrollYProgress.on('change', (value) => {
      if (first) {
        first = false
        progress.jump(value)
      }
    })
  }, [progress, scrollYProgress])

  // The dive occupies the first DIVE_END of the rig; `p` is its own 0 → 1 progress.
  const p = useTransform(progress, (v) => diveProgress(v))

  // ── Camera ──
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const pointer = usePointerParallax(finePointer)
  // Same composition as v2: scale outermost, translation inside it (so it scales with the camera).
  // The computed form of useTransform re-runs only when a MotionValue it reads changes.
  const cameraTransform = useTransform(() => {
    const falloff = parallaxFalloff(p.get())
    const x = pointer.x.get() * falloff
    const y = pointer.y.get() * falloff
    return `scale(${dive(p.get()).toFixed(4)}) translate3d(calc(var(--camera-shift) + ${x.toFixed(2)}px), ${y.toFixed(2)}px, 0)`
  })

  // ── Crossfade + bloom ──
  const frame2 = useTransform(p, (t) => frame2Opacity(t))
  const bloom = useTransform(p, (t) => bloomOpacity(t))

  // ── Exit: plum tint, then ink (functions of the raw rig progress) ──
  const tint = useTransform(progress, (v) => exitTint(v))
  const ink = useTransform(progress, (v) => exitInk(v))

  // ── Copy ──
  const wordmarkOpacityMV = useTransform(p, (t) => wordmarkOpacity(t))
  const wordmarkY = useTransform(p, (t) => `${wordmarkShift(t).toFixed(2)}vh`)
  const copyOpacityMV = useTransform(p, (t) => copyOpacity(t))
  const copyY = useTransform(p, (t) => `${copyShift(t).toFixed(2)}vh`)
  // Invisible copy must not stay clickable or focusable.
  const copyVisibility = useTransform(p, (t) => (copyInteractive(t) ? 'visible' : 'hidden'))
  const copyPointer = useTransform(p, (t) => (copyInteractive(t) ? 'auto' : 'none'))

  useHeroVideoPlayback(videoRef, p)

  return (
    <>
      <section ref={rigRef} className={styles.rig} aria-labelledby="hero-title">
        <div className={styles.stage}>
          <m.div className={styles.camera} style={{ transform: cameraTransform }}>
            <HeroMedia videoRef={videoRef} frame2Opacity={frame2} />
          </m.div>
          <div className={styles.scrim} aria-hidden="true" />
          <m.div className={styles.bloom} style={{ opacity: bloom }} aria-hidden="true" />
          <m.div className={styles.exitTint} style={{ opacity: tint }} aria-hidden="true" />
          <m.div className={styles.exitInk} style={{ opacity: ink }} aria-hidden="true" />
          <HeroCopy
            wordmarkStyle={{ opacity: wordmarkOpacityMV, y: wordmarkY }}
            copyStyle={{
              opacity: copyOpacityMV,
              y: copyY,
              visibility: copyVisibility,
              pointerEvents: copyPointer,
            }}
          />
        </div>
      </section>
    </>
  )
}
