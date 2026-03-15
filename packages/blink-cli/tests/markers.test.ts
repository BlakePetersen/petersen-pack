// ABOUTME: Tests for the section marker engine (parsing, injection, stripping, validation).
// ABOUTME: Covers all comment styles, multi-section files, and edge cases.
import {
  getCommentStyle,
  injectMarkers,
  findManagedSections,
  replaceManagedContent,
  stripMarkers,
  validateMarkers,
} from '@/markers'

describe('getCommentStyle', () => {
  it('returns HTML comment style for .md', () => {
    expect(getCommentStyle('.md')).toEqual({ open: '<!--', close: '-->' })
  })

  it('returns HTML comment style for .html', () => {
    expect(getCommentStyle('.html')).toEqual({ open: '<!--', close: '-->' })
  })

  it('returns HTML comment style for .svg', () => {
    expect(getCommentStyle('.svg')).toEqual({ open: '<!--', close: '-->' })
  })

  it('returns JS comment style for .ts', () => {
    expect(getCommentStyle('.ts')).toEqual({ open: '//', close: '' })
  })

  it('returns JS comment style for .js', () => {
    expect(getCommentStyle('.js')).toEqual({ open: '//', close: '' })
  })

  it('returns JS comment style for .tsx', () => {
    expect(getCommentStyle('.tsx')).toEqual({ open: '//', close: '' })
  })

  it('returns hash comment style for .yaml', () => {
    expect(getCommentStyle('.yaml')).toEqual({ open: '#', close: '' })
  })

  it('returns hash comment style for .yml', () => {
    expect(getCommentStyle('.yml')).toEqual({ open: '#', close: '' })
  })

  it('returns hash comment style for .sh', () => {
    expect(getCommentStyle('.sh')).toEqual({ open: '#', close: '' })
  })

  it('returns hash comment style for .toml', () => {
    expect(getCommentStyle('.toml')).toEqual({ open: '#', close: '' })
  })

  it('returns block comment style for .css', () => {
    expect(getCommentStyle('.css')).toEqual({ open: '/*', close: '*/' })
  })

  it('returns block comment style for .scss', () => {
    expect(getCommentStyle('.scss')).toEqual({ open: '/*', close: '*/' })
  })

  it('falls back to // style for unknown extensions', () => {
    expect(getCommentStyle('.unknown')).toEqual({ open: '//', close: '' })
  })

  it('falls back to // style for .jsonc', () => {
    expect(getCommentStyle('.jsonc')).toEqual({ open: '//', close: '' })
  })
})

describe('injectMarkers', () => {
  it('wraps content with markdown markers', () => {
    const result = injectMarkers('some config', 'eslint', 'config.md')
    expect(result).toBe('<!-- blink:start eslint -->\nsome config\n<!-- blink:end eslint -->')
  })

  it('wraps content with JS markers for .ts files', () => {
    const result = injectMarkers('const x = 1', 'prettier', 'file.ts')
    expect(result).toBe('// blink:start prettier\nconst x = 1\n// blink:end prettier')
  })

  it('wraps content with hash markers for .yaml files', () => {
    const result = injectMarkers('key: value', 'my-config', 'config.yaml')
    expect(result).toBe('# blink:start my-config\nkey: value\n# blink:end my-config')
  })

  it('wraps content with block comment markers for .css files', () => {
    const result = injectMarkers('.cls {}', 'styles', 'file.css')
    expect(result).toBe('/* blink:start styles */\n.cls {}\n/* blink:end styles */')
  })
})

describe('findManagedSections', () => {
  it('returns empty array when no markers present', () => {
    const result = findManagedSections('just some text\nno markers here', 'eslint')
    expect(result).toEqual([])
  })

  it('finds a single managed section in markdown', () => {
    const content = [
      '# My File',
      '<!-- blink:start eslint -->',
      'managed content',
      '<!-- blink:end eslint -->',
      'other stuff',
    ].join('\n')

    const result = findManagedSections(content, 'eslint')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('eslint')
    expect(result[0].startLine).toBe(1)
    expect(result[0].endLine).toBe(3)
    expect(result[0].content).toBe('managed content')
  })

  it('finds managed section with JS comment style', () => {
    const content = [
      '// blink:start prettier',
      'const x = 1',
      '// blink:end prettier',
    ].join('\n')

    const result = findManagedSections(content, 'prettier')
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('const x = 1')
  })

  it('handles multiple sections from different slugs', () => {
    const content = [
      '<!-- blink:start eslint -->',
      'eslint stuff',
      '<!-- blink:end eslint -->',
      '',
      '<!-- blink:start prettier -->',
      'prettier stuff',
      '<!-- blink:end prettier -->',
    ].join('\n')

    const eslintSections = findManagedSections(content, 'eslint')
    const prettierSections = findManagedSections(content, 'prettier')
    expect(eslintSections).toHaveLength(1)
    expect(eslintSections[0].content).toBe('eslint stuff')
    expect(prettierSections).toHaveLength(1)
    expect(prettierSections[0].content).toBe('prettier stuff')
  })

  it('normalizes trailing newlines in extracted content', () => {
    const content = [
      '// blink:start test',
      'line 1',
      'line 2',
      '',
      '// blink:end test',
    ].join('\n')

    const result = findManagedSections(content, 'test')
    expect(result[0].content).toBe('line 1\nline 2')
  })

  it('handles multiline managed content', () => {
    const content = [
      '# blink:start config',
      'line 1',
      'line 2',
      'line 3',
      '# blink:end config',
    ].join('\n')

    const result = findManagedSections(content, 'config')
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('line 1\nline 2\nline 3')
  })
})

describe('replaceManagedContent', () => {
  it('replaces content between markers preserving surrounding text', () => {
    const content = [
      'before',
      '// blink:start eslint',
      'old content',
      '// blink:end eslint',
      'after',
    ].join('\n')

    const result = replaceManagedContent(content, 'eslint', 'new content')
    expect(result).toBe([
      'before',
      '// blink:start eslint',
      'new content',
      '// blink:end eslint',
      'after',
    ].join('\n'))
  })

  it('throws when slug markers not found', () => {
    expect(() => {
      replaceManagedContent('no markers here', 'eslint', 'content')
    }).toThrow()
  })

  it('replaces only the targeted slug content', () => {
    const content = [
      '<!-- blink:start eslint -->',
      'eslint old',
      '<!-- blink:end eslint -->',
      '<!-- blink:start prettier -->',
      'prettier old',
      '<!-- blink:end prettier -->',
    ].join('\n')

    const result = replaceManagedContent(content, 'eslint', 'eslint new')
    expect(result).toContain('eslint new')
    expect(result).toContain('prettier old')
  })
})

describe('stripMarkers', () => {
  it('removes marker lines and keeps content', () => {
    const content = [
      'before',
      '// blink:start eslint',
      'managed content',
      '// blink:end eslint',
      'after',
    ].join('\n')

    const result = stripMarkers(content, 'eslint')
    expect(result).toBe([
      'before',
      'managed content',
      'after',
    ].join('\n'))
  })

  it('returns unchanged content when no markers present', () => {
    const content = 'no markers here'
    expect(stripMarkers(content, 'eslint')).toBe(content)
  })

  it('only strips markers for the given slug', () => {
    const content = [
      '<!-- blink:start eslint -->',
      'eslint content',
      '<!-- blink:end eslint -->',
      '<!-- blink:start prettier -->',
      'prettier content',
      '<!-- blink:end prettier -->',
    ].join('\n')

    const result = stripMarkers(content, 'eslint')
    expect(result).not.toContain('blink:start eslint')
    expect(result).not.toContain('blink:end eslint')
    expect(result).toContain('blink:start prettier')
    expect(result).toContain('blink:end prettier')
  })
})

describe('validateMarkers', () => {
  it('returns valid for well-formed markers', () => {
    const content = [
      '// blink:start eslint',
      'content',
      '// blink:end eslint',
    ].join('\n')

    const result = validateMarkers(content)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns valid for files with no markers', () => {
    const result = validateMarkers('no markers here')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('detects unmatched start without end', () => {
    const content = '// blink:start eslint\ncontent'

    const result = validateMarkers(content)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('eslint')
  })

  it('detects end without start', () => {
    const content = 'content\n// blink:end eslint'

    const result = validateMarkers(content)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('detects nested same-slug markers', () => {
    const content = [
      '// blink:start eslint',
      '// blink:start eslint',
      'content',
      '// blink:end eslint',
      '// blink:end eslint',
    ].join('\n')

    const result = validateMarkers(content)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('allows different slugs to coexist', () => {
    const content = [
      '// blink:start eslint',
      'eslint content',
      '// blink:end eslint',
      '// blink:start prettier',
      'prettier content',
      '// blink:end prettier',
    ].join('\n')

    const result = validateMarkers(content)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
