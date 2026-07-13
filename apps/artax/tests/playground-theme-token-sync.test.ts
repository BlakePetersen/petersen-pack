// ABOUTME: Pins the 3 token-backed Prism playground-theme hexes to artax-ui dark-mode tokens.
// ABOUTME: Fails CI if --background/--primary/--muted-foreground drift from the editor theme literals.

import { getTokensByCategory } from '@/lib/token-registry'
import { artaxTerminalTheme } from '@/lib/playground-theme'

// The Prism playground theme mixes token-backed chrome colors with syntax-only
// palette colors. Only the 3 entries below have a design-token equivalent, so
// only they are pinned against artax-ui's dark tokens (uppercase-normalized).
//
// The other 5 Prism colors are DELIBERATELY EXCLUDED — they are syntax palette
// with no design-token counterpart, and a naive "every hex is a token" assertion
// would fail on them:
//   #D4D4D4  plain.color / function / punctuation-adjacent text
//   #86EFAC  string, attr-value
//   #9CA3AF  punctuation
//   #93C5FD  tag, attr-name
//   #FBBF24  class-name, maybe-class-name
// Promoting any of these to a token is a design decision, out of scope here.
const PRISM_TO_TOKEN = {
  '#0A0A0A': '--background', // plain.backgroundColor
  '#F59E0B': '--primary', // keyword/operator, number/boolean
  '#6B7280': '--muted-foreground', // comment
} as const

describe('playground Prism theme ↔ artax-ui dark tokens', () => {
  // Reuse the existing CSS parser — do NOT re-parse globals.css here.
  const byVar = new Map(
    getTokensByCategory().flatMap((c) =>
      c.tokens.map((t) => [t.cssVar, t.darkValue] as const),
    ),
  )

  for (const [prismHex, cssVar] of Object.entries(PRISM_TO_TOKEN)) {
    it(`${cssVar} dark value equals Prism ${prismHex}`, () => {
      const darkValue = byVar.get(cssVar)
      expect(darkValue).toBeDefined()
      expect(darkValue!.toUpperCase()).toBe(prismHex)
    })
  }

  it('Prism plain.backgroundColor uses the --background-backed hex', () => {
    // Cross-check the actual Prism object (not just the token registry) so the
    // test proves the editor theme really consumes the token-backed literal.
    expect(artaxTerminalTheme.plain.backgroundColor?.toUpperCase()).toBe(
      '#0A0A0A',
    )
    expect(byVar.get('--background')!.toUpperCase()).toBe('#0A0A0A')
  })
})
