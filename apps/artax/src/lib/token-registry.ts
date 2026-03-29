// ABOUTME: Build-time token registry that parses CSS custom properties from artax-ui globals.css.
// ABOUTME: Provides categorized token data with light/dark values and three naming formats.

import { readFileSync } from 'fs'
import { join } from 'path'

export interface TokenValue {
  cssVar: string
  cssProperty: string
  tailwind: string
  tsConstant: string
  lightValue: string
  darkValue: string
  category: string
}

export interface TokenCategory {
  name: string
  tokens: TokenValue[]
}

export interface TypographyToken {
  name: string
  cssVar: string
  value: string
}

export interface SpacingTokens {
  radius: string
  note: string
}

function resolveGlobalsCssPath(): string {
  const candidates = [
    join(process.cwd(), 'packages/artax-ui/src/styles/globals.css'),
    join(process.cwd(), '../../packages/artax-ui/src/styles/globals.css'),
    join(__dirname, '../../../../packages/artax-ui/src/styles/globals.css'),
  ]
  for (const candidate of candidates) {
    try {
      readFileSync(candidate, 'utf-8')
      return candidate
    } catch {
      continue
    }
  }
  throw new Error('Could not locate artax-ui/src/styles/globals.css')
}

function resolveThemeCssPath(): string {
  const candidates = [
    join(process.cwd(), 'packages/artax-ui/src/styles/theme.css'),
    join(process.cwd(), '../../packages/artax-ui/src/styles/theme.css'),
    join(__dirname, '../../../../packages/artax-ui/src/styles/theme.css'),
  ]
  for (const candidate of candidates) {
    try {
      readFileSync(candidate, 'utf-8')
      return candidate
    } catch {
      continue
    }
  }
  throw new Error('Could not locate artax-ui/src/styles/theme.css')
}

function parseBlock(css: string, blockStart: string): Record<string, string> {
  // Find the block where blockStart is the selector (followed by `{` with only whitespace between).
  // This avoids matching occurrences inside other constructs (e.g., @custom-variant).
  const selectorPattern = new RegExp(
    blockStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{',
  )
  const selectorMatch = selectorPattern.exec(css)
  if (!selectorMatch) return {}
  const openBrace = selectorMatch.index + selectorMatch[0].length - 1
  if (openBrace === -1) return {}

  let depth = 0
  let end = openBrace
  for (let i = openBrace; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}') depth--
    if (depth === 0) {
      end = i
      break
    }
  }

  const blockContent = css.slice(openBrace + 1, end)
  const result: Record<string, string> = {}
  const varPattern = /--([\w-]+)\s*:\s*([^;]+);/g
  let match: RegExpExecArray | null
  while ((match = varPattern.exec(blockContent)) !== null) {
    result[`--${match[1]}`] = match[2].trim()
  }
  return result
}

interface TokenMapping {
  category: string
  tailwindPrefix: string
  tsPath: string
  tsKey: string
}

function getTokenMapping(cssVar: string): TokenMapping | null {
  const bgVars: Record<string, { tsKey: string }> = {
    '--background': { tsKey: 'background' },
    '--card': { tsKey: 'card' },
    '--popover': { tsKey: 'popover' },
    '--primary': { tsKey: 'primary' },
    '--secondary': { tsKey: 'secondary' },
    '--muted': { tsKey: 'muted' },
    '--accent': { tsKey: 'accent' },
    '--destructive': { tsKey: 'destructive' },
  }

  if (bgVars[cssVar]) {
    const name = cssVar.replace('--', '')
    return {
      category: 'Background',
      tailwindPrefix: `bg-${name}`,
      tsPath: 'tokens.bg',
      tsKey: bgVars[cssVar].tsKey,
    }
  }

  const textVars: Record<string, { tailwindName: string; tsKey: string }> = {
    '--foreground': { tailwindName: 'foreground', tsKey: 'foreground' },
    '--primary-foreground': {
      tailwindName: 'primary-foreground',
      tsKey: 'primaryForeground',
    },
    '--secondary-foreground': {
      tailwindName: 'secondary-foreground',
      tsKey: 'secondaryForeground',
    },
    '--card-foreground': {
      tailwindName: 'card-foreground',
      tsKey: 'cardForeground',
    },
    '--popover-foreground': {
      tailwindName: 'popover-foreground',
      tsKey: 'popoverForeground',
    },
    '--muted-foreground': {
      tailwindName: 'muted-foreground',
      tsKey: 'mutedForeground',
    },
    '--accent-foreground': {
      tailwindName: 'accent-foreground',
      tsKey: 'accentForeground',
    },
    '--destructive-foreground': {
      tailwindName: 'destructive-foreground',
      tsKey: 'destructiveForeground',
    },
  }

  if (textVars[cssVar]) {
    return {
      category: 'Text',
      tailwindPrefix: `text-${textVars[cssVar].tailwindName}`,
      tsPath: 'tokens.text',
      tsKey: textVars[cssVar].tsKey,
    }
  }

  const borderVars: Record<string, { tsKey: string }> = {
    '--border': { tsKey: 'border' },
    '--input': { tsKey: 'input' },
  }

  if (borderVars[cssVar]) {
    const name = cssVar.replace('--', '')
    return {
      category: 'Border',
      tailwindPrefix: `border-${name}`,
      tsPath: 'tokens.border',
      tsKey: borderVars[cssVar].tsKey,
    }
  }

  if (cssVar === '--ring') {
    return {
      category: 'Ring',
      tailwindPrefix: 'ring-ring',
      tsPath: 'tokens.ring',
      tsKey: 'ring',
    }
  }

  const statusVars: Record<string, { tsKey: string }> = {
    '--success': { tsKey: 'success' },
    '--info': { tsKey: 'info' },
    '--warning': { tsKey: 'warning' },
  }

  if (statusVars[cssVar]) {
    const name = cssVar.replace('--', '')
    return {
      category: 'Status',
      tailwindPrefix: `text-${name}`,
      tsPath: 'tokens.text',
      tsKey: statusVars[cssVar].tsKey,
    }
  }

  const surfaceVars: Record<string, { tsKey: string }> = {
    '--surface-info': { tsKey: 'surfaceInfo' },
    '--surface-warning': { tsKey: 'surfaceWarning' },
    '--surface-success': { tsKey: 'surfaceSuccess' },
  }

  if (surfaceVars[cssVar]) {
    const name = cssVar.replace('--', '')
    return {
      category: 'Surface',
      tailwindPrefix: `bg-${name}`,
      tsPath: 'tokens.bg',
      tsKey: surfaceVars[cssVar].tsKey,
    }
  }

  return null
}

export function getTokensByCategory(): TokenCategory[] {
  const cssPath = resolveGlobalsCssPath()
  const css = readFileSync(cssPath, 'utf-8')

  const lightValues = parseBlock(css, ':root')
  const darkValues = parseBlock(css, '[data-theme=dark]')

  const categoryMap = new Map<string, TokenValue[]>()

  for (const [cssVar, lightValue] of Object.entries(lightValues)) {
    if (cssVar === '--radius') continue

    const mapping = getTokenMapping(cssVar)
    if (!mapping) continue

    const colorName = cssVar.replace('--', '')
    const token: TokenValue = {
      cssVar,
      cssProperty: `var(--color-${colorName})`,
      tailwind: mapping.tailwindPrefix,
      tsConstant: `${mapping.tsPath}.${mapping.tsKey}`,
      lightValue,
      darkValue: darkValues[cssVar] ?? lightValue,
      category: mapping.category,
    }

    const existing = categoryMap.get(mapping.category) ?? []
    existing.push(token)
    categoryMap.set(mapping.category, existing)
  }

  const categoryOrder = [
    'Background',
    'Text',
    'Border',
    'Ring',
    'Status',
    'Surface',
  ]
  return categoryOrder
    .filter((name) => categoryMap.has(name))
    .map((name) => ({ name, tokens: categoryMap.get(name)! }))
}

export function getTypographyTokens(): TypographyToken[] {
  const themePath = resolveThemeCssPath()
  const css = readFileSync(themePath, 'utf-8')

  const fontPattern = /--font-([\w-]+)\s*:\s*([^;]+);/g
  const tokens: TypographyToken[] = []
  let match: RegExpExecArray | null
  while ((match = fontPattern.exec(css)) !== null) {
    tokens.push({
      name: match[1],
      cssVar: `--font-${match[1]}`,
      value: match[2].trim(),
    })
  }

  return tokens
}

export function getSpacingTokens(): SpacingTokens {
  const cssPath = resolveGlobalsCssPath()
  const css = readFileSync(cssPath, 'utf-8')

  const lightValues = parseBlock(css, ':root')
  const radius = lightValues['--radius'] ?? '0px'

  return {
    radius,
    note: 'Artax UI uses sharp corners exclusively to maintain the terminal aesthetic. All components render with 0px border-radius.',
  }
}
