import { describe, expect, it } from 'vitest'
import { evidence } from './evidence'
import {
  ammRecord,
  evidenceRecords,
  fixtureRecord,
  passkeyRecord,
  truncateId,
  visibleText,
} from './evidenceRecords'
import { siteCopy } from './siteCopy'

const metric = (record: { metrics: readonly { value: number; label: string }[] }, label: string) =>
  record.metrics.find((m) => m.label === label)?.value

const { labels } = siteCopy.evidence
const allText = evidenceRecords.flatMap(visibleText)

describe('evidence facts: real AMM', () => {
  const amm = evidence.realAmm

  it('records the run', () => {
    expect(amm.contractId).toBe('CCSJ3REOFONMUJUINMZWBL45UXJYFXVFSXAWINLTDKFNEYBCRR4VF2Q2')
    expect([amm.functions, amm.udts, amm.vectors, amm.transactionsWithHashes]).toEqual([
      19, 6, 161, 36,
    ])
  })

  it('splits 127 findings/signals into 125 MEDIUM and 2 HIGH', () => {
    expect(amm.findings).toBe(127)
    expect(amm.signals.medium.count).toBe(125)
    expect(amm.signals.high.count).toBe(2)
    expect(amm.signals.medium.count + amm.signals.high.count).toBe(amm.findings)
    expect(amm.highSignalFunctions).toEqual(['lp_balance', 'lp_allowance'])
  })

  it('is rendered from those facts, with no other numbers', () => {
    expect(ammRecord.metrics).toEqual([
      { value: 19, label: labels.functions },
      { value: 6, label: labels.udts },
      { value: 161, label: labels.vectors },
      { value: 36, label: labels.hashes },
      { value: 127, label: labels.signals },
    ])
    expect(ammRecord.severities.map((s) => [s.severity, s.count])).toEqual([
      ['MEDIUM', 125],
      ['HIGH', 2],
    ])
    expect(ammRecord.outcome).toEqual({ label: 'MANUAL REVIEW', tone: 'review' })
  })

  it('is a third-party contract, and says so', () => {
    expect(amm.origin).toBe('third-party')
    expect(ammRecord.context).toMatch(/third party/)
  })
})

describe('evidence facts: passkey wallet', () => {
  const passkey = evidence.passkeyWallet

  it('records the run', () => {
    expect(passkey.contractId).toBe('CCYQXFQIXV6FOLAA4ITLFTBSWZCKC5IZC2BJWCWN2MZGF5ZPACSMZSUS')
    expect(passkey.target).toBe('stellar/passkey-kit')
    expect([passkey.functions, passkey.udts, passkey.vectors, passkey.findings]).toEqual([
      7, 9, 110, 62,
    ])
    expect([passkey.transactionHashes, passkey.broadcasts]).toEqual([9, 8])
  })

  it('has every finding in one manual-review class', () => {
    expect(passkey.signals.medium.count).toBe(passkey.findings)
    expect(passkey.signals.medium.kind).toMatch(/UNEXPECTED_ERROR/)
  })

  it('has a coverage gap: __check_auth generated no vectors', () => {
    expect(passkey.coverageGap).toEqual({ function: '__check_auth', generatedVectors: 0 })
    expect(passkeyRecord.gap.func).toBe('__check_auth')
    expect(passkeyRecord.gap.vectors).toBe(0)
    expect(passkeyRecord.outcome).toEqual({ label: 'COVERAGE GAP', tone: 'gap' })
    expect(passkeyRecord.gap.version).toBe('Kuyfi v0.1.0 did not generate a single vector for it.')
  })

  it('is attributed to the project, not verified against it, and says so', () => {
    expect(passkey.origin).toBe('attributed-not-verified')
    expect(passkeyRecord.context).toMatch(/attributed to the stellar\/passkey-kit project/)
    expect(passkeyRecord.context).toMatch(/not verified against the upstream source/)
  })
})

describe('evidence facts: intentionally vulnerable fixture', () => {
  const fixture = evidence.vulnerableFixture

  it('records the run', () => {
    expect(fixture.contractId).toBe('CDYUQRWYE6INSGTMJWHPU32VSWVOZ456EUHJMMQXTCFXPFUXPH2JTPV7')
    expect([fixture.functions, fixture.vectors, fixture.broadcasts]).toEqual([3, 16, 16])
    expect(fixture.findings).toEqual([{ id: 'KYF-001', severity: 'CRITICAL' }])
  })

  it('puts the finding on the unguarded function only', () => {
    const [unguarded, guarded] = fixtureRecord.pair
    expect(unguarded.signature).toBe('set_admin_value(admin: Address, value: i128)')
    expect(unguarded.finding).toEqual({ id: 'KYF-001', severity: 'CRITICAL' })
    expect(guarded.signature).toBe('secure_set_admin_value(admin: Address, value: i128)')
    expect(guarded.finding).toBeUndefined()
    expect(guarded.result).toBe('no finding')
  })

  it('carries the manual exploit transaction and ledger exactly', () => {
    expect(fixtureRecord.exploit.txHash).toBe(
      '0b1a0fbb98a6b46d1ff8c8e183d24e8d33cf6e82957e906070c4d311f83ba0d4',
    )
    expect(fixtureRecord.exploit.ledger).toBe(4628079)
  })
})

describe('evidence guardrails', () => {
  it('never turns findings/signals into vulnerabilities', () => {
    for (const text of allText) {
      expect(text).not.toMatch(/\b\d+\s+(confirmed\s+)?vulnerabilit/i)
      expect(text).not.toMatch(/\b127 vulnerabilities\b|\b2 vulnerabilities\b/i)
    }
    // 127 only ever appears as findings/signals, next to that label.
    for (const text of allText.filter((t) => /\b127\b/.test(t))) {
      expect(text).toMatch(/^127 findings\/signals$/)
    }
    expect(metric(ammRecord, labels.signals)).toBe(127)
    expect(ammRecord.reading).toMatch(/not confirmed vulnerabilities/)
  })

  it('gives every number the same weight: no metric is singled out', () => {
    for (const record of evidenceRecords) {
      // One list, one style: the view-model carries no size or emphasis flag to single one out.
      for (const m of record.metrics) expect(Object.keys(m).sort()).toEqual(['label', 'value'])
    }
  })

  it('explains the AMM ambiguity: type-correct is not semantically valid', () => {
    expect(ammRecord.reading).toMatch(/type-correct/)
    expect(ammRecord.reading).toMatch(/not necessarily an account, token or state-derived address/)
    expect(ammRecord.reading).toMatch(/Chaos Monkey section/)
  })

  it('never lets a coverage gap read as safety', () => {
    const text = visibleText(passkeyRecord).join(' ')
    expect(text).not.toMatch(/\b(secure|safe|safety|passed|rejected the attack)\b/i)
    expect(passkeyRecord.reading).toMatch(/does not mean the function rejected the inputs/)
    expect(passkeyRecord.reading).toMatch(
      /protected or is vulnerable, because Kuyfi never called it/,
    )
    expect(passkeyRecord.reading).toMatch(/no result here says anything about that entry point/)
    expect(evidence.passkeyWallet.interpretation).toMatch(/does not mean secure/i)
    expect(passkeyRecord.outcome.tone).toBe('gap')
  })

  it('uses CRITICAL only for the controlled fixture', () => {
    for (const record of [ammRecord, passkeyRecord]) {
      expect(visibleText(record).join(' ')).not.toMatch(/\bCRITICAL\b/)
      expect(record.outcome.tone).not.toBe('critical')
    }
    expect(fixtureRecord.outcome).toEqual({ label: 'CRITICAL FINDING', tone: 'critical' })
  })

  it('never labels the manual exploit transaction as generated by Kuyfi', () => {
    expect(fixtureRecord.exploit.generatedByKuyfi).toBe(false)
    expect(fixtureRecord.exploit.label).toBe('MANUAL EXPLOIT EVIDENCE')
    expect(fixtureRecord.exploit.text).toMatch(/not generated by Kuyfi/)
    for (const text of visibleText(fixtureRecord)) {
      if (/generated by Kuyfi/i.test(text)) expect(text).toMatch(/not generated by Kuyfi/i)
    }
  })

  it('identifies the fixture as an intentional positive control, not a discovery', () => {
    expect(fixtureRecord.kind).toBe('POSITIVE CONTROL')
    expect(fixtureRecord.title).toMatch(/^Intentionally vulnerable/)
    expect(fixtureRecord.context).toMatch(/deliberately omitted/)
    expect(fixtureRecord.reading).toMatch(/planted/)
    expect(fixtureRecord.reading).toMatch(/not a discovery/)
    expect(fixtureRecord.reading).toMatch(/positive control/)
    expect(evidenceRecords.map((r) => r.kind)).toEqual([
      'REAL CONTRACT',
      'REAL CONTRACT',
      'POSITIVE CONTROL',
    ])
  })

  it('claims no detection rate, superiority or audit replacement', () => {
    const text = [...allText, siteCopy.evidence.intro, siteCopy.evidence.closing].join(' ')
    expect(text).not.toMatch(
      /\b(best|industry-leading|production-grade|more accurate|detection rate of|replaces?)\b/i,
    )
    expect(siteCopy.evidence.closing).toMatch(/not a measure of detection rate/)
    expect(fixtureRecord.reading).toMatch(/not how often it detects flaws in other contracts/)
  })
})

describe('contract ids and hashes', () => {
  it('shows shortened ids, and keeps the full ones in the data', () => {
    expect(evidenceRecords.map((r) => truncateId(r.contractId))).toEqual([
      'CCSJ3R...VF2Q2',
      'CCYQXF...MZSUS',
      'CDYUQR...JTPV7',
    ])
    expect(truncateId(fixtureRecord.exploit.txHash)).toBe('0b1a0f...ba0d4')
    for (const record of evidenceRecords) expect(record.contractId).toHaveLength(56)
    expect(fixtureRecord.exploit.txHash).toHaveLength(64)
  })

  it('never displays a full identifier as visible text', () => {
    for (const text of allText) {
      expect(text).not.toMatch(/\bC[A-Z0-9]{55}\b/)
      expect(text).not.toMatch(/\b[0-9a-f]{64}\b/)
    }
  })
})

describe('evidence copy', () => {
  it('uses the agreed label and heading', () => {
    expect(siteCopy.evidence.kicker).toBe('[ 05 · EVIDENCE ]')
    expect(siteCopy.evidence.heading).toBe(
      'Tested against real contracts, and against a contract with a known authorization flaw.',
    )
  })

  it('no longer describes the fixture as designed to fail, anywhere in the copy', () => {
    expect(JSON.stringify(siteCopy)).not.toMatch(/designed to fail/i)
    expect(allText.join(' ')).not.toMatch(/designed to fail/i)
  })

  it('has one record per situation, in order: AMM, passkey wallet, fixture', () => {
    expect(evidenceRecords.map((r) => r.id)).toEqual(['amm', 'passkey', 'fixture'])
  })
})
