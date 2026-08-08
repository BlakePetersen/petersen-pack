// ABOUTME: Tests that no component files contain legacy terminal-* or amber-accent token references.
// ABOUTME: Validates the complete migration from old @theme tokens to semantic CSS custom properties.
import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join, relative } from 'path'

const SRC_DIR = resolve(__dirname, '../src')

function collectTsxFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectTsxFiles(fullPath))
    } else if (entry.endsWith('.tsx')) {
      results.push(fullPath)
    }
  }
  return results
}

describe('token-usage: no legacy tokens in components', () => {
  const componentDir = resolve(SRC_DIR, 'components')
  const componentFiles = collectTsxFiles(componentDir)

  it('found component .tsx files to scan', () => {
    expect(componentFiles.length).toBeGreaterThan(0)
  })

  describe('no terminal-* class references in components', () => {
    it.each(componentFiles.map(f => [relative(componentDir, f), f]))(
      '%s has no terminal-* classes',
      (_name, filePath) => {
        const content = readFileSync(filePath as string, 'utf-8')
        // Strip ABOUTME and comment lines to avoid false positives
        const lines = content
          .split('\n')
          .filter(line => !/^\s*(\/\/|\/?\*|\*\/)/.test(line))
        const codeContent = lines.join('\n')
        expect(codeContent).not.toMatch(/terminal-/)
      }
    )
  })

  describe('no amber-accent class references in components', () => {
    it.each(componentFiles.map(f => [relative(componentDir, f), f]))(
      '%s has no amber-accent classes',
      (_name, filePath) => {
        const content = readFileSync(filePath as string, 'utf-8')
        const lines = content
          .split('\n')
          .filter(line => !/^\s*(\/\/|\/?\*|\*\/)/.test(line))
        const codeContent = lines.join('\n')
        expect(codeContent).not.toMatch(/amber-accent/)
      }
    )
  })
})

describe('token-usage: no legacy tokens in mdx/components.tsx', () => {
  const mdxPath = resolve(SRC_DIR, 'mdx/components.tsx')
  const content = readFileSync(mdxPath, 'utf-8')
  // Strip comments
  const lines = content
    .split('\n')
    .filter(line => !/^\s*(\/\/|\/?\*|\*\/)/.test(line))
  const codeContent = lines.join('\n')

  it('has no terminal-* class references', () => {
    expect(codeContent).not.toMatch(/terminal-/)
  })

  it('has no inline rgba() style values', () => {
    expect(codeContent).not.toMatch(/rgba\(/)
  })
})

describe('token-usage: no legacy tokens in theme.css @theme block', () => {
  const themeCss = readFileSync(resolve(SRC_DIR, 'styles/theme.css'), 'utf-8')

  // Extract the @theme block content
  const themeMatch = themeCss.match(/@theme\s*\{([\s\S]*?)\}/)
  const themeBlock = themeMatch ? themeMatch[1] : ''

  it('has a @theme block', () => {
    expect(themeMatch).not.toBeNull()
  })

  it('has no --color-terminal-* tokens', () => {
    expect(themeBlock).not.toMatch(/--color-terminal-/)
  })

  it('has no --color-amber-accent token', () => {
    expect(themeBlock).not.toMatch(/--color-amber-accent/)
  })

  it('has no --color-surface-* tokens (these belong in globals.css)', () => {
    expect(themeBlock).not.toMatch(/--color-surface-/)
  })
})
