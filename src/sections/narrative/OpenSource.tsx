import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { releaseStatus, type Platform } from '../../content/releaseStatus'
import { siteCopy } from '../../content/siteCopy'
import { fill } from '../../lib/fill'
import styles from './OpenSource.module.css'

const { openSource: copy } = siteCopy
const { status } = copy
const values = { version: `v${releaseStatus.release}`, license: releaseStatus.license }

/**
 * Short context under a link: the host, and for the repository its path too. It is metadata, not the
 * link text, so a long address never becomes the dominant thing on a phone. The href is untouched.
 */
function context(url: string, withPath = false): string {
  const { hostname, pathname } = new URL(url)
  return hostname.replace(/^www\./, '') + (withPath ? pathname : '')
}

const { github, writeup, npm } = releaseStatus.links
const links = [
  { ...copy.links.github, href: github, meta: context(github, true) },
  { ...copy.links.writeup, href: writeup, meta: context(writeup) },
  { ...copy.links.npm, href: npm, meta: context(npm) },
]

function PlatformValue({ platform }: { platform: Platform }) {
  const validated = platform.validation === 'validated'

  return (
    <>
      {/* Shape, dash style and the words all say it; colour only reinforces it. */}
      <span className={styles.state} data-validation={platform.validation}>
        <span className={styles.marker} aria-hidden="true" />
        {validated ? status.validated : status.notValidated}
      </span>
      <span className={styles.detail}>{fill(status.forRelease, values)}</span>
      {platform.terminal && <span className={styles.detail}>{platform.terminal}</span>}
    </>
  )
}

/** Open source: editorial text and real links, then a compact, factual status table. */
export function OpenSource() {
  const { productTests } = releaseStatus

  return (
    <Section id="open-source" labelledBy="open-source-title" atmosphere="source">
      <div className={styles.top}>
        <Reveal className={styles.text}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="open-source-title" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{fill(copy.body, values)}</p>
        </Reveal>

        <Reveal className={styles.links} delay={0.1}>
          <p className={styles.linksLabel}>{copy.linksLabel}</p>
          <ul className={styles.linkList} role="list">
            {links.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href} aria-label={link.accessibleName}>
                  <span className={styles.linkText}>
                    <span className={styles.linkKind}>{link.label}</span>
                    <span className={styles.linkLabel}>{link.name}</span>
                    <span className={styles.linkUrl} aria-hidden="true">
                      {link.meta}
                    </span>
                  </span>
                  <svg className={styles.arrow} viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 9.5 9.5 2.5M3.5 2.5h6v6" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className={styles.status} delay={0.06}>
        <h3 className={styles.statusHeading}>{status.heading}</h3>
        <div className={styles.rows}>
          <dl className={styles.column}>
            <div className={styles.row}>
              <dt>{status.rows.release}</dt>
              <dd>v{releaseStatus.release}</dd>
            </div>
            <div className={styles.row}>
              <dt>{status.rows.package}</dt>
              <dd>{releaseStatus.package}</dd>
            </div>
            <div className={styles.row}>
              <dt>{status.rows.node}</dt>
              <dd>{releaseStatus.node}</dd>
            </div>
            <div className={styles.row}>
              <dt>{status.rows.license}</dt>
              <dd>{releaseStatus.license}</dd>
            </div>
          </dl>
          <dl className={styles.column}>
            <div className={styles.row}>
              <dt>{status.rows.tests}</dt>
              <dd>
                {productTests.passing} / {productTests.total}
                <span className={styles.detail}>{fill(status.testsNote, values)}</span>
              </dd>
            </div>
            {releaseStatus.platforms.map((platform) => (
              <div key={platform.id} className={styles.row}>
                <dt>{platform.name.toUpperCase()}</dt>
                <dd>
                  <PlatformValue platform={platform} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={styles.notes}>
          <p>{status.network}</p>
          <p>{status.limitations}</p>
        </div>
      </Reveal>
    </Section>
  )
}
