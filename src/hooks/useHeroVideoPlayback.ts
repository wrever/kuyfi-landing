import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { videoCovered } from '../lib/heroTimeline'

/**
 * Pauses the hero video when it cannot be seen, and resumes it when it can:
 *   - the hero has scrolled out of the viewport, or
 *   - frame-2 fully covers the video (deep into the dive).
 * Playback itself is native (autoplay/muted/loop/playsInline) — this only avoids decoding frames
 * nobody sees. It reacts to changes; there is no watchdog, interval or animation-frame loop.
 */
export function useHeroVideoPlayback(
  videoRef: RefObject<HTMLVideoElement | null>,
  progress: MotionValue<number>,
) {
  const inView = useRef(true)
  const covered = useRef(false)

  const sync = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (inView.current && !covered.current) {
      if (video.paused) video.play().catch(() => {})
    } else if (!video.paused) {
      video.pause()
    }
  }, [videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    covered.current = videoCovered(progress.get())
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting
      sync()
    })
    observer.observe(video)
    return () => observer.disconnect()
  }, [videoRef, progress, sync])

  useMotionValueEvent(progress, 'change', (p) => {
    const next = videoCovered(p)
    if (next !== covered.current) {
      covered.current = next
      sync()
    }
  })
}
