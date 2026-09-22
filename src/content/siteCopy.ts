import { site } from '../config/site'

/**
 * Landing copy: central editorial source. Draft direction, not yet rendered except `hero`.
 *
 * Style guide (enforced by siteCopy.test.ts):
 *   - English. No emojis. No em dash as a writing device; use commas, periods, semicolons, connectors.
 *   - Technical, calm, precise, developer-oriented. Explain Kuyfi; do not try to impress.
 *   - Avoid landing-page buzzwords (revolutionary, seamless, unlock, ...) and artificial fragments
 *     ("No source.", "Full security.").
 *
 * Security language, always:
 *   finding is not a confirmed vulnerability;
 *   0 findings is not proof of security;
 *   a coverage gap is not safety.
 * Never conclude that a contract is "secure", "safe", "fully audited" or has "no vulnerabilities".
 *
 * Evidence is intentionally absent. src/content/evidence.ts remains the source of truth, and no
 * numbers from it are surfaced until the Evidence section is designed deliberately.
 *
 * `workingTitle` values come from the editorial brief and are not final headings.
 */
export const siteCopy = {
  hero: {
    eyebrow: `v${site.version} · Open Source`,
    headline: 'Black-box security for Soroban.',
    lede:
      'Kuyfi analyzes deployed Soroban contracts from their on-chain interface, so you can inspect ' +
      'their attack surface, exercise inputs and review execution traces without requiring the ' +
      'source code.',
    githubCta: 'View on GitHub',
    thenRun: 'Then run',
  },

  whatKuyfiDoes: {
    workingTitle: 'What Kuyfi does',
    body:
      'Kuyfi starts with a Contract ID. It reads the deployed contract specification, ' +
      'reconstructs the callable surface and prepares the information needed for testing. The ' +
      'process begins from what is actually deployed on Stellar, rather than from a source ' +
      'repository.',
  },

  howItWorks: {
    workingTitle: 'How it works',
    body:
      'The OSINT Scanner maps functions, arguments and user-defined types first. Chaos Monkey ' +
      'then generates type-aware inputs, simulates execution and classifies the resulting ' +
      'traces. When an execution reaches the network, Kuyfi preserves the available transaction ' +
      'evidence alongside the report.',
  },

  osintScanner: {
    workingTitle: 'OSINT Scanner',
    body:
      'Before testing a contract, Kuyfi needs to understand what is exposed. The scanner reads ' +
      'the deployed specification and reconstructs the functions, parameters and custom types ' +
      "that define the contract's callable surface.",
  },

  chaosMonkey: {
    workingTitle: 'Chaos Monkey',
    body:
      'Once the surface is known, Chaos Monkey generates inputs that respect Soroban types and ' +
      'explores boundary, authorization, ordering, fee and liquidity-related scenarios. ' +
      'Execution results are classified conservatively when the available context is ambiguous.',
  },

  reporting: {
    workingTitle: 'Reporting',
    body:
      'Each run can be exported as JSON or PDF. Reports preserve the findings produced during ' +
      'the audit together with execution metadata and representative transaction evidence when ' +
      'it is available.',
  },

  install: {
    workingTitle: 'Install',
    body:
      'Kuyfi is open source and available through npm. Install it globally, provide a Soroban ' +
      'Contract ID and run the security terminal from your own environment.',
    command: site.installCommand,
    then: site.cliCommand,
    requirement: 'Node.js 20+',
  },

  openSource: {
    workingTitle: 'Open source',
    body:
      'The source code, architecture, release history and technical write-up are public. Kuyfi ' +
      'is released under the MIT license and its current limitations are documented alongside ' +
      'the implementation.',
  },

  updates: {
    heading: 'Follow Kuyfi development.',
    body: 'Receive release notes, technical updates and new audit experiments by email.',
    // Will connect to Buttondown through /api/subscribe. No form is implemented yet.
  },

  closing: {
    line: site.slogan,
  },
} as const
