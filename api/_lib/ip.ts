/**
 * The caller's public IP address, for the one place this site forwards it to a third party:
 * Buttondown's `ip_address` field, which its firewall uses to score a new subscriber.
 *
 * `vercel dev` and any other local proxy-less run see the raw socket address, which is the IPv6
 * loopback `::1`. Sending that to Buttondown as if it were the subscriber's address makes every
 * local subscriber look like the same "IP", which its firewall flags as reused by many low-quality
 * subscribers and blocks. The fix is to never forward a loopback, private, link-local or otherwise
 * non-public address — only a real public IP is worth sending, and no IP is better than a wrong one.
 *
 * Header order (Vercel docs, "Retrieving the client's IP address", checked 2026-09-22):
 * `x-vercel-forwarded-for` is set by Vercel's edge network itself and cannot be spoofed by the
 * client. `x-forwarded-for` and `x-real-ip` are kept as fallbacks for setups where that header is
 * absent (`vercel dev`, other hosts), but a client can set either of those directly, so they are
 * only ever used as a *candidate* to validate, never trusted outright.
 */

import { isIP } from 'node:net'

const CANDIDATE_HEADERS = ['x-vercel-forwarded-for', 'x-forwarded-for', 'x-real-ip']

/** The first address a proxy chain reports, unvalidated. Also used as the rate limiter's key. */
export function candidateClientIp(request: Request): string | undefined {
  for (const header of CANDIDATE_HEADERS) {
    const value = request.headers.get(header)
    if (!value) continue
    const first = value.split(',')[0]?.trim()
    if (first) return first
  }
  return undefined
}

function isPrivateIPv4(address: string): boolean {
  const octets = address.split('.').map(Number)
  const [a, b] = octets
  return (
    a === 0 || // "this network" / unspecified
    a === 10 || // RFC 1918
    a === 127 || // loopback
    (a === 169 && b === 254) || // link-local
    (a === 172 && b >= 16 && b <= 31) || // RFC 1918
    (a === 192 && b === 168) // RFC 1918
  )
}

function isPrivateIPv6(address: string): boolean {
  const lower = address.toLowerCase()
  if (lower === '::' || lower === '::1') return true // unspecified / loopback
  if (/^fe[89ab][0-9a-f]:/.test(lower)) return true // link-local, fe80::/10
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true // unique local, fc00::/7

  // IPv4-mapped (::ffff:a.b.c.d): a public-looking IPv6 wrapper around an IPv4 address underneath.
  const mapped = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(lower)
  if (mapped) return isIP(mapped[1]) === 4 && isPrivateIPv4(mapped[1])

  return false
}

/**
 * The caller's public IP, or undefined when there isn't one: no candidate header, a value that
 * isn't a valid IP, or a loopback/private/link-local address (including in local development).
 */
export function getPublicClientIp(request: Request): string | undefined {
  const candidate = candidateClientIp(request)
  if (!candidate) return undefined

  const version = isIP(candidate)
  if (version === 4) return isPrivateIPv4(candidate) ? undefined : candidate
  if (version === 6) return isPrivateIPv6(candidate) ? undefined : candidate
  return undefined
}
