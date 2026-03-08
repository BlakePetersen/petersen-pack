// ABOUTME: Tests that theme.css contains the complete terminal design token palette.
// ABOUTME: Validates grayscale, accent, semantic colors, typography, and zero border-radius.
import { readFileSync } from 'fs'
import { resolve } from 'path'

const themeCss = readFileSync(
  resolve(__dirname, '../src/styles/theme.css'),
  'utf-8'
)

describe('theme.css', () => {
  describe('grayscale palette', () => {
    const grayscaleTokens = [
      'terminal-bg',
      'terminal-surface',
      'terminal-active',
      'terminal-border',
      'terminal-disabled',
      'terminal-muted',
      'terminal-secondary',
      'terminal-text'
    ]

    it.each(grayscaleTokens)(
      'contains %s color token',
      token => {
        expect(themeCss).toContain(`--color-${token}`)
      }
    )
  })

  it('contains amber-accent color token', () => {
    expect(themeCss).toContain('--color-amber-accent')
  })

  describe('semantic colors', () => {
    const semanticTokens = [
      'terminal-error',
      'terminal-warning',
      'terminal-success',
      'terminal-info'
    ]

    it.each(semanticTokens)(
      'contains %s color token',
      token => {
        expect(themeCss).toContain(`--color-${token}`)
      }
    )
  })

  describe('typography', () => {
    it('contains font-mono for JetBrains Mono', () => {
      expect(themeCss).toContain('--font-mono')
      expect(themeCss).toContain('JetBrains Mono')
    })

    it('contains font-mono-alt for IBM Plex Mono', () => {
      expect(themeCss).toContain('--font-mono-alt')
      expect(themeCss).toContain('IBM Plex Mono')
    })

    it('contains font-sans for Inter', () => {
      expect(themeCss).toContain('--font-sans')
      expect(themeCss).toContain('Inter')
    })
  })

  describe('border radius', () => {
    it('sets all radius values to 0px', () => {
      const radiusMatches = themeCss.match(/--radius-\w+:\s*0px/g)
      expect(radiusMatches).not.toBeNull()
      expect(radiusMatches!.length).toBeGreaterThanOrEqual(4)
    })
  })

  it('does NOT import tailwindcss', () => {
    expect(themeCss).not.toContain('@import')
    expect(themeCss).not.toContain('tailwindcss')
  })

  it('uses @theme directive', () => {
    expect(themeCss).toContain('@theme')
  })
})
