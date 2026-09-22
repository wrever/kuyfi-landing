import { Reveal } from '../../components/motion/Reveal'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { Terminal } from '../../components/ui/Terminal'
import { siteCopy } from '../../content/siteCopy'
import { terminalSession } from '../../content/terminalSession'
import styles from './RealTerminal.module.css'

/** The real CLI: prose on the left, the recorded session on the right, lit from behind. */
export function RealTerminal() {
  const { terminal: copy } = siteCopy

  return (
    <Section id="terminal" labelledBy="terminal-title" atmosphere="terminal">
      <div className={styles.layout}>
        <Reveal className={styles.text}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="terminal-title" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{copy.body}</p>
        </Reveal>

        <Reveal className={styles.visual} delay={0.12}>
          <Terminal
            session={terminalSession}
            label={copy.region}
            tag={copy.sessionTag}
            note={copy.note}
            fullSession={{
              summary: copy.fullSession,
              region: copy.fullRegion,
              caption: copy.fullCaption,
            }}
          />
        </Reveal>
      </div>
    </Section>
  )
}
