// ABOUTME: Tests for scope resolution between project and global contexts.
// ABOUTME: Verifies path resolution for file destinations and manifest roots.
import { join } from 'node:path'
import { homedir } from 'node:os'
import { resolveDestination, resolveManifestRoot } from '@/scope'

describe('resolveDestination', () => {
  it('resolves project scope to cwd-relative path', () => {
    const result = resolveDestination('CLAUDE.md', 'project', '/my/project')
    expect(result).toBe(join('/my/project', 'CLAUDE.md'))
  })

  it('resolves nested project paths', () => {
    const result = resolveDestination(
      '.claude/skills/test.md',
      'project',
      '/my/project'
    )
    expect(result).toBe(join('/my/project', '.claude/skills/test.md'))
  })

  it('resolves global scope to homedir-relative path', () => {
    const result = resolveDestination(
      '.claude/skills/test.md',
      'global',
      '/any/path'
    )
    expect(result).toBe(join(homedir(), '.claude/skills/test.md'))
  })

  it('resolves global scope ignoring cwd', () => {
    const result1 = resolveDestination('CLAUDE.md', 'global', '/project/a')
    const result2 = resolveDestination('CLAUDE.md', 'global', '/project/b')
    expect(result1).toBe(result2)
    expect(result1).toBe(join(homedir(), 'CLAUDE.md'))
  })
})

describe('resolveManifestRoot', () => {
  it('returns cwd for project scope', () => {
    expect(resolveManifestRoot('project', '/my/project')).toBe('/my/project')
  })

  it('returns homedir for global scope', () => {
    expect(resolveManifestRoot('global', '/any/path')).toBe(homedir())
  })
})
