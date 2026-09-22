import { site } from '../config/site'
import { siteCopy } from './siteCopy'

/**
 * Open Core, ready to render: the words from siteCopy.openCore, joined with the two destinations
 * (facts, not copy). "View on GitHub" goes to the real repository; "Get product updates" is an
 * in-page anchor to the Updates section on this same page, where the subscription form lives.
 */
const { openCore: copy } = siteCopy

export const openCore = {
  kicker: copy.kicker,
  heading: copy.heading,
  intro: copy.intro,
  free: { ...copy.free, href: site.githubUrl },
  planned: { ...copy.planned, href: '#updates' },
  closing: copy.closing,
} as const
