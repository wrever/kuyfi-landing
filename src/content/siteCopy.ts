import { site } from '../config/site'

/**
 * Landing copy: central editorial source. Rendered so far: `hero` and the core narrative
 * (`whatKuyfiDoes`, `whyBlackBox`, `howItWorks`, `osintScanner`, `chaosMonkey`, `terminal`). Later sections are
 * still draft direction.
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
 * `workingTitle` values (sections not built yet) come from the editorial brief and are not final
 * headings. Sample code for the interface panels (identifiers and types that contain digits) lives
 * in interfaceExamples.ts.
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
    kicker: '[ 01 · WHAT KUYFI DOES ]',
    heading: 'Start from what is actually deployed.',
    body:
      'Kuyfi starts with a Contract ID. It reads the deployed contract specification, ' +
      'reconstructs the callable surface and prepares the information needed for testing. The ' +
      'process begins from what is actually deployed on Stellar, rather than from a source ' +
      'repository.',
    flowLabel: 'How a Contract ID becomes a callable surface',
    flow: [
      { term: 'CONTRACT ID', detail: 'The address of the deployed contract on Stellar.' },
      { term: 'DEPLOYED SPEC', detail: 'The specification published with that contract.' },
      {
        term: 'CALLABLE SURFACE',
        detail: 'Functions, parameters and custom types, ready for testing.',
      },
    ],
  },

  whyBlackBox: {
    kicker: '[ 02 · WHY BLACK-BOX ]',
    heading: 'The deployed contract is the boundary that matters.',
    body:
      'Source code can provide valuable context, but it is not always available and it is not ' +
      'the artifact the network executes. Kuyfi works from the deployed contract interface, so ' +
      'developers can inspect the surface that actually exists on-chain.',
    note:
      'Black-box testing does not replace a full source-level audit. It gives developers another ' +
      'way to inspect deployed behavior, reproduce signals and identify areas that deserve deeper ' +
      'review.',
  },

  howItWorks: {
    kicker: '[ 03 · PIPELINE ]',
    heading: 'From Contract ID to execution evidence.',
    body:
      'The OSINT Scanner maps functions, arguments and user-defined types first. Chaos Monkey ' +
      'then generates type-aware inputs, simulates execution and classifies the resulting ' +
      'traces. When an execution reaches the network, Kuyfi preserves the available transaction ' +
      'evidence alongside the report.',
    listLabel: 'Kuyfi pipeline, in order',
    steps: [
      { stage: 'INPUT', label: 'Contract ID' },
      { stage: 'OSINT SCANNER', label: 'Fetch deployed WASM / specification' },
      { stage: 'OSINT SCANNER', label: 'Reconstruct attack surface' },
      { stage: 'CHAOS MONKEY', label: 'Generate type-aware vectors' },
      { stage: 'CHAOS MONKEY', label: 'Simulate and classify' },
      { stage: 'OUTPUT', label: 'JSON / PDF report' },
    ],
  },

  osintScanner: {
    kicker: '[ MODULE 01 ]',
    heading: 'OSINT Scanner',
    body:
      'Before testing a contract, Kuyfi needs to understand what is exposed. The scanner reads ' +
      'the deployed specification and reconstructs the functions, parameters and custom types ' +
      "that define the contract's callable surface.",
    support: 'Read-only discovery. No source repository required.',
    panel: {
      title: 'OSINT SCANNER',
      spec: 'CONTRACT SPEC',
      specSource: 'source',
      specSourceValue: 'deployed WASM',
      specEntries: 'reads',
      specEntriesValue: 'functions, user-defined types',
      functions: 'FUNCTIONS AND ARGUMENTS',
      types: 'TYPES',
      note: 'Illustrative subset. Not the output of a real scan.',
    },
  },

  chaosMonkey: {
    kicker: '[ MODULE 02 ]',
    heading: 'Chaos Monkey',
    body:
      'Once the surface is known, Chaos Monkey generates inputs that respect Soroban types and ' +
      'explores boundary, authorization, ordering, fee and liquidity-related scenarios. ' +
      'Execution results are classified conservatively when the available context is ambiguous.',
    emphasis:
      'A type-correct value is not necessarily a semantically valid contract input. Kuyfi keeps ' +
      'that distinction visible instead of automatically turning every runtime failure into a ' +
      'vulnerability.',
    panel: {
      title: 'CHAOS MONKEY',
      families: 'SCENARIO FAMILIES',
      familyList: [
        { name: 'Boundary', detail: 'Values at and beyond the limits of each type.' },
        {
          name: 'Authorization',
          detail: 'Calls made with and without the expected authorization.',
        },
        { name: 'Call ordering', detail: 'Functions invoked out of their usual sequence.' },
        { name: 'Fee and BPS', detail: 'Rates and basis points at their edges.' },
        { name: 'Liquidity ratio', detail: 'Pool ratios pushed away from the expected balance.' },
      ],
      classification: 'CLASSIFICATION',
      classificationRows: [
        { key: 'INPUT', value: 'amount_in at the minimum of its type' },
        { key: 'TYPE CHECK', value: 'valid Soroban value' },
        { key: 'SEMANTIC CONTEXT', value: 'not established' },
        { key: 'EXECUTION', value: 'runtime failure in simulation' },
        { key: 'CLASSIFIED AS', value: 'manual review signal' },
      ],
      note: 'Illustrative values. A signal is not a confirmed vulnerability.',
    },
  },

  terminal: {
    kicker: '[ 04 · REAL CLI ]',
    heading: 'Kuyfi, from the terminal.',
    body:
      'Kuyfi runs locally from the command line. The session below is the same interface you ' +
      'install with @kuyfi/kuyfi: choose the OSINT Scanner, enter a Contract ID and read the ' +
      'attack surface it reconstructs.',
    region: 'Real Kuyfi CLI session',
    sessionTag: 'REAL CLI SESSION',
    note:
      "Excerpt from a scan of Kuyfi's own intentionally vulnerable Testnet fixture. The scan is " +
      'read-only and submits no transactions.',
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

  ui: {
    exampleTag: 'INTERFACE EXAMPLE',
  },

  closing: {
    line: site.slogan,
  },
} as const
