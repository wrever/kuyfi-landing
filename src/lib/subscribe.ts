/**
 * Browser side of the subscription. It only talks to this site's own /api/subscribe; the mailing
 * provider, its key and its errors are the server's business and never reach this code.
 *
 * There is no demo path. If the endpoint is not there (plain `npm run dev` does not run it), or
 * anything about the answer is unexpected, the result is UPSTREAM_ERROR. SUCCESS is returned only
 * when the server itself said so.
 */

/** Results the server can send. Kept in step with api/subscribe.ts (a test checks it). */
export const SUBSCRIBE_CODES = [
  'SUCCESS',
  'ALREADY_SUBSCRIBED',
  'INVALID_EMAIL',
  'RATE_LIMITED',
  'SUBSCRIBER_BLOCKED',
  'UPSTREAM_ERROR',
] as const
export type SubscribeCode = (typeof SUBSCRIBE_CODES)[number]

/** What the form is showing. */
export type SubscribeStatus =
  'idle' | 'loading' | 'success' | 'already' | 'invalid' | 'rate-limited' | 'blocked' | 'error'

/** Every state a finished request can end in, so the form and its copy can be checked against it. */
export const RESULT_STATUSES = [
  'success',
  'already',
  'invalid',
  'rate-limited',
  'blocked',
  'error',
] as const

export const HONEYPOT_FIELD = 'website'

/** A plausible address, not a proof. The same rule as the server's. */
export function isPlausibleEmail(value: string): boolean {
  const email = value.trim()
  return (
    email.length >= 6 &&
    email.length <= 254 &&
    !/[\s\p{Cc}]/u.test(email) &&
    !email.includes('..') &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  )
}

export function statusFromCode(code: SubscribeCode): SubscribeStatus {
  switch (code) {
    case 'SUCCESS':
      return 'success'
    case 'ALREADY_SUBSCRIBED':
      return 'already'
    case 'INVALID_EMAIL':
      return 'invalid'
    case 'RATE_LIMITED':
      return 'rate-limited'
    case 'SUBSCRIBER_BLOCKED':
      return 'blocked'
    case 'UPSTREAM_ERROR':
      return 'error'
  }
}

interface RequestOptions {
  endpoint?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

const isCode = (value: unknown): value is SubscribeCode =>
  typeof value === 'string' && (SUBSCRIBE_CODES as readonly string[]).includes(value)

/**
 * Sends the address to /api/subscribe and reports what the server said. `honeypot` is the hidden
 * field's value: empty for a person.
 */
export async function requestSubscription(
  email: string,
  honeypot: string,
  { endpoint = '/api/subscribe', fetchImpl = fetch, timeoutMs = 12000 }: RequestOptions = {},
): Promise<SubscribeCode> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), [HONEYPOT_FIELD]: honeypot }),
      signal: controller.signal,
    })
    const body: unknown = await response.json().catch(() => null)
    const code = body && typeof body === 'object' && 'code' in body ? body.code : null
    if (!isCode(code)) return 'UPSTREAM_ERROR'
    // A success needs the server to say ok and answer with a success status, both.
    if (code === 'SUCCESS' && !(response.ok && (body as { ok?: unknown }).ok === true)) {
      return 'UPSTREAM_ERROR'
    }
    return code
  } catch {
    return 'UPSTREAM_ERROR'
  } finally {
    clearTimeout(timer)
  }
}
