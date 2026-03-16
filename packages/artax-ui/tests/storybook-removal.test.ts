// ABOUTME: Verifies all Storybook artifacts have been removed from artax-ui.
// ABOUTME: Checks for story files, config directory, devDependencies, and scripts.
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const pkgRoot = resolve(__dirname, '..')

describe('storybook removal', () => {
  it('src/stories/ directory does not exist', () => {
    expect(existsSync(resolve(pkgRoot, 'src/stories'))).toBe(false)
  })

  it('.storybook/ directory does not exist', () => {
    expect(existsSync(resolve(pkgRoot, '.storybook'))).toBe(false)
  })

  it('package.json has no storybook devDependencies', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(pkgRoot, 'package.json'), 'utf-8')
    )
    const devDeps = Object.keys(pkg.devDependencies || {})
    const storybookDeps = devDeps.filter(
      d => d.includes('storybook') || d.startsWith('@storybook/')
    )
    expect(storybookDeps).toEqual([])
  })

  it('package.json has no storybook scripts', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(pkgRoot, 'package.json'), 'utf-8')
    )
    const scripts = Object.keys(pkg.scripts || {})
    const storybookScripts = scripts.filter(s => s.includes('storybook'))
    expect(storybookScripts).toEqual([])
  })
})
