import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * SEO/social metadata and favicon files. These live in index.html and public/, outside src/, so
 * they get their own tests here rather than in src/content.
 */

const root = process.cwd()
const html = readFileSync(join(root, 'index.html'), 'utf8')
const CANONICAL = 'https://kuyfi.vercel.app/'

/** Width/height of a PNG, read straight from its IHDR chunk (bytes 16-23). No new dependency. */
function pngSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path)
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

describe('index.html: core tags', () => {
  it('has the agreed title and a factual description with no absolute claims', () => {
    expect(html).toMatch(/<title>Kuyfi \| Black-box security for Soroban<\/title>/)
    expect(html).toMatch(
      /name="description"\s+content="Kuyfi is an open-source, black-box security tool for Soroban\./,
    )
    expect(html).not.toMatch(/guarantee|100% secure|unhackable|fully audited/i)
  })

  it('has viewport, robots, theme-color and a canonical pointing at the real domain', () => {
    expect(html).toMatch(/name="viewport" content="width=device-width, initial-scale=1\.0"/)
    expect(html).toMatch(/name="robots" content="index, follow"/)
    expect(html).toMatch(/name="theme-color" content="#0e1113"/)
    expect(html).toMatch(new RegExp(`rel="canonical" href="${CANONICAL}"`))
  })
})

describe('index.html: Open Graph and Twitter Card', () => {
  it('declares an absolute image URL matching the canonical origin, at 1200x630', () => {
    expect(html).toMatch(
      /property="og:image" content="https:\/\/kuyfi\.vercel\.app\/og-image\.jpg"/,
    )
    expect(html).toMatch(/property="og:image:width" content="1200"/)
    expect(html).toMatch(/property="og:image:height" content="630"/)
    expect(html).toMatch(/name="twitter:card" content="summary_large_image"/)
    expect(html).toMatch(
      /name="twitter:image" content="https:\/\/kuyfi\.vercel\.app\/og-image\.jpg"/,
    )
  })

  it('shares one title and description between the page, Open Graph and Twitter', () => {
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
    const ogTitle = html.match(/property="og:title" content="([^"]+)"/)?.[1]
    const twitterTitle = html.match(/name="twitter:title" content="([^"]+)"/)?.[1]
    expect(ogTitle).toBe(title)
    expect(twitterTitle).toBe(title)
  })

  it('invents no social account: no twitter:site meta tag, no handle', () => {
    expect(html).not.toMatch(/name="twitter:site"|name="twitter:creator"/)
    expect(html).not.toMatch(/@\w*kuyfi/i)
  })
})

describe('favicon and touch icon', () => {
  it('links an SVG icon plus PNG fallbacks and an apple-touch-icon, all root-relative', () => {
    expect(html).toMatch(/rel="icon" href="\/favicon\.svg" type="image\/svg\+xml"/)
    expect(html).toMatch(/rel="icon" href="\/favicon-32x32\.png" sizes="32x32"/)
    expect(html).toMatch(/rel="icon" href="\/favicon-16x16\.png" sizes="16x16"/)
    expect(html).toMatch(/rel="apple-touch-icon" href="\/apple-touch-icon\.png"/)
    expect(html).not.toMatch(/href="data:,"/)
  })

  it('ships the real Kuyfi mark, not a placeholder: an SVG plus every referenced PNG exists', () => {
    for (const file of [
      'favicon.svg',
      'favicon-32x32.png',
      'favicon-16x16.png',
      'apple-touch-icon.png',
      'og-image.jpg',
    ]) {
      expect(existsSync(join(root, 'public', file)), file).toBe(true)
    }
    // Fewer than a real drawing would produce, but enough to rule out a 1x1 placeholder.
    expect(statSync(join(root, 'public', 'favicon.svg')).size).toBeGreaterThan(1000)
  })

  it('has the PNG icons at the sizes their <link> tags declare', () => {
    expect(pngSize(join(root, 'public', 'favicon-32x32.png'))).toEqual({ width: 32, height: 32 })
    expect(pngSize(join(root, 'public', 'favicon-16x16.png'))).toEqual({ width: 16, height: 16 })
    expect(pngSize(join(root, 'public', 'apple-touch-icon.png'))).toEqual({
      width: 180,
      height: 180,
    })
  })

  it('keeps the OG image a reasonable size for a fast link preview', () => {
    const size = statSync(join(root, 'public', 'og-image.jpg')).size
    expect(size).toBeGreaterThan(5_000)
    expect(size).toBeLessThan(300_000)
  })
})
