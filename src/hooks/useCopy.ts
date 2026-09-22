import { useEffect, useRef, useState } from 'react'

export type CopyStatus = 'idle' | 'copied' | 'failed'

/**
 * Copies `value` to the clipboard and reports the result for about two seconds. If the clipboard is
 * blocked, it selects the element behind `selectRef` so Control C still works.
 */
export function useCopy(value: string) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const selectRef = useRef<HTMLElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    let next: CopyStatus = 'copied'
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      next = 'failed'
      const node = selectRef.current
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

  return { status, copy, selectRef }
}
