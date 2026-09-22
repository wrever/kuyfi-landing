import { useId, useState, type FormEvent } from 'react'
import { siteCopy } from '../../content/siteCopy'
import {
  HONEYPOT_FIELD,
  isPlausibleEmail,
  requestSubscription,
  statusFromCode,
  type SubscribeStatus,
} from '../../lib/subscribe'
import { Button } from './Button'
import styles from './SubscribeForm.module.css'

const { form } = siteCopy.updates

/** What to say for each state. `idle` says nothing: the note under the field is always there. */
const MESSAGES: Record<SubscribeStatus, string> = {
  idle: '',
  loading: form.messages.loading,
  success: form.messages.success,
  already: form.messages.already,
  invalid: form.messages.invalid,
  'rate-limited': form.messages.rateLimited,
  blocked: form.messages.blocked,
  error: form.messages.error,
}

/**
 * Email subscription for release notes and technical updates. It only ever calls this site's own
 * /api/subscribe, and it only says a subscription started when the server says so: with no server
 * behind it (plain `npm run dev`) the honest result is the error message.
 */
export function SubscribeForm() {
  const [status, setStatus] = useState<SubscribeStatus>('idle')
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('')
  const ids = { input: useId(), note: useId(), message: useId() }

  const busy = status === 'loading'
  const message = MESSAGES[status]

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (!isPlausibleEmail(email)) {
      setStatus('invalid')
      return
    }

    setStatus('loading')
    const next = statusFromCode(await requestSubscription(email, trap))
    setStatus(next)
    if (next === 'success') setEmail('')
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.label} htmlFor={ids.input}>
        {form.label}
      </label>

      <div className={styles.row}>
        <input
          id={ids.input}
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (
              status === 'invalid' ||
              status === 'error' ||
              status === 'rate-limited' ||
              status === 'blocked'
            ) {
              setStatus('idle')
            }
          }}
          aria-invalid={status === 'invalid' || undefined}
          aria-describedby={`${ids.note} ${ids.message}`}
        />
        <Button type="submit" className={styles.submit} disabled={busy}>
          {busy ? form.submitting : form.submit}
        </Button>
      </div>

      {/* Never displayed and skipped by keyboard and assistive tech. Bots fill it; people do not. */}
      <div className={styles.trap} aria-hidden="true">
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(event) => setTrap(event.target.value)}
        />
      </div>

      <p id={ids.note} className={styles.note}>
        {form.note}
      </p>

      {/* Always in the page, with room for two lines, so a message never moves anything. */}
      <p id={ids.message} className={styles.message} data-status={status} aria-live="polite">
        {message}
      </p>
    </form>
  )
}
