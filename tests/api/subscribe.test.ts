import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import subscribeFunction, {
  HONEYPOT_FIELD,
  SUBSCRIBE_CODES,
  createRateLimiter,
  handleSubscribe,
  isPlausibleEmail,
  mapUpstream,
  type SubscribeDeps,
} from '../../api/subscribe'
import {
  HONEYPOT_FIELD as CLIENT_HONEYPOT,
  SUBSCRIBE_CODES as CLIENT_CODES,
  isPlausibleEmail as clientIsPlausible,
} from '../../src/lib/subscribe'

/**
 * These tests never reach a real mailing provider and never create a subscriber. The provider is a
 * mock passed in as `fetch`, and the global fetch is replaced with one that fails the test if used.
 */

const KEY = 'test-key-not-a-real-secret'
const EMAIL = 'reader@example.org'

let globalFetch: ReturnType<typeof vi.fn>

beforeEach(() => {
  globalFetch = vi.fn(() => {
    throw new Error('A test tried to use the real network')
  })
  vi.stubGlobal('fetch', globalFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

interface Setup {
  upstream?: Response | (() => Response | Promise<Response>)
  deps?: Partial<SubscribeDeps>
}

function setup({ upstream, deps }: Setup = {}) {
  const provider = vi.fn<typeof fetch>(async () => {
    const next = typeof upstream === 'function' ? await upstream() : upstream
    return next ?? new Response(JSON.stringify({ id: 'sub_fake' }), { status: 201 })
  })
  const logs: string[] = []
  const options: SubscribeDeps = {
    apiKey: KEY,
    fetch: provider,
    limiter: createRateLimiter({ limit: 1000, windowMs: 60_000 }),
    log: (event, details) => logs.push(`${event} ${JSON.stringify(details ?? {})}`),
    ...deps,
  }
  const call = (body: unknown, init: RequestInit & { ip?: string } = {}) => {
    const { ip, ...rest } = init
    return handleSubscribe(
      new Request('https://kuyfi.test/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(ip ? { 'x-forwarded-for': ip } : {}) },
        body: typeof body === 'string' ? body : JSON.stringify(body),
        ...rest,
      }),
      options,
    )
  }
  return { provider, logs, call, options }
}

const readJson = async (response: Response) => (await response.json()) as Record<string, unknown>

describe('methods', () => {
  it.each(['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD'])(
    'rejects %s with 405 and an Allow header',
    async (method) => {
      const { provider, options } = setup()
      const response = await handleSubscribe(
        new Request('https://kuyfi.test/api/subscribe', { method }),
        options,
      )
      expect(response.status).toBe(405)
      expect(response.headers.get('Allow')).toBe('POST')
      expect(provider).not.toHaveBeenCalled()
      if (method !== 'HEAD')
        expect(await readJson(response)).toEqual({ ok: false, code: 'METHOD_NOT_ALLOWED' })
    },
  )
})

describe('request validation', () => {
  it('rejects a body that is not JSON', async () => {
    const { call, provider } = setup()
    const response = await call('email=reader@example.org')
    expect(response.status).toBe(400)
    expect(await readJson(response)).toEqual({ ok: false, code: 'INVALID_REQUEST' })
    expect(provider).not.toHaveBeenCalled()
  })

  it('rejects JSON that is not an object, and oversized bodies', async () => {
    const { call, provider } = setup()
    for (const body of [
      '[]',
      '"text"',
      'null',
      '42',
      JSON.stringify({ email: 'a'.repeat(5000) }),
    ]) {
      const response = await call(body)
      expect(response.status, body.slice(0, 20)).toBe(400)
      expect((await readJson(response)).code).toBe('INVALID_REQUEST')
    }
    expect(provider).not.toHaveBeenCalled()
  })

  it.each([
    [''],
    ['   '],
    ['plain'],
    ['no-at-sign.example.org'],
    ['a@b'],
    ['@example.org'],
    ['reader@'],
    ['reader@@example.org'],
    ['rea der@example.org'],
    ['reader@example..org'],
    ['reader@example.o'],
    [`${'a'.repeat(250)}@example.org`],
  ])('answers INVALID_EMAIL for %j without calling the provider', async (email) => {
    const { call, provider } = setup()
    const response = await call({ email })
    expect(response.status).toBe(400)
    expect(await readJson(response)).toEqual({ ok: false, code: 'INVALID_EMAIL' })
    expect(provider).not.toHaveBeenCalled()
  })

  it('answers INVALID_EMAIL when the email is missing or not a string', async () => {
    const { call, provider } = setup()
    for (const body of [{}, { email: 42 }, { email: ['reader@example.org'] }, { email: null }]) {
      expect((await readJson(await call(body))).code).toBe('INVALID_EMAIL')
    }
    expect(provider).not.toHaveBeenCalled()
  })
})

describe('honeypot', () => {
  it('quietly succeeds without contacting the provider when the hidden field is filled', async () => {
    const { call, provider } = setup()
    const response = await call({ email: EMAIL, [HONEYPOT_FIELD]: 'https://spam.example' })
    expect(response.status).toBe(200)
    expect(await readJson(response)).toEqual({ ok: true, code: 'SUCCESS' })
    expect(provider).not.toHaveBeenCalled()
  })

  it('does so even for an address that would be invalid, so a bot learns nothing', async () => {
    const { call, provider } = setup()
    expect((await readJson(await call({ email: 'nope', [HONEYPOT_FIELD]: 'x' }))).code).toBe(
      'SUCCESS',
    )
    expect(provider).not.toHaveBeenCalled()
  })

  it('treats an empty hidden field as a person', async () => {
    const { call, provider } = setup()
    await call({ email: EMAIL, [HONEYPOT_FIELD]: '' })
    expect(provider).toHaveBeenCalledTimes(1)
  })

  it('uses the same field name as the browser', () => {
    expect(HONEYPOT_FIELD).toBe(CLIENT_HONEYPOT)
  })
})

describe('the request sent to the provider', () => {
  it('is one POST with the server-side key and the address, and a timeout', async () => {
    const { call, provider } = setup()
    await call({ email: `  ${EMAIL}  ` })

    expect(provider).toHaveBeenCalledTimes(1)
    const [url, init] = provider.mock.calls[0]
    expect(url).toBe('https://api.buttondown.com/v1/subscribers')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual({
      Authorization: `Token ${KEY}`,
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(init?.body as string)).toEqual({ email_address: EMAIL })
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('does not set a subscriber type, so the provider keeps its double opt-in', async () => {
    const { call, provider } = setup()
    await call({ email: EMAIL })
    expect(Object.keys(JSON.parse(provider.mock.calls[0][1]?.body as string))).toEqual([
      'email_address',
    ])
  })

  it('passes on the caller address the provider asks for, only when it looks like one', async () => {
    const good = setup()
    await good.call({ email: EMAIL }, { ip: '203.0.113.7, 10.0.0.1' })
    expect(JSON.parse(good.provider.mock.calls[0][1]?.body as string)).toEqual({
      email_address: EMAIL,
      ip_address: '203.0.113.7',
    })

    const bad = setup()
    await bad.call({ email: EMAIL }, { ip: '<script>' })
    expect(JSON.parse(bad.provider.mock.calls[0][1]?.body as string)).toEqual({
      email_address: EMAIL,
    })
  })

  describe('local and private addresses are never forwarded as the subscriber IP', () => {
    it.each([
      '::1', // vercel dev, loopback IPv6
      '127.0.0.1', // loopback IPv4
      '192.168.1.10', // private IPv4
      '10.0.0.5', // private IPv4
      '172.16.0.1', // private IPv4
      '172.31.255.255', // private IPv4
      '169.254.1.1', // link-local IPv4
      '::', // unspecified IPv6
      'fe80::1', // link-local IPv6
      'fc00::1', // unique-local IPv6
    ])('omits ip_address for %s', async (ip) => {
      const { call, provider } = setup()
      await call({ email: EMAIL }, { ip })
      expect(JSON.parse(provider.mock.calls[0][1]?.body as string)).toEqual({
        email_address: EMAIL,
      })
    })

    it.each([
      ['203.0.113.7', '203.0.113.7'], // public IPv4
      ['2001:db8::1', '2001:db8::1'], // public IPv6
    ])('sends ip_address for a public address (%s)', async (ip, expected) => {
      const { call, provider } = setup()
      await call({ email: EMAIL }, { ip })
      expect(JSON.parse(provider.mock.calls[0][1]?.body as string)).toEqual({
        email_address: EMAIL,
        ip_address: expected,
      })
    })
  })

  it('never uses the real network', async () => {
    const { call } = setup()
    await call({ email: EMAIL })
    expect(globalFetch).not.toHaveBeenCalled()
  })
})

describe('response states', () => {
  const answer = (status: number, body: unknown = {}) =>
    new Response(JSON.stringify(body), { status })

  it('201 is SUCCESS', async () => {
    const { call } = setup({ upstream: answer(201, { id: 'sub_fake', type: 'unactivated' }) })
    const response = await call({ email: EMAIL })
    expect(response.status).toBe(200)
    expect(await readJson(response)).toEqual({ ok: true, code: 'SUCCESS' })
  })

  it.each([
    [409, {}],
    [400, { code: 'email_already_exists' }],
    [400, { code: 'subscriber_already_exists', detail: 'x' }],
    [422, { code: 'duplicate_subscriber' }],
  ])('%i %j is ALREADY_SUBSCRIBED', async (status, body) => {
    const { call } = setup({ upstream: answer(status, body) })
    const response = await call({ email: EMAIL })
    expect(response.status).toBe(409)
    expect(await readJson(response)).toEqual({ ok: false, code: 'ALREADY_SUBSCRIBED' })
  })

  it.each([
    [429, {}],
    [400, { code: 'rate_limited' }],
    [400, { code: 'daily_subscriber_limit_exceeded' }],
  ])('%i %j is RATE_LIMITED', async (status, body) => {
    const { call } = setup({ upstream: answer(status, body) })
    const response = await call({ email: EMAIL })
    expect(response.status).toBe(429)
    expect((await readJson(response)).code).toBe('RATE_LIMITED')
  })

  it('a provider rejection of the address is INVALID_EMAIL', async () => {
    const { call } = setup({ upstream: answer(400, { code: 'email_invalid' }) })
    expect((await readJson(await call({ email: EMAIL }))).code).toBe('INVALID_EMAIL')
  })

  it('a firewall block is SUBSCRIBER_BLOCKED, mapped to 400 without the provider detail', async () => {
    const { call, logs } = setup({
      upstream: answer(400, {
        code: 'subscriber_blocked',
        detail: 'This subscriber was blocked by your firewall.',
      }),
    })
    const response = await call({ email: EMAIL })
    expect(response.status).toBe(400)
    expect(await readJson(response)).toEqual({ ok: false, code: 'SUBSCRIBER_BLOCKED' })
    expect(logs.join(' ')).not.toContain('firewall')
  })

  it.each([
    [400, { code: 'something_new' }],
    [400, null],
    [401, { code: 'unauthorized' }],
    [403, { code: 'forbidden' }],
    [404, {}],
    [500, {}],
    [503, {}],
  ])('%i %j is a neutral UPSTREAM_ERROR', async (status, body) => {
    const { call } = setup({ upstream: answer(status, body) })
    const response = await call({ email: EMAIL })
    expect(response.status).toBe(502)
    expect(await readJson(response)).toEqual({ ok: false, code: 'UPSTREAM_ERROR' })
  })

  it('a network failure or a timeout is UPSTREAM_ERROR', async () => {
    const unreachable = setup({ upstream: () => Promise.reject(new TypeError('fetch failed')) })
    expect((await readJson(await unreachable.call({ email: EMAIL }))).code).toBe('UPSTREAM_ERROR')

    const timedOut = setup({
      upstream: () =>
        Promise.reject(Object.assign(new Error('timed out'), { name: 'TimeoutError' })),
    })
    expect((await readJson(await timedOut.call({ email: EMAIL }))).code).toBe('UPSTREAM_ERROR')
    expect(timedOut.logs.join(' ')).toContain('timeout')
  })

  it('a provider answer that is not JSON is still handled', async () => {
    const { call } = setup({ upstream: new Response('<html>bad gateway</html>', { status: 502 }) })
    expect((await readJson(await call({ email: EMAIL }))).code).toBe('UPSTREAM_ERROR')
  })

  it('without a key it is UPSTREAM_ERROR (503) and the provider is never called', async () => {
    const { call, provider, logs } = setup({ deps: { apiKey: undefined } })
    const response = await call({ email: EMAIL })
    expect(response.status).toBe(503)
    expect(await readJson(response)).toEqual({ ok: false, code: 'UPSTREAM_ERROR' })
    expect(provider).not.toHaveBeenCalled()
    expect(logs[0]).toContain('not_configured')
  })

  it('only ever answers with the fixed codes, as JSON that is never cached', async () => {
    const { call } = setup()
    const response = await call({ email: EMAIL })
    expect(response.headers.get('Content-Type')).toMatch(/^application\/json/)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(Object.keys(await readJson(response)).sort()).toEqual(['code', 'ok'])
    expect(SUBSCRIBE_CODES).toEqual([
      'SUCCESS',
      'ALREADY_SUBSCRIBED',
      'INVALID_EMAIL',
      'RATE_LIMITED',
      'SUBSCRIBER_BLOCKED',
      'UPSTREAM_ERROR',
    ])
  })
})

describe('nothing leaks', () => {
  it('never returns or logs the key, the address or the provider error body', async () => {
    const secretDetail = 'internal-detail-from-provider'
    const { call, logs } = setup({
      upstream: new Response(
        JSON.stringify({ code: 'unauthorized', detail: secretDetail, token: KEY }),
        {
          status: 401,
        },
      ),
    })
    const response = await call({ email: EMAIL })
    const text = await response.text()
    const everything = [text, ...logs, JSON.stringify([...response.headers])].join('\n')

    expect(everything).not.toContain(KEY)
    expect(everything).not.toContain(EMAIL)
    expect(everything).not.toContain(secretDetail)
    expect(logs.join(' ')).toContain('"upstreamCode":"unauthorized"')
  })

  it('exposes the function to Vercel through the fetch Web Standard export only', () => {
    expect(typeof subscribeFunction.fetch).toBe('function')
  })
})

describe('rate limiting', () => {
  it('lets a burst through and then answers RATE_LIMITED before touching the provider', async () => {
    let now = 0
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => now })
    const { call, provider } = setup({ deps: { limiter } })

    const codes: unknown[] = []
    for (let i = 0; i < 5; i++)
      codes.push((await readJson(await call({ email: EMAIL }, { ip: '198.51.100.1' }))).code)

    expect(codes).toEqual(['SUCCESS', 'SUCCESS', 'SUCCESS', 'RATE_LIMITED', 'RATE_LIMITED'])
    expect(provider).toHaveBeenCalledTimes(3)

    // Another caller is not affected, and the window slides.
    expect((await readJson(await call({ email: EMAIL }, { ip: '198.51.100.2' }))).code).toBe(
      'SUCCESS',
    )
    now = 61_000
    expect((await readJson(await call({ email: EMAIL }, { ip: '198.51.100.1' }))).code).toBe(
      'SUCCESS',
    )
  })

  it('does not count invalid requests or honeypot hits against the limit', async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 })
    const { call } = setup({ deps: { limiter } })
    await call({ email: 'bad' })
    await call({ email: EMAIL, [HONEYPOT_FIELD]: 'x' })
    expect((await readJson(await call({ email: EMAIL }))).code).toBe('SUCCESS')
  })
})

describe('pure helpers', () => {
  it('mapUpstream never turns an unknown answer into a success', () => {
    for (const status of [204, 301, 400, 401, 403, 404, 418, 500, 502]) {
      expect(mapUpstream(status, null), String(status)).toBe('UPSTREAM_ERROR')
    }
    expect(mapUpstream(201, null)).toBe('SUCCESS')
  })

  it('agrees with the browser on the codes and on what a plausible address is', () => {
    expect([...SUBSCRIBE_CODES]).toEqual([...CLIENT_CODES])
    for (const value of [
      'reader@example.org',
      ' reader@example.org ',
      'a.b+c@sub.example.co',
      'nope',
      'a@b',
      'x@y..z',
      '',
      'rea der@example.org',
    ]) {
      expect(isPlausibleEmail(value), value).toBe(clientIsPlausible(value))
    }
  })
})
