import { useReducedMotion } from 'motion/react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ScrollDive } from './ScrollDive'
import { StaticHero } from './StaticHero'

export function Hero() {
  const reduceMotion = useReducedMotion()
  // A landscape phone is too short for the sticky dive: the copy would be clipped.
  const shortLandscape = useMediaQuery('(orientation: landscape) and (max-height: 520px)')

  return reduceMotion || shortLandscape ? <StaticHero /> : <ScrollDive />
}
