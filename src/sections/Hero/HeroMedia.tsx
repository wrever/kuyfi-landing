import type { RefObject } from 'react'
import { m, type MotionValue } from 'motion/react'
import heroVideo from '../../assets/hero/kuyfi-hero-loop.mp4'
import frame1 from '../../assets/hero/kuyfi-frame-1.png'
import frame1Avif from '../../assets/hero/kuyfi-frame-1.avif'
import frame1Webp from '../../assets/hero/kuyfi-frame-1.webp'
// frame-2 has no <picture>: it is the target of the crossfade's opacity animation, which needs one
// element. Its PNG master stays on disk (source of the derivative below) but is not imported here.
import frame2Webp from '../../assets/hero/kuyfi-frame-2.webp'
import styles from './Hero.module.css'

interface HeroMediaProps {
  /** Given together with `frame2Opacity` for the animated hero; omit both for the static one. */
  videoRef?: RefObject<HTMLVideoElement | null>
  frame2Opacity?: MotionValue<number>
}

const FRAME = { width: 1672, height: 941 } as const

/**
 * The scene, bottom to top: frame-1 (also the video poster and fallback) → native video →
 * frame-2 (brighter keyhole, crossfaded in by scroll).
 * Without `videoRef`/`frame2Opacity` (reduced motion / short landscape) only the static frame-1 is
 * rendered: no video is fetched or played, and frame-2 is never downloaded.
 *
 * frame-1 is a <picture> (AVIF, then WebP, then the original PNG): about 98% smaller in either
 * compressed format, visually unchanged (checked against the PNG at matching settings; SSIM > 0.98
 * territory for this kind of image is imperceptible, and dark, low-detail frames like this one
 * compress unusually well). `.picture` is `display: contents` so the inner <img> keeps the same
 * absolute layer positioning it would have as a direct child of `.media`.
 */
export function HeroMedia({ videoRef, frame2Opacity }: HeroMediaProps) {
  const animated = videoRef !== undefined && frame2Opacity !== undefined

  return (
    <div className={styles.media} aria-hidden="true">
      <picture className={styles.picture}>
        <source srcSet={frame1Avif} type="image/avif" />
        <source srcSet={frame1Webp} type="image/webp" />
        <img
          className={styles.layer}
          src={frame1}
          alt=""
          decoding="async"
          fetchPriority="high"
          {...FRAME}
        />
      </picture>
      {animated && (
        <>
          <video
            ref={videoRef}
            className={styles.layer}
            src={heroVideo}
            poster={frame1Webp}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
          />
          <m.img
            className={styles.layer}
            src={frame2Webp}
            alt=""
            decoding="async"
            fetchPriority="low"
            style={{ opacity: frame2Opacity }}
            {...FRAME}
          />
        </>
      )}
    </div>
  )
}
