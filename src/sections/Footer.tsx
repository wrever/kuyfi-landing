import { footer } from '../content/footer'
import mark from '../assets/brand/kuyfi-mark.svg'
import styles from './Footer.module.css'

/**
 * The last system panel. Its language is the real Kuyfi TUI, not an editorial footer: a bordered
 * "[ MENU ]" panel, numbered project links in the shape the CLI's own menu rows use, and a
 * terminal-style status echo and warning line, ahead of the version, network context and legal line.
 */
export function Footer() {
  const { statusBar, project, release, network, usage } = footer

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Decorative: two phrases the real CLI prints in its own status bar (see footer.ts). */}
        <p className={styles.status}>
          <span className={styles.statusBrand}>{statusBar.product}</span>
          <span className={styles.dim}> {statusBar.release} &middot; </span>
          <span className={styles.statusRole}>{statusBar.role}</span>
          <span className={styles.dim}> &middot; Network: </span>
          <span className={styles.statusNetwork}>{statusBar.network}</span>
        </p>

        <div className={styles.panel}>
          <span className={styles.tag}>{footer.menuTag}</span>

          <div className={styles.grid}>
            <div className={styles.identity}>
              <img
                className={styles.mark}
                src={mark}
                alt=""
                aria-hidden="true"
                width="65"
                height="80"
              />
              <div>
                <p className={styles.wordmark}>{footer.wordmark}</p>
                <p className={styles.slogan}>{footer.slogan}</p>
              </div>
            </div>

            <nav className={styles.column} aria-labelledby="footer-project">
              <p id="footer-project" className={styles.label}>
                {project.label}
              </p>
              <ul className={styles.menu} role="list">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a className={styles.menuRow} href={link.href}>
                      <span className={styles.index} aria-hidden="true">
                        [{link.index}]
                      </span>
                      <span className={styles.menuText}>
                        <span className={styles.menuName}>{link.name}</span>
                        <span className={styles.menuHost} aria-hidden="true">
                          {link.host}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.column}>
              <p className={styles.label}>{release.label}</p>
              <p className={styles.fact}>{release.version}</p>
              <p className={styles.fact}>{release.license}</p>
            </div>

            <div className={styles.column}>
              <p className={styles.label}>{network.label}</p>
              <p className={styles.factText}>{network.text}</p>
            </div>
          </div>
        </div>

        <div className={styles.warning}>
          <span className={styles.warningMark} aria-hidden="true" />
          <p className={styles.warningText}>
            <span className={styles.warningLabel}>{usage.label}</span> {usage.text}
          </p>
        </div>

        <div className={styles.legal}>
          <p>{footer.copyright}</p>
          <p>{footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
