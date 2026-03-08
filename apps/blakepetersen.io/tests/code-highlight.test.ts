// ABOUTME: Integration tests proving Shiki processes code blocks at Velite build time.
// ABOUTME: Validates CONT-04b/c: syntax highlighting spans and line highlighting classes.

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

const appRoot = join(__dirname, '..')
const veliteDir = join(appRoot, '.velite')

beforeAll(() => {
  execSync('pnpm velite', { cwd: appRoot, stdio: 'pipe' })
}, 30000)

function readCollection(name: string) {
  const filePath = join(veliteDir, `${name}.json`)
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

describe('Code Highlighting (CONT-04b)', () => {
  let configs: Array<{ slug: string; code: string }>

  beforeAll(() => {
    configs = readCollection('configs')
  })

  test('Shiki-processed code blocks contain styled span elements with color values', () => {
    const eslintConfig = configs.find((c) =>
      c.slug.includes('eslint-flat-config'),
    )
    expect(eslintConfig).toBeDefined()

    // Compiled MDX contains span elements with inline style color objects
    expect(eslintConfig!.code).toContain('color:"#F59E0B"')
  })

  test('code blocks contain shiki class marker', () => {
    const eslintConfig = configs.find((c) =>
      c.slug.includes('eslint-flat-config'),
    )
    expect(eslintConfig).toBeDefined()

    // Shiki adds "shiki terminal" class to pre element
    expect(eslintConfig!.code).toContain('shiki terminal')
  })

  test('code blocks contain token spans, not raw unhighlighted text', () => {
    const eslintConfig = configs.find((c) =>
      c.slug.includes('eslint-flat-config'),
    )
    expect(eslintConfig).toBeDefined()

    // Compiled MDX wraps tokens in i.span calls with style color objects
    expect(eslintConfig!.code).toMatch(/i\.span,\{style:\{color:/)
  })
})

describe('Line Highlighting (CONT-04c)', () => {
  test('meta string {1} produces highlighted class on a line span', () => {
    const configs = readCollection('configs')
    const eslintConfig = configs.find((c: { slug: string }) =>
      c.slug.includes('eslint-flat-config'),
    )
    expect(eslintConfig).toBeDefined()

    // transformerMetaHighlight adds "highlighted" class to specified lines
    expect(eslintConfig!.code).toContain('line highlighted')
  })
})
