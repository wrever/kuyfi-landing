import { describe, expect, it } from 'vitest'
import { hostContext } from './url'

describe('hostContext', () => {
  it('strips the scheme, and "www." when present', () => {
    expect(hostContext('https://github.com/alex0tico/kuyfi')).toBe('github.com')
    expect(hostContext('https://www.npmjs.com/package/@kuyfi/kuyfi')).toBe('npmjs.com')
  })

  it('keeps the path only when asked', () => {
    expect(hostContext('https://github.com/alex0tico/kuyfi', true)).toBe(
      'github.com/alex0tico/kuyfi',
    )
    expect(hostContext('https://github.com/alex0tico/kuyfi', false)).toBe('github.com')
  })
})
