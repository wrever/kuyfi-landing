import { evidence } from './evidence'
import { siteCopy } from './siteCopy'

/**
 * The three Evidence records, ready to render: facts from evidence.ts joined with the words in
 * siteCopy.evidence. No number or identifier is written anywhere else, and none is derived here
 * except by reading a field, so the section cannot drift from the source of truth.
 */

const { evidence: copy } = siteCopy
const { labels } = copy

/** How to read the outcome. Carried by its text; colour only reinforces it. */
export type Tone = 'review' | 'gap' | 'critical'

export interface Metric {
  value: number
  label: string
}

/** Shortened like the CLI does: CCSJ3R...VF2Q2. The full value stays in the data and the DOM. */
export function truncateId(id: string, head = 6, tail = 5): string {
  return id.length <= head + tail + 3 ? id : `${id.slice(0, head)}...${id.slice(-tail)}`
}

interface RecordBase {
  kind: string
  outcome: { label: string; tone: Tone }
  title: string
  network: string
  contractId: string
  metrics: readonly Metric[]
  context: string
  observed: string
  reading: string
}

export interface AmmRecord extends RecordBase {
  id: 'amm'
  /** Signals by severity, for the composition bar. */
  severities: readonly { severity: 'MEDIUM' | 'HIGH'; count: number; kind: string }[]
  highSignalFunctions: readonly string[]
}

export interface PasskeyRecord extends RecordBase {
  id: 'passkey'
  target: string
  signalKind: string
  gap: { label: string; note: string; version: string; func: string; vectors: number; unit: string }
}

export interface FixtureRecord extends RecordBase {
  id: 'fixture'
  pair: readonly {
    signature: string
    check: string
    result: string
    /** Set on the row that carries the finding. */
    finding?: { id: string; severity: string }
  }[]
  exploit: {
    label: string
    text: string
    transactionLabel: string
    txHash: string
    ledgerLabel: string
    ledger: number
    generatedByKuyfi: false
  }
}

export type EvidenceRecord = AmmRecord | PasskeyRecord | FixtureRecord

const amm = evidence.realAmm
const passkey = evidence.passkeyWallet
const fixture = evidence.vulnerableFixture

export const ammRecord: AmmRecord = {
  id: 'amm',
  kind: copy.amm.kind,
  outcome: { label: copy.amm.outcome, tone: 'review' },
  title: copy.amm.title,
  network: amm.network,
  contractId: amm.contractId,
  metrics: [
    { value: amm.functions, label: labels.functions },
    { value: amm.udts, label: labels.udts },
    { value: amm.vectors, label: labels.vectors },
    { value: amm.transactionsWithHashes, label: labels.hashes },
    { value: amm.findings, label: labels.signals },
  ],
  context: copy.amm.context,
  observed: copy.amm.observed,
  reading: copy.amm.reading,
  severities: [
    { severity: 'MEDIUM', count: amm.signals.medium.count, kind: amm.signals.medium.kind },
    { severity: 'HIGH', count: amm.signals.high.count, kind: amm.signals.high.kind },
  ],
  highSignalFunctions: amm.highSignalFunctions,
}

export const passkeyRecord: PasskeyRecord = {
  id: 'passkey',
  kind: copy.passkey.kind,
  outcome: { label: copy.passkey.outcome, tone: 'gap' },
  title: copy.passkey.title,
  network: passkey.network,
  contractId: passkey.contractId,
  target: passkey.target,
  metrics: [
    { value: passkey.functions, label: labels.functions },
    { value: passkey.udts, label: labels.udts },
    { value: passkey.vectors, label: labels.vectors },
    { value: passkey.findings, label: labels.signals },
    { value: passkey.transactionHashes, label: labels.hashes },
    { value: passkey.broadcasts, label: labels.broadcasts },
  ],
  signalKind: passkey.signals.medium.kind,
  context: copy.passkey.context,
  observed: copy.passkey.observed,
  reading: copy.passkey.reading,
  gap: {
    label: copy.passkey.gap,
    note: copy.passkey.gapNote,
    version: `Kuyfi v${evidence.project.version} ${copy.passkey.gapVersion}`,
    func: passkey.coverageGap.function,
    vectors: passkey.coverageGap.generatedVectors,
    unit: labels.generated,
  },
}

const [finding] = fixture.findings

export const fixtureRecord: FixtureRecord = {
  id: 'fixture',
  kind: copy.fixture.kind,
  outcome: { label: copy.fixture.outcome, tone: 'critical' },
  title: copy.fixture.title,
  network: fixture.network,
  contractId: fixture.contractId,
  metrics: [
    { value: fixture.functions, label: labels.functions },
    { value: fixture.vectors, label: labels.vectors },
    { value: fixture.broadcasts, label: labels.broadcasts },
    { value: fixture.findings.length, label: labels.finding },
  ],
  context: copy.fixture.context,
  observed: copy.fixture.observed,
  reading: copy.fixture.reading,
  pair: [
    {
      signature: fixture.vulnerableFunction.signature,
      check: copy.fixture.pair.omitted,
      result: finding.id,
      finding,
    },
    {
      signature: fixture.protectedFunction.signature,
      check: copy.fixture.pair.required,
      result: copy.fixture.pair.noFinding,
    },
  ],
  exploit: {
    label: copy.fixture.exploit.label,
    text: copy.fixture.exploit.text,
    transactionLabel: copy.fixture.exploit.transaction,
    txHash: fixture.manualExploit.txHash,
    ledgerLabel: copy.fixture.exploit.ledger,
    ledger: fixture.manualExploit.ledger,
    generatedByKuyfi: fixture.manualExploit.generatedByKuyfi,
  },
}

export const evidenceRecords: readonly EvidenceRecord[] = [ammRecord, passkeyRecord, fixtureRecord]

/** Every string a visitor reads in a record, numbers included, for editorial checks. */
export function visibleText(record: EvidenceRecord): string[] {
  const text = [
    record.kind,
    record.outcome.label,
    record.title,
    record.network,
    truncateId(record.contractId),
    ...record.metrics.map((metric) => `${metric.value} ${metric.label}`),
    record.context,
    record.observed,
    record.reading,
  ]

  if (record.id === 'amm') {
    text.push(
      ...record.severities.map((s) => `${s.count} ${s.severity} ${s.kind}`),
      ...record.highSignalFunctions,
    )
  } else if (record.id === 'passkey') {
    const { gap } = record
    text.push(record.target, record.signalKind, gap.label, gap.note, gap.version, gap.func)
    text.push(`${gap.vectors} ${gap.unit}`)
  } else {
    text.push(
      ...record.pair.flatMap((row) => [row.signature, row.check, row.result]),
      record.exploit.label,
      record.exploit.text,
      truncateId(record.exploit.txHash),
      `${record.exploit.ledgerLabel} ${record.exploit.ledger}`,
    )
  }

  return text
}
