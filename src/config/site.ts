/** Site-wide facts. Single source of truth for links, version, license and install command. */
export const site = {
  name: 'Kuyfi',
  version: '0.1.0',
  slogan: 'Before the Breach.',
  packageName: '@kuyfi/kuyfi',
  installCommand: 'npm install -g @kuyfi/kuyfi',
  cliCommand: 'kuyfi',
  license: 'MIT',
  copyrightYear: 2026,
  githubUrl: 'https://github.com/alex0tico/kuyfi',
  npmUrl: 'https://www.npmjs.com/package/@kuyfi/kuyfi',
  writeupUrl: 'https://github.com/alex0tico/kuyfi/blob/main/docs/technical-writeup.md',
  /** Product documentation (Astro site synced into public/docs). */
  docsUrl: '/docs/',
} as const
