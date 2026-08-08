// ABOUTME: Tests verifying token registry parses CSS custom properties correctly.
// ABOUTME: Validates light/dark value pairing, category grouping, and naming format generation.

import {
  getTokensByCategory,
  getTypographyTokens,
  getSpacingTokens
} from '@/lib/token-registry'

describe('getTokensByCategory', () => {
  const categories = getTokensByCategory()
  const categoryNames = categories.map(c => c.name)

  it('returns Background, Text, Border, Ring, Status, and Surface categories', () => {
    expect(categoryNames).toContain('Background')
    expect(categoryNames).toContain('Text')
    expect(categoryNames).toContain('Border')
    expect(categoryNames).toContain('Ring')
    expect(categoryNames).toContain('Status')
    expect(categoryNames).toContain('Surface')
  })

  it('pairs light and dark values for --background token', () => {
    const bg = categories.find(c => c.name === 'Background')!
    const bgToken = bg.tokens.find(t => t.cssVar === '--background')!
    expect(bgToken.lightValue).toBe('#F5F5F5')
    expect(bgToken.darkValue).toBe('#0A0A0A')
  })

  it('pairs light and dark values for --primary token', () => {
    const bg = categories.find(c => c.name === 'Background')!
    const token = bg.tokens.find(t => t.cssVar === '--primary')!
    expect(token.lightValue).toBe('#D97706')
    expect(token.darkValue).toBe('#F59E0B')
  })

  it('includes all semantic color tokens', () => {
    const allTokenVars = categories.flatMap(c => c.tokens.map(t => t.cssVar))
    const expected = [
      '--background',
      '--foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--card',
      '--card-foreground',
      '--popover',
      '--popover-foreground',
      '--muted',
      '--muted-foreground',
      '--accent',
      '--accent-foreground',
      '--border',
      '--input',
      '--ring',
      '--destructive',
      '--destructive-foreground',
      '--success',
      '--info',
      '--warning'
    ]
    for (const varName of expected) {
      expect(allTokenVars).toContain(varName)
    }
  })

  it('provides correct naming formats for --background', () => {
    const bg = categories.find(c => c.name === 'Background')!
    const token = bg.tokens.find(t => t.cssVar === '--background')!
    expect(token.cssProperty).toBe('var(--color-background)')
    expect(token.tailwind).toBe('bg-background')
    expect(token.tsConstant).toBe('tokens.bg.background')
  })

  it('provides correct naming formats for --foreground (text category)', () => {
    const text = categories.find(c => c.name === 'Text')!
    const token = text.tokens.find(t => t.cssVar === '--foreground')!
    expect(token.cssProperty).toBe('var(--color-foreground)')
    expect(token.tailwind).toBe('text-foreground')
    expect(token.tsConstant).toBe('tokens.text.foreground')
  })

  it('provides correct naming formats for --border', () => {
    const border = categories.find(c => c.name === 'Border')!
    const token = border.tokens.find(t => t.cssVar === '--border')!
    expect(token.cssProperty).toBe('var(--color-border)')
    expect(token.tailwind).toBe('border-border')
    expect(token.tsConstant).toBe('tokens.border.border')
  })

  it('provides correct naming formats for --ring', () => {
    const ring = categories.find(c => c.name === 'Ring')!
    const token = ring.tokens.find(t => t.cssVar === '--ring')!
    expect(token.cssProperty).toBe('var(--color-ring)')
    expect(token.tailwind).toBe('ring-ring')
    expect(token.tsConstant).toBe('tokens.ring.ring')
  })

  it('each token has all required fields', () => {
    for (const category of categories) {
      for (const token of category.tokens) {
        expect(token).toHaveProperty('cssVar')
        expect(token).toHaveProperty('cssProperty')
        expect(token).toHaveProperty('tailwind')
        expect(token).toHaveProperty('tsConstant')
        expect(token).toHaveProperty('lightValue')
        expect(token).toHaveProperty('darkValue')
        expect(token).toHaveProperty('category')
      }
    }
  })
})

describe('getTypographyTokens', () => {
  const typography = getTypographyTokens()

  it('includes JetBrains Mono font family', () => {
    const mono = typography.find(t => t.name === 'mono')
    expect(mono).toBeDefined()
    expect(mono!.value).toContain('JetBrains Mono')
  })

  it('includes Inter font family', () => {
    const sans = typography.find(t => t.name === 'sans')
    expect(sans).toBeDefined()
    expect(sans!.value).toContain('Inter')
  })

  it('includes mono-alt font family', () => {
    const monoAlt = typography.find(t => t.name === 'mono-alt')
    expect(monoAlt).toBeDefined()
    expect(monoAlt!.value).toContain('IBM Plex Mono')
  })
})

describe('getSpacingTokens', () => {
  const spacing = getSpacingTokens()

  it('returns radius value of 0px', () => {
    expect(spacing.radius).toBe('0px')
  })

  it('includes note about terminal aesthetic', () => {
    expect(spacing.note).toBeTruthy()
    expect(spacing.note.toLowerCase()).toContain('terminal')
  })
})
