/** Site-wide facts. Single source of truth for links, version and install command. */
export const site = {
  name: 'Kuyfi',
  version: '0.1.0',
  slogan: 'Before the Breach.',
  packageName: '@kuyfi/kuyfi',
  installCommand: 'npm install -g @kuyfi/kuyfi',
  cliCommand: 'kuyfi',
  githubUrl: 'https://github.com/alex0tico/kuyfi',
} as const
