// ABOUTME: Build-time component count derivation from artax-ui exports.
// ABOUTME: Reads the artax-ui barrel file and counts unique source paths per Atomic Design tier.

import { readFileSync } from 'fs'
import { join } from 'path'

interface ComponentCounts {
  atoms: number
  molecules: number
  organisms: number
  total: number
}

type Tier = 'atoms' | 'molecules' | 'organisms'

function collectSourceFolders(section: string, tier: string): Set<string> {
  const pattern = new RegExp(`from\\s+['"]\\./components/${tier}/([^/]+)/`, 'g')
  const paths = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = pattern.exec(section)) !== null) {
    paths.add(match[1])
  }
  return paths
}

function resolveIndexPath(): string {
  // In Next.js production builds, __dirname points to the bundled output.
  // Try process.cwd()-relative paths first (monorepo root during build),
  // then fall back to __dirname-relative (jest tests run from apps/artax).
  const candidates = [
    join(process.cwd(), 'packages/artax-ui/src/index.ts'),
    join(process.cwd(), '../../packages/artax-ui/src/index.ts'),
    join(__dirname, '../../../../packages/artax-ui/src/index.ts'),
  ]
  for (const candidate of candidates) {
    try {
      readFileSync(candidate, 'utf-8')
      return candidate
    } catch {
      continue
    }
  }
  throw new Error('Could not locate artax-ui/src/index.ts')
}

export function getBarrelComponentSlugs(): Record<Tier, Set<string>> {
  const indexPath = resolveIndexPath()
  const content = readFileSync(indexPath, 'utf-8')

  const atomsStart = content.indexOf('// Atoms')
  const moleculesStart = content.indexOf('// Molecules')
  const organismsStart = content.indexOf('// Organisms')

  const atomsSection = content.slice(atomsStart, moleculesStart)
  const moleculesSection = content.slice(moleculesStart, organismsStart)
  const organismsEnd = content.indexOf('\n// ', organismsStart + 1)
  const organismsSection = organismsEnd !== -1
    ? content.slice(organismsStart, organismsEnd)
    : content.slice(organismsStart)

  return {
    atoms: collectSourceFolders(atomsSection, 'atoms'),
    molecules: collectSourceFolders(moleculesSection, 'molecules'),
    organisms: collectSourceFolders(organismsSection, 'organisms'),
  }
}

export function getComponentCounts(): ComponentCounts {
  const slugs = getBarrelComponentSlugs()
  return {
    atoms: slugs.atoms.size,
    molecules: slugs.molecules.size,
    organisms: slugs.organisms.size,
    total: slugs.atoms.size + slugs.molecules.size + slugs.organisms.size,
  }
}
