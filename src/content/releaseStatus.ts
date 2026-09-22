import { site } from '../config/site'
import { evidence } from './evidence'

/**
 * Factual state of the current Kuyfi release, data only. Nothing here is a new claim:
 *   - version, package, license and URLs come from config/site.ts;
 *   - the product test count and the two validated platforms come from evidence.ts (`project`),
 *     which the owner provided, and releaseStatus.test.ts checks the two agree;
 *   - the Node range is the package's `engines.node`.
 *
 * The tests counted here are Kuyfi's own product tests (@kuyfi/kuyfi), not this landing page's.
 * Validation is stated per platform and never generalised: what was not validated by hand is said so
 * plainly, and nothing says a platform "should work".
 */

export type Validation = 'validated' | 'not-validated'

export interface Platform {
  id: 'macos' | 'windows' | 'linux'
  name: string
  validation: Validation
  /** Terminal used for the manual validation, when it is worth stating. */
  terminal?: string
}

export const releaseStatus = {
  release: site.version,
  package: site.packageName,
  node: '>=20',
  license: site.license,
  productTests: evidence.project.tests,
  platforms: [
    { id: 'macos', name: 'macOS', validation: 'validated' },
    {
      id: 'windows',
      name: 'Windows 11',
      validation: 'validated',
      terminal: 'Windows Terminal / PowerShell',
    },
    { id: 'linux', name: 'Linux', validation: 'not-validated' },
  ] satisfies readonly Platform[],
  /** Where the documented audit evidence of this release was produced. */
  evidenceNetwork: evidence.realAmm.network,
  links: {
    github: site.githubUrl,
    writeup: site.writeupUrl,
    npm: site.npmUrl,
  },
} as const
