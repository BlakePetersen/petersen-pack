// ABOUTME: Tests for the custom Shiki TextMate theme using terminal palette colors.
// ABOUTME: Validates CONT-04a: theme structure, token scopes, and color mappings.

import { terminalTheme } from '../src/lib/shiki-theme'

describe('Shiki Terminal Theme (CONT-04a)', () => {
  test('theme has name "terminal" and type "dark"', () => {
    expect(terminalTheme.name).toBe('terminal')
    expect(terminalTheme.type).toBe('dark')
  })

  test('theme colors include editor.background and editor.foreground', () => {
    expect(terminalTheme.colors).toBeDefined()
    expect(terminalTheme.colors!['editor.background']).toBeDefined()
    expect(terminalTheme.colors!['editor.foreground']).toBeDefined()
  })

  test('tokenColors includes required scopes', () => {
    const scopes = terminalTheme.tokenColors!.flatMap(tc =>
      Array.isArray(tc.scope) ? tc.scope : [tc.scope]
    )
    const requiredScopes = [
      'comment',
      'string',
      'keyword',
      'entity.name.type',
      'entity.name.function',
      'variable',
      'keyword.operator'
    ]
    for (const scope of requiredScopes) {
      expect(scopes).toContain(scope)
    }
  })

  test('scopes map to correct terminal palette colors', () => {
    const colorMap: Record<string, string> = {
      comment: '#6B7280',
      string: '#F59E0B',
      keyword: '#F59E0B',
      'entity.name.type': '#06B6D4',
      'entity.name.function': '#10B981',
      variable: '#FAFAFA',
      'keyword.operator': '#9CA3AF'
    }

    for (const [scope, expectedColor] of Object.entries(colorMap)) {
      const tokenColor = terminalTheme.tokenColors!.find(tc => {
        const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope]
        return scopes.includes(scope)
      })
      expect(tokenColor).toBeDefined()
      expect(tokenColor!.settings.foreground).toBe(expectedColor)
    }
  })
})
