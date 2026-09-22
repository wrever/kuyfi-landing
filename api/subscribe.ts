/**
 * POST /api/subscribe: the only place that talks to the mailing provider (Buttondown).
 *
 *   browser form  ->  POST /api/subscribe  ->  Buttondown API
 *
 * The API key exists only here, read from the BUTTONDOWN_API_KEY environment variable on the server.
 * Nothing in src/ imports this file's runtime code, references the key, or calls the provider.
 *
 * Contract used (Buttondown docs, "Creating a subscriber", checked 2026-09-21):
 *   POST https://api.buttondown.com/v1/subscribers
 *   Authorization: Token <key>      body: { email_address, ip_address? }
 *   201 = created. By default the subscriber is "unactivated" and Buttondown emails them a
 *   confirmation link (double opt-in), so a success here means "check your email", not "confirmed".
 *   Creating an address that already exists is rejected (400 or 409) and nothing is overwritten.
 *   429 = rate limited (POST /v1/subscribers is limited to 100 requests a day per newsletter).
 *   The docs do not name the error code for a duplicate, so it is recognised by pattern when a code
 *   is present, and anything unrecognised becomes a neutral UPSTREAM_ERROR. Its status and code are
 *   logged (never the body, the address or the key) so the mapping can be confirmed with a real
 *   duplicate test.
 *
 * Every response is neutral JSON: { ok, code }. The provider's error bodies are never returned.
 *
 * Vercel runs this as a Node function through the `fetch` Web Standard export. The logic lives in
 * handleSubscribe, which takes a Request and returns a Response so it can be tested with no network.
 */

/** Results the browser understands. Kept in step with src/lib/subscribe.ts (a test checks it). */
export const SUBSCRIBE_CODES = [
  'SUCCESS',
  'ALREADY_SUBSCRIBED',
  'INVALID_EMAIL',
  'RATE_LIMITED',
  'UPSTREAM_ERROR',
] as const
export type SubscribeCode = (typeof SUBSCRIBE_CODES)[number]

/** Codes about the request itself rather than the subscription. The browser treats them as errors. */
type RequestCode = 'METHOD_NOT_ALLOWED' | 'INVALID_REQUEST'

const PROVIDER_URL = 'https://api.buttondown.com/v1/subscribers'
const MAX_BODY_CHARS = 2048
const UPSTREAM_TIMEOUT_MS = 8000

/** Hidden form field. People never fill it; simple bots do. */
export const HONEYPOT_FIELD = 'website'

const STATUS: Record<SubscribeCode | RequestCode, number> = {
  SUCCESS: 200,
  ALREADY_SUBSCRIBED: 409,
  INVALID_EMAIL: 400,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  METHOD_NOT_ALLOWED: 405,
  INVALID_REQUEST: 400,
}

/** A plausible address, not a proof. The provider does the real validation. */
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

export interface RateLimiter {
  allow(key: string): boolean
}

/**
 * A small sliding-window limiter held in memory. It is best effort: every serverless instance has
 * its own memory, so it only slows down bursts. A real limit belongs at the edge (a Vercel Firewall
 * rate limit rule); this keeps a burst from using up the provider's daily allowance.
 */
export function createRateLimiter(options: {
  limit: number
  windowMs: number
  now?: () => number
}): RateLimiter {
  const { limit, windowMs, now = Date.now } = options
  const hits = new Map<string, number[]>()

  return {
    allow(key) {
      const time = now()
      const cutoff = time - windowMs
      const recent = (hits.get(key) ?? []).filter((at) => at > cutoff)
      if (recent.length >= limit) {
        hits.set(key, recent)
        return false
      }
      recent.push(time)
      hits.set(key, recent)
      if (hits.size > 1000) {
        for (const [other, times] of hits) {
          if (!times.some((at) => at > cutoff)) hits.delete(other)
        }
      }
      return true
    },
  }
}

const defaultLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })

/** The caller's address as Vercel reports it, or null. The provider asks for it to judge spam. */
function clientIp(request: Request): string | null {
  const first = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return first && /^[0-9a-f:.]{3,45}$/i.test(first) ? first : null
}

/** Turns what the provider answered into one of our own codes. Unknown answers are errors. */
export function mapUpstream(status: number, body: unknown): SubscribeCode {
  if (status === 200 || status === 201) return 'SUCCESS'
  if (status === 429) return 'RATE_LIMITED'
  if (status === 409) return 'ALREADY_SUBSCRIBED'

  if (status === 400 || status === 422) {
    const code = upstreamCode(body).toLowerCase()
    if (/already|exist|duplicate/.test(code)) return 'ALREADY_SUBSCRIBED'
    if (/rate|limit|quota/.test(code)) return 'RATE_LIMITED'
    if (/email|invalid/.test(code)) return 'INVALID_EMAIL'
  }
  return 'UPSTREAM_ERROR'
}

function upstreamCode(body: unknown): string {
  if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
    return body.code.slice(0, 80)
  }
  return ''
}

function reply(code: SubscribeCode | RequestCode, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ ok: code === 'SUCCESS', code }), {
    status: STATUS[code],
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

export interface SubscribeDeps {
  /** The provider key. Comes from the environment; injected here so tests never need a real one. */
  apiKey?: string
  /** The network. Injected so tests can answer as the provider without a request. */
  fetch?: typeof fetch
  limiter?: RateLimiter
  timeoutMs?: number
  /** Server-side diagnostics. Receives short labels and numbers only, never an address or the key. */
  log?: (event: string, details?: Record<string, string | number>) => void
}

const defaultLog: NonNullable<SubscribeDeps['log']> = (event, details) => {
  console.error('[subscribe]', event, details ?? {})
}

export async function handleSubscribe(
  request: Request,
  deps: SubscribeDeps = {},
): Promise<Response> {
  const log = deps.log ?? defaultLog

  if (request.method !== 'POST') return reply('METHOD_NOT_ALLOWED', { Allow: 'POST' })

  let data: unknown
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_CHARS) return reply('INVALID_REQUEST')
    data = JSON.parse(raw)
  } catch {
    return reply('INVALID_REQUEST')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply('INVALID_REQUEST')

  const fields = data as Record<string, unknown>

  // A filled honeypot is a bot. Answer as if it worked, and do nothing.
  const trap = fields[HONEYPOT_FIELD]
  if (trap !== undefined && trap !== null && trap !== false && trap !== '') {
    return reply('SUCCESS')
  }

  const email = fields.email
  if (typeof email !== 'string' || !isPlausibleEmail(email)) return reply('INVALID_EMAIL')

  const ip = clientIp(request)
  if (!(deps.limiter ?? defaultLimiter).allow(ip ?? 'unknown')) return reply('RATE_LIMITED')

  if (!deps.apiKey) {
    log('not_configured')
    return new Response(JSON.stringify({ ok: false, code: 'UPSTREAM_ERROR' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  let upstream: Response
  try {
    upstream = await (deps.fetch ?? fetch)(PROVIDER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${deps.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email.trim(), ...(ip ? { ip_address: ip } : {}) }),
      signal: AbortSignal.timeout(deps.timeoutMs ?? UPSTREAM_TIMEOUT_MS),
    })
  } catch (error) {
    log(error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'unreachable')
    return reply('UPSTREAM_ERROR')
  }

  const body: unknown = await upstream.json().catch(() => null)
  const code = mapUpstream(upstream.status, body)
  if (code !== 'SUCCESS') {
    log('upstream', {
      status: upstream.status,
      upstreamCode: upstreamCode(body) || '-',
      result: code,
    })
  }
  return reply(code)
}

export default {
  fetch(request: Request): Promise<Response> {
    return handleSubscribe(request, { apiKey: process.env.BUTTONDOWN_API_KEY })
  },
}
