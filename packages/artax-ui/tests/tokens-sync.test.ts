// ABOUTME: Sync test verifying that tokens.ts entries correspond to CSS custom properties in theme.css.
// ABOUTME: Catches drift between the TypeScript token map and the source-of-truth CSS file.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { tokens } from '@/styles/tokens'

const themeCss = readFileSync(
  resolve(__dirname, '../src/styles/theme.css'),
  'utf-8'
)

/** Convert a camelCase key to its kebab-case CSS custom property name. */
function toCustomProperty(prefix: string, key: string): string {
  const kebab = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
  return `--${prefix}-${kebab}`
}

/** Convert a Tailwind class value to its CSS custom property name. */
function valueToCssProperty(value: string): string {
  // Strip the utility prefix (bg-, text-, border-, ring-, font-) to get the semantic name
  const withoutPrefix = value.replace(/^(?:bg|text|border|ring|font)-/, '')
  // Determine the CSS namespace from the value prefix
  const cssPrefix = value.startsWith('font-') ? 'font' : 'color'
  return `--${cssPrefix}-${withoutPrefix}`
}

/**
 * Assert that a token value starts with the expected Tailwind prefix and that
 * the CSS custom property derived from that value exists in theme.css.
 */
function expectValidToken(group: string, key: string, value: string): void {
  // Value must start with the group prefix (e.g. bg-, text-, border-)
  expect(value).toMatch(new RegExp(`^${group}-`))
  // The CSS property derived from the value (not the key) must exist in theme.css
  const cssProp = valueToCssProperty(value)
  expect(themeCss).toContain(cssProp)
}

describe('tokens sync with theme.css', () => {
  describe('bg tokens', () => {
    it.each(Object.entries(tokens.bg))(
      '%s maps to a valid --color-* property',
      (key, value) => {
        expectValidToken('bg', key, value)
      }
    )
  })

  describe('text tokens', () => {
    it.each(Object.entries(tokens.text))(
      '%s maps to a valid --color-* property',
      (key, value) => {
        expectValidToken('text', key, value)
      }
    )
  })

  describe('border tokens', () => {
    it.each(Object.entries(tokens.border))(
      '%s maps to a valid --color-* property',
      (key, value) => {
        expectValidToken('border', key, value)
      }
    )
  })

  describe('ring tokens', () => {
    it.each(Object.entries(tokens.ring))(
      '%s maps to a valid --color-* property',
      (key, value) => {
        expectValidToken('ring', key, value)
      }
    )
  })

  describe('font tokens', () => {
    it.each(Object.entries(tokens.font))(
      '%s maps to a valid --font-* property',
      (key, value) => {
        expectValidToken('font', key, value)
      }
    )
  })

  describe('CSS → tokens (reverse sync)', () => {
    /**
     * CSS custom properties that are intentionally excluded from the token map.
     * --radius-* properties are all set to 0px in the terminal aesthetic and
     * are not exposed as utility tokens since components never need non-zero radii.
     */
    const INTENTIONALLY_EXCLUDED = new Set([
      '--radius-sm',
      '--radius-md',
      '--radius-lg',
      '--radius-xl'
    ])

    /** Build a flat set of CSS custom property names that tokens.ts maps to. */
    function getAllTokenProperties(): Set<string> {
      const props = new Set<string>()
      for (const [group, entries] of Object.entries(tokens)) {
        const prefix = group === 'font' ? 'font' : 'color'
        for (const key of Object.keys(entries)) {
          props.add(toCustomProperty(prefix, key))
        }
      }
      return props
    }

    /** Extract all --color-*, --font-*, and --radius-* custom property definitions from theme.css. */
    function getCssProperties(): string[] {
      const matches = [
        ...themeCss.matchAll(/^\s*(--(color|font|radius)-[\w-]+)\s*:/gm)
      ]
      return [...new Set(matches.map(m => m[1]))]
    }

    it('every --color-*, --font-*, and --radius-* CSS property has a corresponding token', () => {
      const tokenProps = getAllTokenProperties()
      const cssProps = getCssProperties()
      const missing = cssProps.filter(
        p => !tokenProps.has(p) && !INTENTIONALLY_EXCLUDED.has(p)
      )
      expect(missing).toEqual([])
    })
  })

  describe('Tailwind class format', () => {
    it('bg tokens all start with bg-', () => {
      for (const val of Object.values(tokens.bg)) {
        expect(val).toMatch(/^bg-/)
      }
    })

    it('text tokens all start with text-', () => {
      for (const val of Object.values(tokens.text)) {
        expect(val).toMatch(/^text-/)
      }
    })

    it('border tokens all start with border-', () => {
      for (const val of Object.values(tokens.border)) {
        expect(val).toMatch(/^border-/)
      }
    })

    it('ring tokens all start with ring-', () => {
      for (const val of Object.values(tokens.ring)) {
        expect(val).toMatch(/^ring-/)
      }
    })

    it('font tokens all start with font-', () => {
      for (const val of Object.values(tokens.font)) {
        expect(val).toMatch(/^font-/)
      }
    })
  })
})
