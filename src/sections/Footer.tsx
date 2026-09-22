import { footer } from '../content/footer'
import styles from './Footer.module.css'

/** The last system panel: brand, three real links, version and license, the network context. */
export function Footer() {
  const { product, version, network } = footer

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.frame}>
          <p className={styles.bar}>
            <span className={styles.brand}>{footer.brand}</span>
            <span className={styles.slogan}>{footer.slogan}</span>
          </p>

          <div className={styles.groups}>
            <nav className={styles.group} aria-labelledby="footer-product">
              <p id="footer-product" className={styles.label}>
                {product.label}
              </p>
              <ul className={styles.links} role="list">
                {product.links.map((link) => (
                  <li key={link.href}>
                    <a className={styles.link} href={link.href}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.group}>
              <p className={styles.label}>{version.label}</p>
              <p className={styles.value}>{version.release}</p>
              <p className={styles.value}>{version.license}</p>
            </div>

            <div className={styles.group}>
              <p className={styles.label}>{network.label}</p>
              <p className={styles.text}>{network.text}</p>
            </div>
          </div>

          <div className={styles.legal}>
            <p>{footer.copyright}</p>
            <p>{footer.disclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
