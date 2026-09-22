import { describe, expect, it, vi } from 'vitest'
import {
  HONEYPOT_FIELD,
  RESULT_STATUSES,
  SUBSCRIBE_CODES,
  isPlausibleEmail,
  requestSubscription,
  statusFromCode,
} from './subscribe'

/** A fake /api/subscribe. Nothing here touches the network. */
const server = (status: number, body: unknown) =>
  vi.fn(
    async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }),
  )

describe('statusFromCode', () => {
  it('gives every server code a state of its own', () => {
    expect(SUBSCRIBE_CODES.map(statusFromCode)).toEqual([...RESULT_STATUSES])
    expect(new Set(SUBSCRIBE_CODES.map(statusFromCode)).size).toBe(SUBSCRIBE_CODES.length)
  })
})

describe('isPlausibleEmail', () => {
  it('accepts ordinary addresses and rejects obvious mistakes', () => {
    for (const ok of ['reader@example.org', ' reader@example.org ', 'a.b+c@sub.example.co']) {
      expect(isPlausibleEmail(ok), ok).toBe(true)
    }
    for (const bad of ['', 'plain', 'a@b', '@x.org', 'x@', 'rea der@x.org', 'x@y..org', 'x@y.o']) {
      expect(isPlausibleEmail(bad), bad).toBe(false)
    }
  })
})

describe('requestSubscription', () => {
  it('posts JSON to /api/subscribe with the address and the hidden field', async () => {
    const fetchImpl = server(200, { ok: true, code: 'SUCCESS' })
    await requestSubscription('  reader@example.org ', '', { fetchImpl })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/subscribe')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'reader@example.org',
      [HONEYPOT_FIELD]: '',
    })
  })

  it('returns what the server says', async () => {
    const cases: Array<[number, string]> = [
      [200, 'SUCCESS'],
      [409, 'ALREADY_SUBSCRIBED'],
      [400, 'INVALID_EMAIL'],
      [429, 'RATE_LIMITED'],
      [502, 'UPSTREAM_ERROR'],
    ]
    for (const [status, code] of cases) {
      const fetchImpl = server(status, { ok: code === 'SUCCESS', code })
      expect(await requestSubscription('reader@example.org', '', { fetchImpl })).toBe(code)
    }
  })

  it('never invents a success: no server, wrong shape or wrong status is an error', async () => {
    const attempts: Array<[string, typeof fetch]> = [
      [
        'plain npm run dev, where /api does not exist',
        server(404, '<!doctype html><title>Not found</title>') as unknown as typeof fetch,
      ],
      ['a page instead of JSON', server(200, '<html></html>') as unknown as typeof fetch],
      ['unknown code', server(200, { ok: true, code: 'WELCOME' }) as unknown as typeof fetch],
      [
        'success code with ok false',
        server(200, { ok: false, code: 'SUCCESS' }) as unknown as typeof fetch,
      ],
      [
        'success code with an error status',
        server(500, { ok: true, code: 'SUCCESS' }) as unknown as typeof fetch,
      ],
      ['no body', server(200, 'null') as unknown as typeof fetch],
      [
        'network down',
        vi.fn(async () =>
          Promise.reject(new TypeError('Failed to fetch')),
        ) as unknown as typeof fetch,
      ],
    ]
    for (const [name, fetchImpl] of attempts) {
      expect(await requestSubscription('reader@example.org', '', { fetchImpl }), name).toBe(
        'UPSTREAM_ERROR',
      )
    }
  })

  it('gives up after the timeout instead of waiting forever', async () => {
    const fetchImpl = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          )
        }),
    ) as unknown as typeof fetch
    expect(await requestSubscription('reader@example.org', '', { fetchImpl, timeoutMs: 20 })).toBe(
      'UPSTREAM_ERROR',
    )
  })
})
