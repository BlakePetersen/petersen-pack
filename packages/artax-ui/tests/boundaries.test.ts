// ABOUTME: Boundary tests for server/client component safety.
// ABOUTME: Verifies base components have no 'use client' and interactive wrappers do.
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const componentsDir = resolve(__dirname, '../src/components')

const baseComponentFiles = [
  'button.tsx',
  'input.tsx',
  'card.tsx',
  'badge.tsx',
  'separator.tsx',
  'table.tsx',
  'callout.tsx',
  'code-block.tsx',
  'accordion.tsx',
  'dialog.tsx',
  'dropdown-menu.tsx',
  'tabs.tsx',
  'toggle.tsx',
  'tooltip.tsx'
]

const interactiveFiles = [
  'accordion-interactive.tsx',
  'dialog-interactive.tsx',
  'dropdown-interactive.tsx',
  'tabs-interactive.tsx',
  'toggle-interactive.tsx',
  'tooltip-interactive.tsx'
]

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
    const allFiles = readdirSync(componentsDir).filter(f => f.endsWith('.tsx'))
    const coveredFiles = [...baseComponentFiles, ...interactiveFiles]
    const uncovered = allFiles.filter(f => !coveredFiles.includes(f))
    expect(uncovered).toEqual([])
  })
})
