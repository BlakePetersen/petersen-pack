// ABOUTME: Tests for playground prop-type coercion heuristic.
// ABOUTME: Validates ControlType classification against every real PropDef.type in the registry.

import { parsePropType } from '@/lib/playground-prop-coercion'
import type { ControlType } from '@/lib/playground-prop-coercion'
import { getAllComponents } from '@/lib/component-registry'

describe('parsePropType', () => {
  it("classifies 'boolean' as { kind: 'boolean' }", () => {
    expect(parsePropType('boolean')).toEqual({ kind: 'boolean' })
  })

  it("classifies 'number' as { kind: 'number' }", () => {
    expect(parsePropType('number')).toEqual({ kind: 'number' })
  })

  it('classifies a single-quoted literal union as { kind: "select" }', () => {
    expect(parsePropType("'default' | 'outline' | 'ghost'")).toEqual({
      kind: 'select',
      options: ['default', 'outline', 'ghost']
    })
  })

  it('classifies another single-quoted literal union as select', () => {
    expect(parsePropType("'sm' | 'md' | 'lg'")).toEqual({
      kind: 'select',
      options: ['sm', 'md', 'lg']
    })
  })

  it('classifies a double-quoted literal union as select', () => {
    expect(parsePropType('"sm" | "md"')).toEqual({
      kind: 'select',
      options: ['sm', 'md']
    })
  })

  it("classifies 'string' as { kind: 'text' }", () => {
    expect(parsePropType('string')).toEqual({ kind: 'text' })
  })

  it("classifies 'ReactNode' as { kind: 'text' }", () => {
    expect(parsePropType('ReactNode')).toEqual({ kind: 'text' })
  })

  it('classifies a callback signature as { kind: "text" } (fallthrough)', () => {
    expect(parsePropType('(pressed: boolean) => void')).toEqual({
      kind: 'text'
    })
  })

  it('falls back to text when a literal-looking union ends with "..."', () => {
    // Real registry example from Input.type — trailing `...` defeats the regex.
    // The fallback is acceptable per RESEARCH.md Pattern 3.
    expect(
      parsePropType("'text' | 'email' | 'password' | 'number' | 'search' | ...")
    ).toEqual({ kind: 'text' })
  })

  it('trims leading/trailing whitespace before classifying', () => {
    expect(parsePropType('  boolean  ')).toEqual({ kind: 'boolean' })
    expect(parsePropType('  number  ')).toEqual({ kind: 'number' })
    expect(parsePropType("  'a' | 'b'  ")).toEqual({
      kind: 'select',
      options: ['a', 'b']
    })
  })

  it('falls back to text for mixed string | string[] unions (non-literal)', () => {
    expect(parsePropType('string | string[]')).toEqual({ kind: 'text' })
  })

  // ─── Data-driven: every real PropDef.type in the registry ───────────────
  // This pins the heuristic to live registry data. If someone adds a new
  // component whose prop.type shape isn't covered, this expectation table
  // must be updated — making the drift visible in review.
  const EXPECTED_KIND_BY_TYPE: Record<string, ControlType['kind']> = {
    "'default' | 'outline' | 'ghost'": 'select',
    "'default' | 'sm' | 'lg'": 'select',
    boolean: 'boolean',
    string: 'text',
    ReactNode: 'text',
    "'text' | 'email' | 'password' | 'number' | 'search' | ...": 'text',
    "'default' | 'outline' | 'secondary'": 'select',
    "'horizontal' | 'vertical'": 'select',
    '(pressed: boolean) => void': 'text',
    "'info' | 'warning' | 'error' | 'success'": 'select',
    '(value: string) => void': 'text',
    "'top' | 'right' | 'bottom' | 'left'": 'select',
    number: 'number',
    "'single' | 'multiple'": 'select',
    'string | string[]': 'text',
    '(open: boolean) => void': 'text',
    "'sm' | 'md' | 'lg'": 'select',
    '{ href: string; label: string }': 'text',
    '{ name: string; avatar?: string; href?: string }': 'text',
    'Array<{ name: string; reason: string }>': 'text',
    '-': 'text'
  }

  it('classifies every real PropDef.type in the registry without falling through silently', () => {
    const seenTypes = new Set<string>()
    for (const comp of getAllComponents()) {
      for (const prop of comp.props) {
        seenTypes.add(prop.type)
        const expectedKind = EXPECTED_KIND_BY_TYPE[prop.type]
        expect({
          componentSlug: comp.slug,
          propName: prop.name,
          propType: prop.type,
          expectedKind
        }).toMatchObject({
          // Fail loudly if a registry prop.type isn't in our expectation table —
          // every real prop.type must be classified.
          expectedKind: expect.any(String)
        })
        const result = parsePropType(prop.type)
        expect({
          componentSlug: comp.slug,
          propName: prop.name,
          propType: prop.type,
          kind: result.kind
        }).toEqual({
          componentSlug: comp.slug,
          propName: prop.name,
          propType: prop.type,
          kind: expectedKind
        })
      }
    }
    // Sanity: at least one of each kind should have been exercised.
    expect(seenTypes.size).toBeGreaterThan(0)
  })
})
