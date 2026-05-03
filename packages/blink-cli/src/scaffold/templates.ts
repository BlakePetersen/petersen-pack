// ABOUTME: Collection-specific MDX body templates for the scaffold command.
// ABOUTME: Each collection type gets different section structure per Phase 28 D-01.

const BODY_TEMPLATES: Record<string, string> = {
  skills: '## Overview\n\n\n\n## Usage\n\n\n\n## Configuration\n\n',
  configs: '## Installation\n\n\n\n## Options\n\n\n\n## Customization\n\n',
  hooks: '## When to Use\n\n\n\n## Setup\n\n\n\n## API\n\n',
  guides: '## Prerequisites\n\n\n\n## Steps\n\n\n\n## Troubleshooting\n\n',
}

/**
 * Returns the collection-specific MDX body template with optional voice
 * primitive stubs injected per D-02.
 */
export function getBodyTemplate(collection: string, voice?: string[]): string {
  const base = BODY_TEMPLATES[collection] ?? BODY_TEMPLATES.skills

  const imports: string[] = []
  const stubs: string[] = []

  if (voice?.includes('author-note')) {
    imports.push("import { AuthorNote } from 'artax-ui'")
    stubs.push('<AuthorNote>{/* TODO */}</AuthorNote>')
  }

  if (voice?.includes('decision-rationale')) {
    imports.push("import { DecisionRationale } from 'artax-ui'")
    stubs.push('<DecisionRationale>{/* TODO */}</DecisionRationale>')
  }

  const importBlock = imports.length > 0 ? imports.join('\n') + '\n\n' : ''
  const stubBlock = stubs.length > 0 ? '\n' + stubs.join('\n') + '\n' : ''

  return importBlock + base + stubBlock
}

/**
 * Returns the artifact companion template with frontmatter pre-populated
 * from MDX values per D-03 / SCAFFOLD-04.
 */
export function getArtifactTemplate(
  name: string,
  description: string,
  type: string,
): string {
  return `---
name: ${name}
description: ${description}
type: ${type}
merge: replace
destination: TODO
devDependencies: {}
---

TODO: Add artifact content here.
`
}
