import { site } from '../config/site'
import { fill } from '../lib/fill'
import { hostContext } from '../lib/url'
import { releaseStatus } from './releaseStatus'
import { siteCopy } from './siteCopy'

/**
 * The footer, ready to render: the site's own final system panel, styled after the real Kuyfi TUI.
 * Links, version, license and year come from config/site.ts through releaseStatus.ts; the words
 * come from siteCopy.footer. Only the three approved links exist: no social accounts, no
 * placeholder pages, nothing without a verified address.
 */
const { footer: copy } = siteCopy

/** Whether to show the link's path next to its host: only the repository's is informative. */
const PROJECT_LINKS = [
  { name: copy.links.github, href: releaseStatus.links.github, withPath: true },
  { name: copy.links.npm, href: releaseStatus.links.npm, withPath: false },
  { name: copy.links.writeup, href: releaseStatus.links.writeup, withPath: false },
] as const

export const footer = {
  brand: copy.brand,
  wordmark: copy.wordmark,
  slogan: siteCopy.closing.line,
  menuTag: copy.menuTag,
  // Decorative header, in the same register as the real terminal's own status bar.
  statusBar: {
    product: copy.brand,
    release: `v${releaseStatus.release}`,
    role: copy.statusRole,
    network: copy.networkTag,
  },
  project: {
    label: copy.productLabel,
    links: PROJECT_LINKS.map((link, index) => ({
      index: index + 1,
      name: link.name,
      href: link.href,
      host: hostContext(link.href, link.withPath),
    })),
  },
  release: {
    label: copy.releaseLabel,
    version: `v${releaseStatus.release}`,
    license: fill(copy.license, { license: releaseStatus.license }),
  },
  network: { label: copy.networkLabel, text: copy.network },
  usage: { label: copy.usageLabel, text: copy.usage },
  copyright: `© ${site.copyrightYear} ${copy.owner}`,
  disclaimer: copy.disclaimer,
} as const
