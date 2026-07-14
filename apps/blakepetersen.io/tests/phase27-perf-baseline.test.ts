// ABOUTME: Perf-baseline shape-only test.
// ABOUTME: Checks JSON shape only — absolute wall-times are machine-specific, so a human eyeballs the values.

import fs from 'node:fs'
import path from 'node:path'

const baselinePath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '.planning',
  'intel',
  'build-perf-baseline.json',
)

describe('SCHEMA-07: build-perf baseline JSON shape', () => {
  it('file exists at .planning/intel/build-perf-baseline.json', () => {
    expect(fs.existsSync(baselinePath)).toBe(true)
  })

  const baseline: {
    capturedAt: string
    nodeVersion: string
    contentCount: number
    metrics: {
      fullBuildWallMs: number
      veliteWallMs: number
      webpackCompileMs: number | null
      nextDevReadyMs: number
    }
  } = fs.existsSync(baselinePath)
    ? JSON.parse(fs.readFileSync(baselinePath, 'utf-8'))
    : ({
        capturedAt: '',
        nodeVersion: '',
        contentCount: -1,
        metrics: {
          fullBuildWallMs: -1,
          veliteWallMs: -1,
          webpackCompileMs: null,
          nextDevReadyMs: -1,
        },
      } as never)

  it('has top-level capturedAt, nodeVersion, contentCount, metrics', () => {
    expect(baseline).toHaveProperty('capturedAt')
    expect(baseline).toHaveProperty('nodeVersion')
    expect(baseline).toHaveProperty('contentCount')
    expect(baseline).toHaveProperty('metrics')
  })

  it('capturedAt parses as a valid ISO date', () => {
    const d = new Date(baseline.capturedAt)
    expect(Number.isNaN(d.getTime())).toBe(false)
  })

  it('nodeVersion starts with "v"', () => {
    expect(baseline.nodeVersion.startsWith('v')).toBe(true)
  })

  it('contentCount is a non-negative integer', () => {
    expect(Number.isInteger(baseline.contentCount)).toBe(true)
    expect(baseline.contentCount).toBeGreaterThanOrEqual(0)
  })

  it('metrics has all four expected keys', () => {
    expect(baseline.metrics).toHaveProperty('fullBuildWallMs')
    expect(baseline.metrics).toHaveProperty('veliteWallMs')
    expect(baseline.metrics).toHaveProperty('webpackCompileMs')
    expect(baseline.metrics).toHaveProperty('nextDevReadyMs')
  })

  it('fullBuildWallMs, veliteWallMs, nextDevReadyMs are positive numbers', () => {
    expect(baseline.metrics.fullBuildWallMs).toBeGreaterThan(0)
    expect(baseline.metrics.veliteWallMs).toBeGreaterThan(0)
    expect(baseline.metrics.nextDevReadyMs).toBeGreaterThan(0)
  })

  it('webpackCompileMs is positive number OR null (regex tolerance)', () => {
    const v = baseline.metrics.webpackCompileMs
    expect(v === null || (typeof v === 'number' && v > 0)).toBe(true)
  })
})
