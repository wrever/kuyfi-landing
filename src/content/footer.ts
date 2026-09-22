import { site } from '../config/site'
import { fill } from '../lib/fill'
import { releaseStatus } from './releaseStatus'
import { siteCopy } from './siteCopy'

/**
 * The footer, ready to render. Links, version, license and year come from config/site.ts through
 * releaseStatus.ts; the words come from siteCopy.footer. Only these three links exist: no social
 * accounts, no placeholder pages, nothing without a verified address.
 */
const { footer: copy } = siteCopy

export const footer = {
  brand: copy.brand,
  slogan: siteCopy.closing.line,
  product: {
    label: copy.productLabel,
    links: [
      { name: copy.links.github, href: releaseStatus.links.github },
      { name: copy.links.npm, href: releaseStatus.links.npm },
      { name: copy.links.writeup, href: releaseStatus.links.writeup },
    ],
  },
  version: {
    label: copy.versionLabel,
    release: `v${releaseStatus.release}`,
    license: fill(copy.license, { license: releaseStatus.license }),
  },
  network: { label: copy.networkLabel, text: copy.network },
  copyright: `© ${site.copyrightYear} ${copy.owner}`,
  disclaimer: copy.disclaimer,
} as const
