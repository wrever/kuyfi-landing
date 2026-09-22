import type { ReactNode } from 'react'
import { Reveal } from '../../components/motion/Reveal'
import { CopyId } from '../../components/ui/CopyId'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import {
  evidenceRecords,
  truncateId,
  type AmmRecord,
  type EvidenceRecord,
  type FixtureRecord,
  type PasskeyRecord,
} from '../../content/evidenceRecords'
import { siteCopy } from '../../content/siteCopy'
import styles from './Evidence.module.css'

const { evidence: copy } = siteCopy
const { labels, fields } = copy

/** Numbers sit next to their labels and all share one size: none of them is a headline figure. */
function Metrics({ record }: { record: EvidenceRecord }) {
  return (
    <ul className={styles.metrics} role="list" data-count={record.metrics.length}>
      {record.metrics.map((metric) => (
        <li key={metric.label} className={styles.metric}>
          <span className={styles.value}>{metric.value}</span>
          <span className={styles.metricLabel}>{metric.label}</span>
        </li>
      ))}
    </ul>
  )
}

/** How the signals split by severity. The label carries the meaning; the bar only shows proportion. */
function Severities({ record }: { record: AmmRecord }) {
  return (
    <div className={styles.block}>
      <p className={styles.blockLabel}>{labels.severities}</p>
      <div className={styles.bar} aria-hidden="true">
        {record.severities.map((row) => (
          <span
            key={row.severity}
            className={row.severity === 'HIGH' ? styles.segHigh : styles.segMedium}
            style={{ flexGrow: row.count }}
          />
        ))}
      </div>
      <ul className={styles.legend} role="list">
        {record.severities.map((row) => (
          <li key={row.severity}>
            <strong className={styles.legendCount}>{row.count}</strong>{' '}
            <span className={styles.legendSeverity}>{row.severity}</span>
            {' · '}
            {row.kind}
          </li>
        ))}
      </ul>
      <p className={styles.highOn}>
        {labels.highSignals}{' '}
        {record.highSignalFunctions.map((name) => (
          <code key={name} className={styles.fn}>
            {name}
          </code>
        ))}
      </p>
    </div>
  )
}

/** The passkey case is about what was NOT exercised, so the gap is the visual focus. */
function CoverageGap({ record }: { record: PasskeyRecord }) {
  const { gap } = record
  return (
    <div className={styles.block}>
      <p className={styles.signalLine}>
        {labels.allSignalsAre} <code className={styles.inlineCode}>{record.signalKind}</code>.
      </p>
      <div className={styles.coverage}>
        <p className={styles.gapLabel}>{gap.label}</p>
        <p className={styles.gapRow}>
          <code className={styles.gapFn}>{gap.func}</code>
          <span className={styles.gapValue}>
            <span className={styles.gapNumber}>{gap.vectors}</span> {gap.unit}
          </span>
        </p>
        <p className={styles.gapNote}>
          {gap.note} {gap.version}
        </p>
      </div>
    </div>
  )
}

/** The A/B pair, then the manual exploit transaction, kept apart from anything Kuyfi produced. */
function Control({ record }: { record: FixtureRecord }) {
  const { pair, exploit } = record
  return (
    <>
      <ul className={styles.pair} role="list">
        {pair.map((row) => (
          <li
            key={row.signature}
            className={styles.pairRow}
            data-finding={row.finding ? 'true' : undefined}
          >
            <code className={styles.signature}>{row.signature}</code>
            <dl className={styles.pairFacts}>
              <div>
                <dt>{copy.fixture.pair.check}</dt>
                <dd>{row.check}</dd>
              </div>
              <div>
                <dt>{copy.fixture.pair.result}</dt>
                <dd>
                  {row.finding ? (
                    <>
                      <span className={styles.findingId}>{row.finding.id}</span>{' '}
                      <span className={styles.severity}>{row.finding.severity}</span>
                    </>
                  ) : (
                    row.result
                  )}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className={styles.exploit}>
        <p className={styles.exploitLabel}>{exploit.label}</p>
        <div className={styles.exploitRow}>
          <span className={styles.exploitKey}>{exploit.transactionLabel}</span>
          <CopyId
            value={exploit.txHash}
            display={truncateId(exploit.txHash)}
            label={`${copy.copy.copyTransaction} ${record.title}`}
            text={copy.copy}
          />
          <span className={styles.ledger}>
            {exploit.ledgerLabel} {exploit.ledger}
          </span>
        </div>
        <p className={styles.exploitText}>{exploit.text}</p>
      </div>
    </>
  )
}

function Field({
  label,
  tone,
  children,
}: {
  label: string
  tone?: 'reading'
  children: ReactNode
}) {
  return (
    <div className={tone === 'reading' ? styles.reading : styles.field}>
      <h4 className={styles.fieldLabel}>{label}</h4>
      {children}
    </div>
  )
}

function CaseRecord({ record, index }: { record: EvidenceRecord; index: number }) {
  const titleId = `evidence-${record.id}-title`
  const passkeyTarget = record.id === 'passkey' ? record.target : null

  return (
    <article
      className={styles.record}
      aria-labelledby={titleId}
      data-tone={record.outcome.tone}
      data-side={index % 2 === 1 ? 'right' : 'left'}
    >
      <Reveal className={styles.recordHead}>
        <p className={styles.caseLabel}>
          <span className={styles.index}>
            {labels.case} {String(index + 1).padStart(2, '0')}
          </span>
          <span className={styles.kind}>{record.kind}</span>
        </p>
        <p className={`${styles.outcome} ${styles[record.outcome.tone]}`}>{record.outcome.label}</p>
      </Reveal>

      <div className={styles.grid}>
        <Reveal className={styles.aside}>
          <h3 id={titleId} className={styles.title}>
            {record.title}
          </h3>
          <dl className={styles.facts}>
            <div>
              <dt>{labels.network}</dt>
              <dd>{record.network}</dd>
            </div>
            <div>
              <dt>{labels.contract}</dt>
              <dd>
                <CopyId
                  value={record.contractId}
                  display={truncateId(record.contractId)}
                  label={`${copy.copy.copyContract} ${record.title}`}
                  text={copy.copy}
                />
              </dd>
            </div>
            {passkeyTarget && (
              <div>
                <dt>{labels.target}</dt>
                <dd>{passkeyTarget}</dd>
              </div>
            )}
          </dl>
        </Reveal>

        <Reveal className={styles.main} delay={0.1}>
          <Field label={fields.context}>
            <p className={styles.body}>{record.context}</p>
          </Field>

          <Field label={fields.observed}>
            <p className={styles.body}>{record.observed}</p>
            <Metrics record={record} />
            {record.id === 'amm' && <Severities record={record} />}
            {record.id === 'passkey' && <CoverageGap record={record} />}
            {record.id === 'fixture' && <Control record={record} />}
          </Field>

          <Field label={fields.reading} tone="reading">
            <p className={styles.readingBody}>{record.reading}</p>
          </Field>
        </Reveal>
      </div>
    </article>
  )
}

/** Three evidence records, one after another: what was observed, and how to read it. */
export function Evidence() {
  return (
    <Section id="evidence" labelledBy="evidence-title" atmosphere="evidence">
      <Reveal className={styles.head}>
        <div className={styles.headText}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="evidence-title" className={styles.heading}>
            {copy.heading}
          </h2>
        </div>
        <p className={styles.intro}>{copy.intro}</p>
      </Reveal>

      <div className={styles.records}>
        {evidenceRecords.map((record, index) => (
          <CaseRecord key={record.id} record={record} index={index} />
        ))}
      </div>

      <Reveal>
        <p className={styles.closing}>{copy.closing}</p>
      </Reveal>
    </Section>
  )
}
