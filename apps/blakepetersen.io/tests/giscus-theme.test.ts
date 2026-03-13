// ABOUTME: Tests for the custom giscus dark theme CSS file.
// ABOUTME: Validates COMM-03: required custom properties and zero border-radius for terminal aesthetic.

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const themePath = join(__dirname, '..', 'public', 'giscus-theme.css')

describe('Giscus Terminal Theme (COMM-03)', () => {
  test('giscus-theme.css exists in public/', () => {
    expect(existsSync(themePath)).toBe(true)
  })

  test('CSS contains --color-canvas-default custom property', () => {
    const css = readFileSync(themePath, 'utf-8')
    expect(css).toContain('--color-canvas-default')
  })

  test('CSS contains --color-accent-fg custom property', () => {
    const css = readFileSync(themePath, 'utf-8')
    expect(css).toContain('--color-accent-fg')
  })

  test('CSS contains --color-fg-default custom property', () => {
    const css = readFileSync(themePath, 'utf-8')
    expect(css).toContain('--color-fg-default')
  })

  test('CSS contains --color-border-default custom property', () => {
    const css = readFileSync(themePath, 'utf-8')
    expect(css).toContain('--color-border-default')
  })

  test('CSS contains border-radius: 0 rules for terminal aesthetic', () => {
    const css = readFileSync(themePath, 'utf-8')
    expect(css).toContain('border-radius: 0')
  })
})
