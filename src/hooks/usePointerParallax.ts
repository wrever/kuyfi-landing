import { useEffect } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import { POINTER_RANGE, POINTER_SPRING, pointerOffset } from '../lib/heroTimeline'

/**
 * Smoothed pointer offsets (px). One passive `pointermove` listener that only writes to
 * MotionValues — no React state, no render loop; the springs run only while they are moving.
 * Touch pointers are ignored; when `enabled` is false the offsets rest at 0.
 */
export function usePointerParallax(enabled: boolean) {
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)

  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      targetX.set(pointerOffset(e.clientX, window.innerWidth, POINTER_RANGE.x))
      targetY.set(pointerOffset(e.clientY, window.innerHeight, POINTER_RANGE.y))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      targetX.set(0)
      targetY.set(0)
    }
  }, [enabled, targetX, targetY])

  return {
    x: useSpring(targetX, POINTER_SPRING),
    y: useSpring(targetY, POINTER_SPRING),
  }
}
