// ABOUTME: Boundary tests for server/client component safety.
// ABOUTME: Verifies base components have no 'use client' and interactive wrappers do.
import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, relative } from 'path'

const componentsDir = resolve(__dirname, '../src/components')

const baseComponentFiles = [
  'atoms/badge/badge.tsx',
  'atoms/button/button.tsx',
  'atoms/input/input.tsx',
  'atoms/separator/separator.tsx',
  'atoms/toggle/toggle.tsx',
  'molecules/card/card.tsx',
  'molecules/callout/callout.tsx',
  'molecules/code-block/code-block.tsx',
  'molecules/table/table.tsx',
  'molecules/tabs/tabs.tsx',
  'molecules/tooltip/tooltip.tsx',
  'organisms/accordion/accordion.tsx',
  'organisms/dialog/dialog.tsx',
  'organisms/dropdown/dropdown-menu.tsx'
]

const interactiveFiles = [
  'atoms/copy-button/copy-button.tsx',
  'atoms/toggle/toggle-interactive.tsx',
  'molecules/tabs/tabs-interactive.tsx',
  'molecules/tooltip/tooltip-interactive.tsx',
  'organisms/accordion/accordion-interactive.tsx',
  'organisms/dialog/dialog-interactive.tsx',
  'organisms/dropdown/dropdown-interactive.tsx'
]

function walkTsx(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walkTsx(full))
    } else if (entry.endsWith('.tsx')) {
      results.push(relative(componentsDir, full))
    }
  }
  return results
}

describe('server/client boundaries', () => {
  describe('base components are server-safe', () => {
    it.each(baseComponentFiles)(
      '%s does not contain "use client" directive',
      filename => {
        const content = readFileSync(
          resolve(componentsDir, filename),
          'utf-8'
        )
        expect(content).not.toContain("'use client'")
        expect(content).not.toContain('"use client"')
      }
    )
  })

  describe('interactive wrappers are client components', () => {
    it.each(interactiveFiles)(
      '%s has "use client" as first line',
      filename => {
        const content = readFileSync(
          resolve(componentsDir, filename),
          'utf-8'
        )
        const firstLine = content.split('\n')[0].trim()
        expect(firstLine).toBe("'use client'")
      }
    )
  })

  it('index.ts does not contain "use client" directive', () => {
    const content = readFileSync(
      resolve(__dirname, '../src/index.ts'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })

  it('every component file is covered by boundary tests', () => {
    const allFiles = walkTsx(componentsDir)
    const coveredFiles = [...baseComponentFiles, ...interactiveFiles]
    const uncovered = allFiles.filter(f => !coveredFiles.includes(f))
    expect(uncovered).toEqual([])
  })
})
