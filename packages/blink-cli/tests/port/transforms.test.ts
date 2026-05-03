// ABOUTME: Tests for Obsidian-to-MDX transform functions.
// ABOUTME: Covers callout mapping (D-08), wikilink resolution (D-09), frontmatter normalization (D-10), dataview strip.

import {
  transformCallouts,
  transformWikilinks,
  transformFrontmatter,
  transformDataviewBlocks,
} from '@/port/transforms'

describe('transformCallouts', () => {
  it('converts [!note] with title to AuthorNote', () => {
    const input = '> [!note] This is a note\n> Content of the note'
    const result = transformCallouts(input)
    expect(result).toBe('<AuthorNote>\nContent of the note\n</AuthorNote>')
  })

  it('converts [!tip] without title to AuthorNote', () => {
    const input = '> [!tip]\n> Content'
    const result = transformCallouts(input)
    expect(result).toBe('<AuthorNote>\nContent\n</AuthorNote>')
  })

  it('converts [!warning] with title to DecisionRationale', () => {
    const input = '> [!warning] Be careful\n> Warning content'
    const result = transformCallouts(input)
    expect(result).toBe('<DecisionRationale>\nWarning content\n</DecisionRationale>')
  })

  it('converts [!important] to DecisionRationale', () => {
    const input = '> [!important]\n> Important content'
    const result = transformCallouts(input)
    expect(result).toBe('<DecisionRationale>\nImportant content\n</DecisionRationale>')
  })

  it('converts [!info] to plain blockquote', () => {
    const input = '> [!info]\n> Info content'
    const result = transformCallouts(input)
    expect(result).toBe('> Info content')
  })

  it('converts unknown callout type to AuthorNote as fallback', () => {
    const input = '> [!unknown]\n> Content'
    const result = transformCallouts(input)
    expect(result).toBe('<AuthorNote>\nContent\n</AuthorNote>')
  })

  it('preserves multi-line callout content correctly', () => {
    const input = '> [!note] Title\n> Line one\n> Line two\n> Line three'
    const result = transformCallouts(input)
    expect(result).toBe('<AuthorNote>\nLine one\nLine two\nLine three\n</AuthorNote>')
  })

  it('transforms multiple callouts in same document', () => {
    const input = [
      '> [!note] First',
      '> Note content',
      '',
      'Some text between',
      '',
      '> [!warning] Second',
      '> Warning content',
    ].join('\n')
    const result = transformCallouts(input)
    expect(result).toContain('<AuthorNote>\nNote content\n</AuthorNote>')
    expect(result).toContain('<DecisionRationale>\nWarning content\n</DecisionRationale>')
    expect(result).toContain('Some text between')
  })
})

describe('transformWikilinks', () => {
  const slugMap = new Map<string, { title: string; href: string }>([
    ['writing-custom-skills', { title: 'Writing Custom Claude Code Skills', href: '/skills/claude-code/writing-custom-skills' }],
    ['eslint-flat-config', { title: 'ESLint Flat Config', href: '/configs/eslint-flat-config' }],
  ])

  it('resolves wikilink with matching slug to markdown link', () => {
    const input = 'See [[writing-custom-skills]] for details.'
    const result = transformWikilinks(input, slugMap)
    expect(result).toBe('See [Writing Custom Claude Code Skills](/skills/claude-code/writing-custom-skills) for details.')
  })

  it('renders unresolved wikilink as plain text with TODO comment', () => {
    const input = 'See [[unknown-note]] for details.'
    const result = transformWikilinks(input, slugMap)
    expect(result).toBe('See unknown-note{/* TODO: resolve wikilink */} for details.')
  })

  it('preserves custom display text in resolved wikilink', () => {
    const input = 'See [[writing-custom-skills|custom text]] for details.'
    const result = transformWikilinks(input, slugMap)
    expect(result).toBe('See [custom text](/skills/claude-code/writing-custom-skills) for details.')
  })

  it('transforms multiple wikilinks in same line', () => {
    const input = 'Check [[writing-custom-skills]] and [[eslint-flat-config]] pages.'
    const result = transformWikilinks(input, slugMap)
    expect(result).toBe('Check [Writing Custom Claude Code Skills](/skills/claude-code/writing-custom-skills) and [ESLint Flat Config](/configs/eslint-flat-config) pages.')
  })
})

describe('transformFrontmatter', () => {
  it('maps known key title to dxFields', () => {
    const data = { title: 'My Title' }
    const result = transformFrontmatter(data)
    expect(result.mapped.title).toBe('My Title')
  })

  it('maps known key tags to dxFields as array', () => {
    const data = { tags: ['typescript', 'eslint'] }
    const result = transformFrontmatter(data)
    expect(result.mapped.tags).toEqual(['typescript', 'eslint'])
  })

  it('maps known key description to dxFields', () => {
    const data = { description: 'A description' }
    const result = transformFrontmatter(data)
    expect(result.mapped.description).toBe('A description')
  })

  it('preserves unknown keys in comment string', () => {
    const data = { title: 'Title', custom_field: 'value' }
    const result = transformFrontmatter(data)
    expect(result.unknownComment).toContain('{/* Obsidian meta (review + delete): custom_field: value */}')
  })

  it('preserves multiple unknown keys in comment block', () => {
    const data = { title: 'Title', foo: 'bar', baz: 42 }
    const result = transformFrontmatter(data)
    expect(result.unknownComment).toContain('foo: bar')
    expect(result.unknownComment).toContain('baz: 42')
  })
})

describe('transformDataviewBlocks', () => {
  it('strips dataview code blocks entirely', () => {
    const input = [
      'Some text',
      '',
      '```dataview',
      'TABLE file.mtime AS "Modified"',
      'FROM #skills',
      '```',
      '',
      'More text',
    ].join('\n')
    const result = transformDataviewBlocks(input)
    expect(result).not.toContain('dataview')
    expect(result).not.toContain('TABLE')
    expect(result).toContain('Some text')
    expect(result).toContain('More text')
  })

  it('preserves non-dataview code blocks', () => {
    const input = [
      '```typescript',
      'const x = 1',
      '```',
    ].join('\n')
    const result = transformDataviewBlocks(input)
    expect(result).toContain('```typescript')
    expect(result).toContain('const x = 1')
    expect(result).toContain('```')
  })
})
