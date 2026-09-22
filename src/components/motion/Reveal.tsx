import type { ReactNode } from 'react'
import { m, useReducedMotion } from 'motion/react'

interface RevealProps {
  children: ReactNode
  /** Seconds. Used to offset a second block a little after the first. */
  delay?: number
  className?: string
}

/**
 * The only reveal used by the narrative sections: a short fade with a small rise, once, when the
 * block reaches the viewport. With reduced motion it renders plain content: no initial state, no
 * animation, nothing hidden.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  )
}
