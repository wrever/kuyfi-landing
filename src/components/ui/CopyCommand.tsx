import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import styles from './CopyCommand.module.css'

type Status = 'idle' | 'copied' | 'failed'

const LABEL: Record<Status, string> = { idle: 'Copy', copied: 'Copied', failed: 'Ctrl+C' }
const ANNOUNCEMENT: Record<Status, string> = {
  idle: '',
  copied: 'Install command copied to clipboard.',
  failed: 'Could not copy automatically. The command is selected; press Control C to copy it.',
}

/** A shell command with a copy button. Falls back to selecting the text if the clipboard is blocked. */
export function CopyCommand({ command }: { command: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const codeRef = useRef<HTMLElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    let next: Status = 'copied'
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      next = 'failed'
      const code = codeRef.current
      const selection = window.getSelection()
      if (code && selection) {
        const range = document.createRange()
        range.selectNodeContents(code)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
    setStatus(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('idle'), 2400)
  }

  return (
    <div className={styles.bar}>
      <span className={styles.prompt} aria-hidden="true">
        $
      </span>
      <code ref={codeRef} className={styles.code}>
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
