// ABOUTME: Heuristic parser from PropDef.type strings to form control descriptors.
// ABOUTME: Pure function — no React, no DOM, safe to test in node environment.

export type ControlType =
  | { kind: 'boolean' }
  | { kind: 'select'; options: string[] }
  | { kind: 'number' }
  | { kind: 'text' }

// Matches a pure TS literal-union type string made of single- or double-quoted
// string literals joined by `|`, e.g. "'sm' | 'md' | 'lg'" or '"a" | "b"'.
// Trailing `...` or any non-literal member defeats the match, which is the
// intended fallback behavior (see RESEARCH.md Pattern 3).
const literalUnionRe =
  /^(?:'[^']*'|"[^"]*")(?:\s*\|\s*(?:'[^']*'|"[^"]*"))+$/

/**
 * Classify a PropDef.type string into a form-control descriptor. Uses pure
 * regex heuristics — no TypeScript compiler — so it runs anywhere and stays
 * cheap. Anything that doesn't match a known shape falls through to
 * `{ kind: 'text' }`, which the Playground renders as a freeform text input.
 */
export function parsePropType(typeStr: string): ControlType {
  const t = typeStr.trim()

  if (t === 'boolean') return { kind: 'boolean' }
  if (t === 'number') return { kind: 'number' }

  if (literalUnionRe.test(t)) {
    const options = [...t.matchAll(/['"]([^'"]*)['"]/g)].map((m) => m[1])
    return { kind: 'select', options }
  }

  return { kind: 'text' }
}
