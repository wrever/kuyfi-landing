import { Reveal } from '../../components/motion/Reveal'
import { ButtonLink } from '../../components/ui/Button'
import { CommandLine } from '../../components/ui/CommandLine'
import { Kicker } from '../../components/ui/Kicker'
import { Section } from '../../components/ui/Section'
import { siteCopy } from '../../content/siteCopy'
import { releaseStatus } from '../../content/releaseStatus'
import styles from './Install.module.css'

/** Install: the command is the point of the section, so it is set large and lit from behind. */
export function Install() {
  const { install: copy } = siteCopy

  return (
    <Section id="install" labelledBy="install-title" atmosphere="install">
      <div className={styles.head}>
        <Reveal className={styles.title}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 id="install-title" className={styles.heading}>
            {copy.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className={styles.body}>{copy.body}</p>
        </Reveal>
      </div>

      <Reveal className={styles.commands} delay={0.12}>
        <div className={styles.block}>
          <CommandLine
            step={copy.steps.install}
            command={copy.command}
            primary
            label={copy.copy.installLabel}
            copiedAnnouncement={copy.copy.installCopied}
            text={copy.copy}
          />
          <CommandLine
            step={copy.steps.launch}
            command={copy.then}
            note={copy.launchNote}
            label={copy.copy.launchLabel}
            copiedAnnouncement={copy.copy.launchCopied}
            text={copy.copy}
          />
        </div>
      </Reveal>

      <Reveal className={styles.meta} delay={0.16}>
        <dl className={styles.facts}>
          <div>
            <dt>{copy.labels.requires}</dt>
            <dd>{copy.requirement}</dd>
          </div>
          <div>
            <dt>{copy.labels.package}</dt>
            <dd>{releaseStatus.package}</dd>
          </div>
          <div>
            <dt>{copy.labels.release}</dt>
            <dd>v{releaseStatus.release}</dd>
          </div>
        </dl>
        <ButtonLink variant="secondary" href={releaseStatus.links.npm}>
          {copy.npmLink}
        </ButtonLink>
      </Reveal>
    </Section>
  )
}
