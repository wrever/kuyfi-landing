import type { RefObject } from 'react'
import { m, type MotionValue } from 'motion/react'
import heroVideo from '../../assets/hero/kuyfi-hero-loop.mp4'
import frame1 from '../../assets/hero/kuyfi-frame-1.png'
import frame2 from '../../assets/hero/kuyfi-frame-2.png'
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
 */
export function HeroMedia({ videoRef, frame2Opacity }: HeroMediaProps) {
  const animated = videoRef !== undefined && frame2Opacity !== undefined

  return (
    <div className={styles.media} aria-hidden="true">
      <img
        className={styles.layer}
        src={frame1}
        alt=""
        decoding="async"
        fetchPriority="high"
        {...FRAME}
      />
      {animated && (
        <>
          <video
            ref={videoRef}
            className={styles.layer}
            src={heroVideo}
            poster={frame1}
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
            src={frame2}
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
