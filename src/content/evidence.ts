/**
 * Evidence — SOURCE OF TRUTH (data only, no presentation).
 *
 * Provided by the project owner on 2026-09-21. It supersedes every number in the Kuyfi_landing_v2
 * prototype (116 vectors, 85 false positives, "0 exploitable vulnerabilities", ...): do not reuse them.
 *
 * Rules for whoever builds the Evidence section later:
 *   - Do not add derived or invented numbers; copy from here.
 *   - findings/signals are NOT confirmed vulnerabilities.
 *   - zero findings would NOT prove security.
 *   - The `interpretation` strings are part of the source of truth.
 */

const NETWORK = 'Stellar Testnet' as const

export const evidence = {
  project: {
    name: 'Kuyfi',
    version: '0.1.0',
    tests: { passing: 150, total: 150 },
    validatedManually: ['macOS', 'Windows 11 / Windows Terminal / PowerShell'],
    notValidatedManuallyYet: ['Linux'],
  },

  realAmm: {
    label: 'Real AMM',
    network: NETWORK,
    contractId: 'CCSJ3REOFONMUJUINMZWBL45UXJYFXVFSXAWINLTDKFNEYBCRR4VF2Q2',
    functions: 19,
    udts: 6,
    vectors: 161,
    transactionsWithHashes: 36,
    findings: 127, // findings/signals
    signals: {
      medium: { count: 125, kind: 'manual-review signals' },
      high: { count: 2, kind: 'POTENTIAL_VULN heuristic signals' },
    },
    interpretation:
      'The 2 HIGH signals are NOT confirmed vulnerabilities. They are possible black-box false ' +
      'positives related to lp_balance / lp_allowance and semantic Address context.',
  },

  passkeyWallet: {
    label: 'Passkey wallet',
    network: NETWORK,
    target: 'stellar/passkey-kit',
    contractId: 'CCYQXFQIXV6FOLAA4ITLFTBSWZCKC5IZC2BJWCWN2MZGF5ZPACSMZSUS',
    functions: 7,
    udts: 9,
    vectors: 110,
    findings: 62, // findings/signals
    transactionHashes: 9,
    broadcasts: 8,
    coverageGap: { function: '__check_auth', generatedVectors: 0 },
    interpretation: 'COVERAGE GAP. It does not mean secure. It does not mean vulnerable.',
  },

  vulnerableFixture: {
    label: 'Intentionally vulnerable fixture',
    network: NETWORK,
    contractId: 'CDYUQRWYE6INSGTMJWHPU32VSWVOZ456EUHJMMQXTCFXPFUXPH2JTPV7',
    functions: 3,
    vectors: 16,
    broadcasts: 16,
    findings: [{ id: 'KYF-001', severity: 'CRITICAL' }],
    manualExploit: {
      txHash: '0b1a0fbb98a6b46d1ff8c8e183d24e8d33cf6e82957e906070c4d311f83ba0d4',
      ledger: 4628079,
    },
  },
} as const
