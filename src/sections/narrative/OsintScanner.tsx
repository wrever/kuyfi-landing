import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Panel, PanelGroup } from '../../components/ui/Panel'
import { Section } from '../../components/ui/Section'
import { osintExample } from '../../content/interfaceExamples'
import { siteCopy } from '../../content/siteCopy'
import styles from './OsintScanner.module.css'

const udtNames: ReadonlySet<string> = new Set(osintExample.types.map((type) => type.name))

/** Primitive types in purple; a user-defined type used in a signature is gold, like its definition. */
function typeClass(type: string) {
  return udtNames.has(type) ? styles.udt : styles.type
}

/** Module 01. Panel on the left, prose on the right. */
export function OsintScanner() {
  const { osintScanner: copy, ui } = siteCopy
  const { panel } = copy

  return (
    <Section id="osint-scanner" labelledBy="osint-scanner-title" atmosphere="osint">
      <div className={styles.layout}>
        <Reveal className={styles.text}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="osint-scanner-title" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{copy.body}</p>
          <p className={styles.support}>{copy.support}</p>
        </Reveal>

        <Reveal className={styles.visual} delay={0.12}>
          <Panel title={panel.title} tag={ui.exampleTag} note={panel.note} glow="gold">
            <PanelGroup label={panel.spec}>
              <dl className={styles.spec}>
                <dt>{panel.specSource}</dt>
                <dd>{panel.specSourceValue}</dd>
                <dt>{panel.specEntries}</dt>
                <dd>{panel.specEntriesValue}</dd>
              </dl>
            </PanelGroup>

            <PanelGroup label={panel.functions}>
              <ul className={styles.functions} role="list">
                {osintExample.functions.map((fn) => (
                  <li key={fn.name} className={styles.fn}>
                    <span className={styles.fnHead}>
                      <span className={styles.fnName}>{fn.name}</span>
                      <span className={styles.returns}>
                        <span className={styles.arrow} aria-hidden="true">
                          →
                        </span>{' '}
                        {fn.returns}
                      </span>
                    </span>
                    <span className={styles.args}>
                      {fn.args.map((arg) => (
                        <span key={arg.name} className={styles.arg}>
                          {arg.name}: <span className={typeClass(arg.type)}>{arg.type}</span>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </PanelGroup>

            <PanelGroup label={panel.types}>
              <ul className={styles.functions} role="list">
                {osintExample.types.map((type) => (
                  <li key={type.name} className={styles.fn}>
                    <span className={styles.fnHead}>
                      <span>
                        <span className={styles.kind}>{type.kind}</span>{' '}
                        <span className={styles.udt}>{type.name}</span>
                      </span>
                    </span>
                    <span className={styles.args}>
                      {type.fields.map((field) => (
                        <span key={field.name} className={styles.arg}>
                          {field.name}: <span className={typeClass(field.type)}>{field.type}</span>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </PanelGroup>
          </Panel>
        </Reveal>
      </div>
    </Section>
  )
}
