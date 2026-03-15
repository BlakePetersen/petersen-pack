// ABOUTME: Tests for the package manager detection module.
// ABOUTME: Validates lockfile-based detection priority and install command generation.
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { detectPackageManager, installDevCommand } from '@/pm'

let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'blink-pm-'))
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('detectPackageManager', () => {
  it('returns pnpm when pnpm-lock.yaml exists', () => {
    writeFileSync(join(tmpDir, 'pnpm-lock.yaml'), '')
    expect(detectPackageManager(tmpDir)).toBe('pnpm')
  })

  it('returns yarn when yarn.lock exists', () => {
    writeFileSync(join(tmpDir, 'yarn.lock'), '')
    expect(detectPackageManager(tmpDir)).toBe('yarn')
  })

  it('returns npm when package-lock.json exists', () => {
    writeFileSync(join(tmpDir, 'package-lock.json'), '')
    expect(detectPackageManager(tmpDir)).toBe('npm')
  })

  it('defaults to npm when no lockfile found', () => {
    expect(detectPackageManager(tmpDir)).toBe('npm')
  })

  it('prefers pnpm over yarn when both lockfiles exist', () => {
    writeFileSync(join(tmpDir, 'pnpm-lock.yaml'), '')
    writeFileSync(join(tmpDir, 'yarn.lock'), '')
    expect(detectPackageManager(tmpDir)).toBe('pnpm')
  })
})

describe('installDevCommand', () => {
  it('returns correct pnpm command', () => {
    expect(installDevCommand('pnpm', ['prettier', 'eslint'])).toBe(
      'pnpm add -D prettier eslint'
    )
  })

  it('returns correct yarn command', () => {
    expect(installDevCommand('yarn', ['prettier'])).toBe(
      'yarn add -D prettier'
    )
  })

  it('returns correct npm command', () => {
    expect(installDevCommand('npm', ['prettier', 'eslint'])).toBe(
      'npm install -D prettier eslint'
    )
  })
})
