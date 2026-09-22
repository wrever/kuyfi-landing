import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Panel, PanelGroup } from '../../components/ui/Panel'
import { Section } from '../../components/ui/Section'
import { siteCopy } from '../../content/siteCopy'
import styles from './ChaosMonkey.module.css'

/** Module 02. Reverse of the OSINT composition: prose on the left, panel on the right. */
export function ChaosMonkey() {
  const { chaosMonkey: copy, ui } = siteCopy
  const { panel } = copy
  const lastRow = panel.classificationRows.length - 1

  return (
    <Section id="chaos-monkey" labelledBy="chaos-monkey-title">
      <div className={styles.layout}>
        <Reveal className={styles.text}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="chaos-monkey-title" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{copy.body}</p>
          <p className={styles.emphasis}>{copy.emphasis}</p>
        </Reveal>

        <Reveal className={styles.visual} delay={0.12}>
          <Panel title={panel.title} tag={ui.exampleTag} note={panel.note}>
            <PanelGroup label={panel.families}>
              <dl className={styles.families}>
                {panel.familyList.map((family) => (
                  <div key={family.name} className={styles.family}>
                    <dt className={styles.familyName}>{family.name}</dt>
                    <dd className={styles.familyDetail}>{family.detail}</dd>
                  </div>
                ))}
              </dl>
            </PanelGroup>

            <PanelGroup label={panel.classification}>
              <dl className={styles.rows}>
                {panel.classificationRows.map((row, index) => (
                  <div key={row.key} className={styles.row}>
                    <dt className={styles.rowKey}>{row.key}</dt>
                    <dd className={index === lastRow ? styles.rowResult : styles.rowValue}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </PanelGroup>
          </Panel>
        </Reveal>
      </div>
    </Section>
  )
}
