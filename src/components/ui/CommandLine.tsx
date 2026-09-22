import { useCopy } from '../../hooks/useCopy'
import { Button } from './Button'
import styles from './CommandLine.module.css'

interface CommandLineProps {
  /** Small label above the command, e.g. "INSTALL". */
  step: string
  command: string
  /** Optional line next to the step label. */
  note?: string
  /** The main call to action gets the filled button. */
  primary?: boolean
  /** Accessible name of the copy button. */
  label: string
  /** What screen readers hear after a successful copy. */
  copiedAnnouncement: string
  text: { copy: string; copied: string; failed: string; failedAnnouncement: string }
}

/**
 * A shell command set large, selectable and easy to copy. No typing effect: the command is just
 * there, as text. If the clipboard is blocked the command is selected instead.
 */
export function CommandLine({
  step,
  command,
  note,
  primary = false,
  label,
  copiedAnnouncement,
  text,
}: CommandLineProps) {
  const { status, copy, selectRef } = useCopy(command)
  const shown = { idle: text.copy, copied: text.copied, failed: text.failed }[status]
  const announcement = { idle: '', copied: copiedAnnouncement, failed: text.failedAnnouncement }[
    status
  ]

  return (
    <div className={styles.row}>
      <p className={styles.head}>
        <span>{step}</span>
        {note && <span className={styles.note}>{note}</span>}
      </p>
      <div className={styles.bar}>
        <div className={styles.command}>
          <span className={styles.prompt} aria-hidden="true">
            $
          </span>
          <code ref={selectRef} className={styles.code}>
            {command}
          </code>
        </div>
        <Button
          variant={primary ? 'primary' : 'secondary'}
          className={styles.copy}
          onClick={copy}
          aria-label={label}
        >
          {shown}
        </Button>
        <span role="status" className="sr-only">
          {announcement}
        </span>
      </div>
    </div>
  )
}
