// ABOUTME: Build validation tests for the Artax UI reference site.
// ABOUTME: Verifies package.json dependencies and key source files exist.

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const root = join(__dirname, '..')

describe('artax build prerequisites', () => {
  it('has package.json with artax-ui dependency', () => {
    const pkgPath = join(root, 'package.json')
    expect(existsSync(pkgPath)).toBe(true)
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    expect(pkg.dependencies['artax-ui']).toBe('workspace:*')
  })

  it('has package.json with next dependency', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))
    expect(pkg.dependencies['next']).toBeDefined()
  })

  it('has package.json with next-themes dependency', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))
    expect(pkg.dependencies['next-themes']).toBeDefined()
  })

  it('has root layout file', () => {
    expect(existsSync(join(root, 'src/app/layout.tsx'))).toBe(true)
  })

  it('has root page file', () => {
    expect(existsSync(join(root, 'src/app/page.tsx'))).toBe(true)
  })

  it('has globals.css', () => {
    expect(existsSync(join(root, 'src/app/globals.css'))).toBe(true)
  })

  it('has header component', () => {
    expect(existsSync(join(root, 'src/components/header.tsx'))).toBe(true)
  })

  it('sources the theme toggle from the artax-ui barrel', () => {
    const header = readFileSync(
      join(root, 'src/components/header.tsx'),
      'utf-8'
    )
    expect(header).toMatch(/import \{ ThemeToggle \} from 'artax-ui'/)
  })
})
