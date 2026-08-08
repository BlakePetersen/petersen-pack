// ABOUTME: Unit tests for AI issue triage helper functions.
// ABOUTME: Tests buildTriagePrompt, parseTriageResponse, and validateLabels.

import {
  buildTriagePrompt,
  parseTriageResponse,
  validateLabels
} from '../lib/triage-helpers'

describe('buildTriagePrompt', () => {
  it('returns string containing title and body in XML tags', () => {
    const result = buildTriagePrompt('Bug in login', 'The login page crashes')
    expect(result).toContain('<issue_title>Bug in login</issue_title>')
    expect(result).toContain('<issue_body>The login page crashes</issue_body>')
  })
})

describe('parseTriageResponse', () => {
  it('parses valid JSON with all fields', () => {
    const json = JSON.stringify({
      type: 'bug',
      priority: 'P1',
      area: 'area:ui',
      is_duplicate: false,
      tldr: 'Login page crashes on submit'
    })
    const result = parseTriageResponse(json)
    expect(result.type).toBe('bug')
    expect(result.priority).toBe('P1')
    expect(result.area).toBe('area:ui')
    expect(result.is_duplicate).toBe(false)
    expect(result.tldr).toBe('Login page crashes on submit')
  })

  it('returns fallback object for invalid JSON', () => {
    const result = parseTriageResponse('not json at all')
    expect(result.type).toBe('bug')
    expect(result.priority).toBe('P2')
    expect(result.area).toBe('area:infra')
    expect(result.is_duplicate).toBe(false)
    expect(result.tldr).toBe('Unable to parse issue')
  })

  it('extracts JSON from markdown code block', () => {
    const text =
      'Here is my analysis:\n```json\n{"type":"feature","priority":"P3","area":"area:content","is_duplicate":false,"tldr":"Add dark mode toggle"}\n```'
    const result = parseTriageResponse(text)
    expect(result.type).toBe('feature')
    expect(result.priority).toBe('P3')
    expect(result.area).toBe('area:content')
    expect(result.tldr).toBe('Add dark mode toggle')
  })
})

describe('validateLabels', () => {
  it('returns true for valid parsed object', () => {
    expect(
      validateLabels({
        type: 'bug',
        priority: 'P2',
        area: 'area:ui',
        is_duplicate: false,
        tldr: 'Something broke'
      })
    ).toBe(true)
  })

  it('returns false for invalid type value', () => {
    expect(
      validateLabels({
        type: 'unknown',
        priority: 'P2',
        area: 'area:ui',
        is_duplicate: false,
        tldr: 'Something'
      })
    ).toBe(false)
  })

  it('returns false for invalid priority value', () => {
    expect(
      validateLabels({
        type: 'bug',
        priority: 'P99',
        area: 'area:ui',
        is_duplicate: false,
        tldr: 'Something'
      })
    ).toBe(false)
  })

  it('returns false for invalid area value', () => {
    expect(
      validateLabels({
        type: 'bug',
        priority: 'P2',
        area: 'area:nonexistent',
        is_duplicate: false,
        tldr: 'Something'
      })
    ).toBe(false)
  })
})
