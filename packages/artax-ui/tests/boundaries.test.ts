// ABOUTME: Boundary tests for server/client component safety.
// ABOUTME: Verifies that base components do not contain 'use client' directives.
import { readFileSync } from 'fs'
import { resolve } from 'path'

const componentFiles = [
  'button.tsx',
  'input.tsx',
  'card.tsx',
  'badge.tsx',
  'separator.tsx'
]

describe('server/client boundaries', () => {
  it.each(componentFiles)(
    '%s does not contain "use client" directive',
    filename => {
      const content = readFileSync(
        resolve(__dirname, '../src/components', filename),
        'utf-8'
      )
      expect(content).not.toContain("'use client'")
      expect(content).not.toContain('"use client"')
    }
  )

  it('index.ts does not contain "use client" directive', () => {
    const content = readFileSync(
      resolve(__dirname, '../src/index.ts'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })
})
