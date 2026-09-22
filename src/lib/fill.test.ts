import { describe, expect, it } from 'vitest'
import { fill } from './fill'

describe('fill', () => {
  it('replaces every placeholder', () => {
    expect(
      fill('Kuyfi {version} is released under the {license} license.', {
        version: 'v0.1.0',
        license: 'MIT',
      }),
    ).toBe('Kuyfi v0.1.0 is released under the MIT license.')
  })

  it('leaves text without placeholders alone', () => {
    expect(fill('Nothing to fill.', {})).toBe('Nothing to fill.')
  })

  it('throws on a placeholder with no value rather than rendering a hole', () => {
    expect(() => fill('for {version}', {})).toThrow(/Missing value for \{version\}/)
  })
})
