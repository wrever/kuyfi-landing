import { describe, expect, it } from 'vitest'
import { candidateClientIp, getPublicClientIp } from '../../api/_lib/ip'

const request = (headers: Record<string, string> = {}) =>
  new Request('https://kuyfi.test/api/subscribe', { method: 'POST', headers })

describe('candidateClientIp', () => {
  it('prefers x-vercel-forwarded-for, then x-forwarded-for, then x-real-ip', () => {
    expect(
      candidateClientIp(
        request({
          'x-vercel-forwarded-for': '203.0.113.1',
          'x-forwarded-for': '203.0.113.2',
          'x-real-ip': '203.0.113.3',
        }),
      ),
    ).toBe('203.0.113.1')
    expect(
      candidateClientIp(request({ 'x-forwarded-for': '203.0.113.2', 'x-real-ip': '203.0.113.3' })),
    ).toBe('203.0.113.2')
    expect(candidateClientIp(request({ 'x-real-ip': '203.0.113.3' }))).toBe('203.0.113.3')
  })

  it('takes only the first hop of a forwarded chain', () => {
    expect(candidateClientIp(request({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    )
  })

  it('is undefined with no candidate header', () => {
    expect(candidateClientIp(request())).toBeUndefined()
  })
})

describe('getPublicClientIp', () => {
  const withIp = (ip: string) => getPublicClientIp(request({ 'x-forwarded-for': ip }))

  it('omits local development addresses (::1, 127.0.0.1)', () => {
    expect(withIp('::1')).toBeUndefined()
    expect(withIp('127.0.0.1')).toBeUndefined()
  })

  it.each(['192.168.1.10', '10.0.0.1', '10.255.255.255', '172.16.0.1', '172.31.255.255'])(
    'omits private IPv4 %s',
    (ip) => {
      expect(withIp(ip)).toBeUndefined()
    },
  )

  it.each(['169.254.1.1', '0.0.0.0'])('omits link-local/unspecified IPv4 %s', (ip) => {
    expect(withIp(ip)).toBeUndefined()
  })

  it.each(['172.15.255.255', '172.32.0.0', '11.0.0.1'])(
    'does not treat addresses just outside the private ranges as private: %s',
    (ip) => {
      expect(withIp(ip)).toBe(ip)
    },
  )

  it.each(['::', 'fe80::1', 'fc00::1', 'fd00::1'])(
    'omits IPv6 loopback/unspecified/link-local/unique-local %s',
    (ip) => {
      expect(withIp(ip)).toBeUndefined()
    },
  )

  it('omits an IPv4-mapped IPv6 address that wraps a private IPv4', () => {
    expect(withIp('::ffff:10.0.0.1')).toBeUndefined()
  })

  it('sends a public IPv4-mapped IPv6 address', () => {
    expect(withIp('::ffff:203.0.113.7')).toBe('::ffff:203.0.113.7')
  })

  it('sends a valid public IPv4 address', () => {
    expect(withIp('203.0.113.7')).toBe('203.0.113.7')
  })

  it('sends a valid public IPv6 address', () => {
    expect(withIp('2001:db8::1')).toBe('2001:db8::1')
  })

  it('is undefined for garbage that is not a valid IP', () => {
    expect(withIp('<script>')).toBeUndefined()
    expect(withIp('not-an-ip')).toBeUndefined()
    expect(withIp('999.999.999.999')).toBeUndefined()
  })

  it('is undefined with no candidate header at all', () => {
    expect(getPublicClientIp(request())).toBeUndefined()
  })
})
