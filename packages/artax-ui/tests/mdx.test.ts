// ABOUTME: Tests for the MDX component map.
// ABOUTME: Verifies all standard MDX elements have terminal-styled React component renderers.
import { mdxComponents } from '../src/mdx/components'

const REQUIRED_KEYS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a',
  'ul', 'ol', 'li',
  'blockquote', 'hr',
  'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img',
  'strong', 'em'
] as const

describe('mdxComponents', () => {
  it('exports all required MDX element keys', () => {
    for (const key of REQUIRED_KEYS) {
      expect(mdxComponents).toHaveProperty(key)
    }
  })

  it('each value is a function (React component)', () => {
    for (const key of REQUIRED_KEYS) {
      expect(typeof mdxComponents[key]).toBe('function')
    }
  })

  it('does not contain unexpected non-function values', () => {
    for (const [key, value] of Object.entries(mdxComponents)) {
      expect(typeof value).toBe('function')
    }
  })
})
