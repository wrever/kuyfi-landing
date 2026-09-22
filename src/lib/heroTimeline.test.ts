import { describe, expect, it } from 'vitest'
import {
  DIVE_MAX,
  VIDEO_PAUSE_AT,
  bloomOpacity,
  clamp01,
  copyInteractive,
  copyOpacity,
  copyShift,
  dive,
  frame2Opacity,
  parallaxFalloff,
  pointerOffset,
  videoCovered,
  wordmarkOpacity,
  wordmarkShift,
} from './heroTimeline'

const samples = Array.from({ length: 101 }, (_, i) => i / 100)

describe('clamp01', () => {
  it('clamps to [0, 1]', () => {
    expect(clamp01(-3)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(7)).toBe(1)
  })
})

describe('dive', () => {
  it('goes from 1 to ≈4.4 (the v2 prototype range)', () => {
    expect(dive(0)).toBe(1)
    expect(dive(1)).toBeCloseTo(4.4, 5)
    expect(DIVE_MAX).toBeCloseTo(4.4, 5)
  })

  it('never leaves its range when progress overshoots', () => {
    expect(dive(-1)).toBe(1)
    expect(dive(2)).toBeCloseTo(DIVE_MAX, 5)
  })

  it('is monotonic and eases in (slower than linear early on)', () => {
    for (let i = 1; i < samples.length; i++) {
      expect(dive(samples[i])).toBeGreaterThanOrEqual(dive(samples[i - 1]))
    }
    expect(dive(0.25) - 1).toBeLessThan(0.25 * (DIVE_MAX - 1))
  })

  it('accepts a different maximum (mobile tuning hook)', () => {
    expect(dive(1, 5.4)).toBeCloseTo(5.4, 5)
  })
})

describe('wordmark', () => {
  it('is fully visible at the start and gone by p = 0.5', () => {
    expect(wordmarkOpacity(0)).toBe(1)
    expect(wordmarkOpacity(0.5)).toBe(0)
    expect(wordmarkOpacity(1)).toBe(0)
  })

  it('drifts upward up to 28vh', () => {
    expect(wordmarkShift(0)).toBeCloseTo(0)
    expect(wordmarkShift(1)).toBe(-28)
  })
})

describe('copy', () => {
  it('fades out completely by p = 0.4', () => {
    expect(copyOpacity(0)).toBe(1)
    expect(copyOpacity(0.4)).toBe(0)
  })

  it('always fades no later than the wordmark (copy leaves first)', () => {
    for (const p of samples) {
      expect(copyOpacity(p)).toBeLessThanOrEqual(wordmarkOpacity(p) + 1e-12)
    }
  })

  it('drifts upward, but subtly compared to the wordmark', () => {
    expect(copyShift(0)).toBeCloseTo(0)
    expect(copyShift(1)).toBeLessThan(0)
    expect(Math.abs(copyShift(1))).toBeLessThan(Math.abs(wordmarkShift(1)))
  })

  it('stops being interactive once it is visually gone', () => {
    expect(copyInteractive(0)).toBe(true)
    expect(copyInteractive(0.39)).toBe(true)
    expect(copyInteractive(0.4)).toBe(false)
    expect(copyInteractive(1)).toBe(false)
  })
})

describe('frame-2 crossfade', () => {
  it('runs from p = 0.05 to p = 0.45', () => {
    expect(frame2Opacity(0.05)).toBe(0)
    expect(frame2Opacity(0.25)).toBeCloseTo(0.5, 5)
    expect(frame2Opacity(0.45)).toBe(1)
    expect(frame2Opacity(1)).toBe(1)
  })
})

describe('bloom', () => {
  it('runs from p = 0.42 to p = 0.90', () => {
    expect(bloomOpacity(0.42)).toBe(0)
    expect(bloomOpacity(0.66)).toBeCloseTo(0.5, 5)
    expect(bloomOpacity(0.9)).toBe(1)
    expect(bloomOpacity(1)).toBe(1)
  })

  it('never overlaps the copy: the flood starts only after the copy is gone', () => {
    for (const p of samples) {
      if (copyOpacity(p) > 0) expect(bloomOpacity(p)).toBe(0)
    }
  })
})

describe('parallax falloff', () => {
  it('is full at the start and zero at the end of the dive', () => {
    expect(parallaxFalloff(0)).toBe(1)
    expect(parallaxFalloff(1)).toBe(0)
    expect(parallaxFalloff(0.5)).toBeCloseTo(0.5, 5)
  })
})

describe('video coverage', () => {
  it('is only considered covered (safe to pause) when frame-2 is fully opaque', () => {
    for (const p of samples) {
      if (videoCovered(p)) expect(frame2Opacity(p)).toBe(1)
    }
    expect(videoCovered(VIDEO_PAUSE_AT)).toBe(false)
    expect(videoCovered(VIDEO_PAUSE_AT + 0.01)).toBe(true)
  })
})

describe('pointerOffset', () => {
  it('is 0 at the center and ± half the range at the edges', () => {
    expect(pointerOffset(720, 1440, 22)).toBe(0)
    expect(pointerOffset(0, 1440, 22)).toBe(-11)
    expect(pointerOffset(1440, 1440, 22)).toBe(11)
  })
})
