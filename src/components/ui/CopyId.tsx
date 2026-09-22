import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import styles from './CopyId.module.css'

type Status = 'idle' | 'copied' | 'failed'

interface CopyIdProps {
  /** The full identifier. It is what gets copied, and what assistive tech reads. */
  value: string
  /** What is shown, usually a shortened form such as CCSJ3R...VF2Q2. */
  display: string
  /** Accessible name of the button, e.g. "Copy full contract ID of the AMM". */
  label: string
  text: {
    copy: string
    copied: string
    failed: string
    copiedAnnouncement: string
    failedAnnouncement: string
  }
}

/**
 * A shortened identifier with a copy button. The page shows `display`; the button copies `value`;
 * screen readers get the whole `value`, not the shortened form. If the clipboard is blocked, the
 * full value is selected so Control C still works.
 */
export function CopyId({ value, display, label, text }: CopyIdProps) {
  const [status, setStatus] = useState<Status>('idle')
  const fullRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    let next: Status = 'copied'
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      next = 'failed'
      const node = fullRef.current
      const selection = window.getSelection()
      if (node && selection) {
        const range = document.createRange()
        range.selectNodeContents(node)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
    setStatus(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('idle'), 2400)
  }

  const shown = { idle: text.copy, copied: text.copied, failed: text.failed }[status]
  const announcement = {
    idle: '',
    copied: text.copiedAnnouncement,
    failed: text.failedAnnouncement,
  }[status]

  return (
    <span className={styles.id}>
      <code className={styles.code}>
        <span aria-hidden="true">{display}</span>
        <span ref={fullRef} className="sr-only">
          {value}
        </span>
      </code>
      <Button variant="secondary" className={styles.copy} onClick={copy} aria-label={label}>
        {shown}
      </Button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </span>
  )
}
