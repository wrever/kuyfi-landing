import { useCopy } from '../../hooks/useCopy'
import { Button } from './Button'
import styles from './CopyCommand.module.css'

const LABEL = { idle: 'Copy', copied: 'Copied', failed: 'Ctrl+C' } as const
const ANNOUNCEMENT = {
  idle: '',
  copied: 'Install command copied to clipboard.',
  failed: 'Could not copy automatically. The command is selected; press Control C to copy it.',
} as const

/** A shell command with a copy button. Falls back to selecting the text if the clipboard is blocked. */
export function CopyCommand({ command }: { command: string }) {
  const { status, copy, selectRef } = useCopy(command)

  return (
    <div className={styles.bar}>
      <span className={styles.prompt} aria-hidden="true">
        $
      </span>
      <code ref={selectRef} className={styles.code}>
        {command}
      </code>
      <Button className={styles.copy} onClick={copy} aria-label="Copy install command">
        {LABEL[status]}
      </Button>
      <span role="status" className="sr-only">
        {ANNOUNCEMENT[status]}
      </span>
    </div>
  )
}
