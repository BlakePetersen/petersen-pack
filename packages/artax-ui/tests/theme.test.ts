// ABOUTME: Tests that theme.css and globals.css implement the dual-mode token system.
// ABOUTME: Validates static tokens in @theme, semantic color aliases, light/dark tokens, and custom-variant dark.
import { readFileSync } from 'fs'
import { resolve } from 'path'

const themeCss = readFileSync(
  resolve(__dirname, '../src/styles/theme.css'),
  'utf-8'
)

const globalsCss = readFileSync(
  resolve(__dirname, '../src/styles/globals.css'),
  'utf-8'
)

describe('theme.css', () => {
  it('uses @theme directive', () => {
    expect(themeCss).toContain('@theme')
  })

  describe('typography (static tokens)', () => {
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

  describe('border radius (static tokens)', () => {
    it('sets all radius values to 0px', () => {
      const radiusMatches = themeCss.match(/--radius-\w+:\s*0px/g)
      expect(radiusMatches).not.toBeNull()
      expect(radiusMatches!.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('no legacy color tokens', () => {
    it('has no --color-terminal-* tokens', () => {
      expect(themeCss).not.toMatch(/--color-terminal-/)
    })

    it('has no --color-amber-accent token', () => {
      expect(themeCss).not.toContain('--color-amber-accent')
    })
  })

  describe('semantic color aliases (@theme inline)', () => {
    it('registers --color-success as alias for --success', () => {
      expect(themeCss).toContain('--color-success: var(--success)')
    })

    it('registers --color-info as alias for --info', () => {
      expect(themeCss).toContain('--color-info: var(--info)')
    })

    it('registers --color-warning as alias for --warning', () => {
      expect(themeCss).toContain('--color-warning: var(--warning)')
    })

    it('registers --color-surface-info as alias for --surface-info', () => {
      expect(themeCss).toContain('--color-surface-info: var(--surface-info)')
    })

    it('registers --color-surface-warning as alias for --surface-warning', () => {
      expect(themeCss).toContain('--color-surface-warning: var(--surface-warning)')
    })

    it('registers --color-surface-success as alias for --surface-success', () => {
      expect(themeCss).toContain('--color-surface-success: var(--surface-success)')
    })
  })

  it('does NOT import tailwindcss', () => {
    expect(themeCss).not.toContain('@import')
    expect(themeCss).not.toContain('tailwindcss')
  })
})

describe('globals.css', () => {
  it('imports tailwindcss', () => {
    expect(globalsCss).toContain("@import 'tailwindcss'")
  })

  it('imports theme.css', () => {
    expect(globalsCss).toContain("@import './theme.css'")
  })

  it('has @custom-variant dark directive for data-theme attribute', () => {
    expect(globalsCss).toContain('@custom-variant dark')
    expect(globalsCss).toContain('data-theme=dark')
  })

  describe(':root block (light mode)', () => {
    // Extract the :root block content
    const rootMatch = globalsCss.match(/:root\s*\{([^}]+)\}/)
    const rootBlock = rootMatch ? rootMatch[1] : ''

    it('has :root block', () => {
      expect(rootMatch).not.toBeNull()
    })

    const lightTokens: [string, string][] = [
      ['--background', '#F5F5F5'],
      ['--foreground', '#171717'],
      ['--primary', '#D97706'],
      ['--primary-foreground', '#F5F5F5'],
      ['--secondary', '#E5E5E5'],
      ['--secondary-foreground', '#171717'],
      ['--card', '#EBEBEB'],
      ['--card-foreground', '#171717'],
      ['--popover', '#EBEBEB'],
      ['--popover-foreground', '#171717'],
      ['--muted', '#E5E5E5'],
      ['--muted-foreground', '#737373'],
      ['--accent', '#E5E5E5'],
      ['--accent-foreground', '#171717'],
      ['--border', '#D4D4D4'],
      ['--input', '#D4D4D4'],
      ['--ring', '#D97706'],
      ['--destructive', '#DC2626'],
      ['--destructive-foreground', '#F5F5F5'],
    ]

    it.each(lightTokens)(
      'contains %s with light-mode value %s',
      (token, value) => {
        expect(rootBlock).toMatch(new RegExp(`${token}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
      }
    )

    it('contains --success light-mode token', () => {
      expect(rootBlock).toMatch(/--success\s*:\s*#059669/)
    })

    it('contains --info light-mode token', () => {
      expect(rootBlock).toMatch(/--info\s*:\s*#0891B2/)
    })

    it('contains --warning light-mode token', () => {
      expect(rootBlock).toMatch(/--warning\s*:\s*#D97706/)
    })

    it('contains --surface-info light-mode token', () => {
      expect(rootBlock).toMatch(/--surface-info\s*:\s*rgba\(8,\s*145,\s*178,\s*0\.08\)/)
    })

    it('contains --surface-warning light-mode token', () => {
      expect(rootBlock).toMatch(/--surface-warning\s*:\s*rgba\(217,\s*119,\s*6,\s*0\.08\)/)
    })

    it('contains --surface-success light-mode token', () => {
      expect(rootBlock).toMatch(/--surface-success\s*:\s*rgba\(5,\s*150,\s*105,\s*0\.08\)/)
    })
  })

  describe('[data-theme=dark] block (dark mode)', () => {
    // Extract the [data-theme=dark] block content
    const darkMatch = globalsCss.match(/\[data-theme=dark\]\s*\{([^}]+)\}/)
    const darkBlock = darkMatch ? darkMatch[1] : ''

    it('has [data-theme=dark] block', () => {
      expect(darkMatch).not.toBeNull()
    })

    const darkTokens: [string, string][] = [
      ['--background', '#0A0A0A'],
      ['--foreground', '#FAFAFA'],
      ['--primary', '#F59E0B'],
      ['--primary-foreground', '#0A0A0A'],
      ['--secondary', '#1F1F1F'],
      ['--secondary-foreground', '#FAFAFA'],
      ['--card', '#0F0F0F'],
      ['--card-foreground', '#FAFAFA'],
      ['--popover', '#0F0F0F'],
      ['--popover-foreground', '#FAFAFA'],
      ['--muted', '#1F1F1F'],
      ['--muted-foreground', '#6B7280'],
      ['--accent', '#1F1F1F'],
      ['--accent-foreground', '#FAFAFA'],
      ['--border', '#2a2a2a'],
      ['--input', '#2a2a2a'],
      ['--ring', '#F59E0B'],
      ['--destructive', '#EF4444'],
      ['--destructive-foreground', '#FAFAFA'],
    ]

    it.each(darkTokens)(
      'contains %s with dark-mode value %s',
      (token, value) => {
        expect(darkBlock).toMatch(new RegExp(`${token}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
      }
    )

    it('contains --success dark-mode token', () => {
      expect(darkBlock).toMatch(/--success\s*:\s*#10B981/)
    })

    it('contains --info dark-mode token', () => {
      expect(darkBlock).toMatch(/--info\s*:\s*#06B6D4/)
    })

    it('contains --warning dark-mode token', () => {
      expect(darkBlock).toMatch(/--warning\s*:\s*#F59E0B/)
    })

    it('contains --surface-info dark-mode token', () => {
      expect(darkBlock).toMatch(/--surface-info\s*:\s*rgba\(6,\s*182,\s*212,\s*0\.06\)/)
    })

    it('contains --surface-warning dark-mode token', () => {
      expect(darkBlock).toMatch(/--surface-warning\s*:\s*rgba\(245,\s*158,\s*11,\s*0\.06\)/)
    })

    it('contains --surface-success dark-mode token', () => {
      expect(darkBlock).toMatch(/--surface-success\s*:\s*rgba\(16,\s*185,\s*129,\s*0\.06\)/)
    })
  })
})
