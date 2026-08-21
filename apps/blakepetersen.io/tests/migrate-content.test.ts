// ABOUTME: Unit tests for the migration discovery seam in scripts/migrate-content.ts.
// ABOUTME: Pins the ascending numeric-prefix ordering guarantee and the filename filter.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { discoverMigrationFiles } from '../scripts/migration-discovery'

describe('TEST-08c: discoverMigrationFiles', () => {
  let fixtureDir: string
  let emptyDir: string

  beforeAll(() => {
    fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate-discover-'))
    emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate-empty-'))
    for (const name of [
      '010-c.ts',
      '001-a.ts',
      '002-b.ts',
      'README.md',
      'bad_name.ts',
      '01-short.ts'
    ]) {
      fs.writeFileSync(path.join(fixtureDir, name), '')
    }
    fs.writeFileSync(path.join(emptyDir, 'notes.txt'), '')
  })

  afterAll(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true })
    fs.rmSync(emptyDir, { recursive: true, force: true })
  })

  it('returns migration files in ascending numeric-prefix order', () => {
    expect(discoverMigrationFiles(fixtureDir)).toEqual([
      '001-a.ts',
      '002-b.ts',
      '010-c.ts'
    ])
  })

  it('excludes non-conforming filenames', () => {
    const result = discoverMigrationFiles(fixtureDir)
    expect(result).not.toContain('README.md')
    expect(result).not.toContain('bad_name.ts')
    expect(result).not.toContain('01-short.ts')
  })

  it('returns an empty array when no filenames match', () => {
    expect(discoverMigrationFiles(emptyDir)).toEqual([])
  })
})
