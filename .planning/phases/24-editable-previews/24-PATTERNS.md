# Phase 24: Editable Previews — Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 10 (8 new, 2 modified)
**Analogs found:** 10 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/artax/src/components/component-playground.tsx` | component (client) | request-response | `apps/artax/src/components/component-preview.tsx` | role-match |
| `apps/artax/src/components/playground-props-form.tsx` | component (client) | request-response | `apps/artax/src/components/props-table.tsx` | role-match |
| `apps/artax/src/components/playground-jsx-editor.tsx` | component (client) | event-driven | `apps/artax/src/components/code-examples.tsx` | partial |
| `apps/artax/src/lib/playground-url-state.ts` | utility | transform | `apps/artax/src/lib/component-registry.ts` (lookup fns) | partial |
| `apps/artax/src/lib/playground-prop-coercion.ts` | utility | transform | `apps/artax/src/components/props-table.tsx` (type dispatch) | partial |
| `apps/artax/src/lib/playground-registry.ts` | config/data | — | `apps/artax/src/lib/component-registry.ts` | role-match |
| `apps/artax/tests/component-playground.test.ts` | test | — | `apps/artax/tests/component-registry.test.ts` | exact |
| `apps/artax/tests/playground-url-state.test.ts` | test | — | `apps/artax/tests/component-registry.test.ts` | exact |
| `apps/artax/tests/playground-prop-coercion.test.ts` | test | — | `apps/artax/tests/component-registry.test.ts` | exact |
| `apps/artax/src/components/component-page-client.tsx` *(modified)* | component (client) | request-response | self | exact |
| `apps/artax/src/lib/component-registry.ts` *(modified)* | config/data | — | self | exact |

---

## Pattern Assignments

### `apps/artax/src/components/component-playground.tsx` (component, client)

**Analog:** `apps/artax/src/components/component-preview.tsx`

**ABOUTME header pattern** (lines 1-2):
```typescript
// ABOUTME: Playground tab body for interactive component previews.
// ABOUTME: Owns live preview canvas, props-form, and optional JSX editor state.
```

**Client boundary + imports pattern** (lines 1-6 of component-preview.tsx):
```typescript
'use client'

import { useState, type ReactNode } from 'react'
```
New file imports: `useState`, `useSearchParams`, artax-ui `Toggle`, `PlaygroundPropsForm`, `PlaygroundJsxEditor`, `ComponentDef` type.

**Preview canvas pattern** (lines 18-21, 41-44 of component-preview.tsx):
```tsx
<div
  data-testid="preview-area"
  className="bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-[length:16px_16px] border border-border"
>
  {/* ... */}
  <div className="flex items-center justify-center min-h-[120px] p-6">
    {renderPreview(activeVariant)}
  </div>
</div>
```
Playground canvas must use the exact same `bg-[radial-gradient(...)]` and `border border-border` classes. The `min-h-[120px] p-6` inner wrapper is reused verbatim.

**Section heading label pattern** (lines 58-60 of component-page-client.tsx):
```tsx
<h2 className="font-mono text-xs text-muted-foreground mb-3">
  {'// playground'}
</h2>
```
All section separators inside the playground use `// label` comment style in `font-mono text-xs text-muted-foreground`.

**Guard for disabled playground** (derived from registry opt-in pattern):
```tsx
if (!comp.playground?.enabled) return null
```
Return `null` (not a stub UI) for the 4 excluded components (Dialog, Dropdown, Tooltip, Accordion).

---

### `apps/artax/src/components/playground-props-form.tsx` (component, client)

**Analog:** `apps/artax/src/components/props-table.tsx`

**ABOUTME header pattern**:
```typescript
// ABOUTME: Typed props form driven by PropDef[] for the Playground tab.
// ABOUTME: Renders one control per prop (toggle/select/number/text) based on type coercion.
```

**Imports pattern** (lines 1-12 of props-table.tsx):
```typescript
import { Toggle, Input } from 'artax-ui'
import type { PropDef } from '@/lib/component-registry'
import { parsePropType } from '@/lib/playground-prop-coercion'
```
Note: props-table.tsx is NOT `'use client'` — it is a pure server component. `playground-props-form.tsx` MUST add `'use client'` because it owns controlled state (`onChange` handlers).

**Type-dispatch pattern** (lines 32-38 of props-table.tsx — the `props.map` over PropDef):
```tsx
{props.map((prop) => (
  <TableRow key={prop.name}>
    <TableCell className="font-mono">{prop.name}</TableCell>
    <TableCell className="font-mono text-muted-foreground">{prop.type}</TableCell>
    ...
  </TableRow>
))}
```
Mirror the `props.map((prop) => ...)` structure but dispatch on `parsePropType(prop.type).kind` instead of rendering table cells:
- `boolean` → artax-ui `<Toggle pressed={...} onPressedChange={...} />`
- `select` → native `<select>` (artax-ui Dropdown requires trigger; native avoids portal conflicts inside canvas)
- `number` → `<Input type="number" />`
- `text` → `<Input type="text" />`

**Empty state pattern** (lines 16-18 of props-table.tsx):
```tsx
if (props.length === 0) {
  return <p className="text-sm text-muted-foreground py-4">No props documented</p>
}
```

**Grid layout** (Claude's Discretion — 2-column on md+, stacked mobile):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Prop exclusion rule** (per RESEARCH.md Pattern 3):
Skip props where `prop.name === 'children'` or `prop.type.includes('=>')`.

---

### `apps/artax/src/components/playground-jsx-editor.tsx` (component, client)

**Analog:** `apps/artax/src/components/code-examples.tsx` (CodeBlock visual chrome) + `packages/artax-ui/src/components/molecules/code-block/code-block.tsx`

**ABOUTME header pattern**:
```typescript
// ABOUTME: react-live JSX editor wrapper for the Playground tab.
// ABOUTME: Renders LiveProvider/LiveEditor/LivePreview with artax terminal theme.
```

**Client boundary** (mandatory — react-live internals use useEffect/useState):
```typescript
'use client'
```

**CodeBlock chrome pattern** (lines 6-61 of code-block.tsx) — the editor sits visually inside a CodeBlock-like shell:
```tsx
<div className="bg-card border border-border overflow-hidden font-mono text-sm">
  <div className="flex items-center justify-between border-b border-border px-4 py-2">
    <span className="text-muted-foreground text-xs">{'// jsx editor'}</span>
  </div>
  {/* LiveEditor goes here */}
</div>
```
Use `bg-card border border-border` (same as CodeBlock) — not `bg-background`. This ensures the editor has the card surface, not raw background.

**react-live integration pattern** (from RESEARCH.md Pattern 1):
```tsx
import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live'
import { artaxTerminalTheme } from '@/lib/playground-theme'

<LiveProvider code={code} scope={scope} theme={artaxTerminalTheme} language="tsx">
  <LivePreview />
  <LiveError />
  <LiveEditor />
</LiveProvider>
```
Order: Preview first, then error, then editor. This matches the layout spec (preview top, editor below).

**Reset button pattern** (terminal aesthetic):
```tsx
<button type="button" onClick={onReset} className="font-mono text-xs text-muted-foreground px-4 py-2 border-t border-border w-full text-left">
  {'// reset to example'}
</button>
```

---

### `apps/artax/src/lib/playground-url-state.ts` (utility, transform)

**Analog:** `apps/artax/src/lib/component-registry.ts` (pure export module shape)

**ABOUTME header pattern**:
```typescript
// ABOUTME: Encode/decode helpers for Playground props in URL search params.
// ABOUTME: Uses ?p[key]=value format; pushState avoids RSC re-renders.
```

**Module shape** (no default export, named exports only — matches component-registry.ts pattern):
```typescript
export function encodePlaygroundParams(...): string { ... }
export function decodePlaygroundParams(...): Record<string, string> { ... }
export function pushPlaygroundParams(...): void { ... }
```

No `'use client'` directive — this is a pure module with no React imports. `pushPlaygroundParams` uses `window` (browser-only); callers must be client components. This matches how `getComponent` is used only from client components.

---

### `apps/artax/src/lib/playground-prop-coercion.ts` (utility, transform)

**Analog:** `apps/artax/src/components/props-table.tsx` (type string inspection)

**ABOUTME header pattern**:
```typescript
// ABOUTME: Heuristic parser from PropDef.type strings to form control descriptors.
// ABOUTME: Pure function — no React, no DOM, safe to test in node environment.
```

**Module shape** (pure, no imports beyond types):
```typescript
export type ControlType =
  | { kind: 'boolean' }
  | { kind: 'select'; options: string[] }
  | { kind: 'number' }
  | { kind: 'text' }

export function parsePropType(typeStr: string): ControlType { ... }
```

No `'use client'` — pure module, testable in node environment (matches jest.config.ts `testEnvironment: 'node'`).

---

### `apps/artax/src/lib/playground-registry.ts` (config, data)

**Analog:** `apps/artax/src/lib/component-registry.ts`

**ABOUTME header pattern**:
```typescript
// ABOUTME: Per-component Playground opt-in configuration.
// ABOUTME: Maps component slug to enabled flag; drives Playground tab visibility.
```

**Shape options:** Either a standalone map file OR the `playground` field is added directly to each `ComponentDef` in `component-registry.ts`. The CONTEXT.md says "possibly add `playground?` field" — prefer the registry extension to keep a single source of truth.

If standalone, pattern from component-registry.ts is a plain exported const (not a class):
```typescript
export const PLAYGROUND_CONFIG: Record<string, { enabled: boolean; defaultExampleIndex?: number }> = {
  button: { enabled: true },
  dialog: { enabled: false },
  // ...
}
```

---

### `apps/artax/src/components/component-page-client.tsx` *(modified)*

**Analog:** self

**Tab insertion pattern** (lines 42-53 — the existing TabsList block):
```tsx
<Tabs defaultValue="code">
  <TabsList>
    <TabsTrigger value="code">Code</TabsTrigger>
    <TabsTrigger value="props">Props</TabsTrigger>
    {comp.playground?.enabled && (
      <TabsTrigger value="playground">Playground</TabsTrigger>
    )}
  </TabsList>
  <TabsContent value="code">...</TabsContent>
  <TabsContent value="props">...</TabsContent>
  {comp.playground?.enabled && (
    <TabsContent value="playground">
      <ComponentPlayground comp={comp} />
    </TabsContent>
  )}
</Tabs>
```

Conditional rendering (`comp.playground?.enabled &&`) keeps excluded components' tabs clean without a redirect or error surface.

**New import to add** (follow existing import block style, lines 4-10):
```typescript
import { ComponentPlayground } from '@/components/component-playground'
```

---

### `apps/artax/src/lib/component-registry.ts` *(modified)*

**Analog:** self

**Interface extension pattern** (lines 64-75 — ComponentDef interface):
```typescript
export interface ComponentDef {
  // ... existing fields unchanged ...
  playground?: {
    enabled: boolean
    defaultExampleIndex?: number
  }
}
```
Optional field — omitting it is equivalent to `{ enabled: false }`. No existing component definitions require changes to be valid (TypeScript optional field).

---

### Test files (all three)

**Analog:** `apps/artax/tests/component-registry.test.ts` and `apps/artax/tests/component-routes.test.ts`

**ABOUTME header pattern** (lines 1-2 of component-registry.test.ts):
```typescript
// ABOUTME: Tests for [module name].
// ABOUTME: [One-sentence description of what is validated.]
```

**Import pattern** (lines 4-8 of component-registry.test.ts):
```typescript
import { functionUnderTest } from '@/lib/module-under-test'
import type { TypeUnderTest } from '@/lib/module-under-test'
```
Path alias `@/` is mapped to `src/` in jest.config.ts moduleNameMapper.

**Test structure** (lines 31+ of component-registry.test.ts):
```typescript
describe('module-name', () => {
  it('does the thing', () => {
    // arrange
    // act
    // assert via expect()
  })
})
```

**jsdom docblock** (required for component-playground.test.ts per RESEARCH.md):
```typescript
/** @jest-environment jsdom */
```
Place at the very top of the file, before the `// ABOUTME:` lines. Required because `testEnvironment: 'node'` is the default in jest.config.ts — the docblock overrides it per-file.

**Node environment test files** (`playground-url-state.test.ts`, `playground-prop-coercion.test.ts`): No docblock needed — default node environment is correct for pure function tests.

**react-live mock pattern** (per RESEARCH.md Pitfall 5 — do not integration-test compile cycle):
```typescript
jest.mock('react-live', () => ({
  LiveProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LiveEditor: () => <div data-testid="live-editor" />,
  LivePreview: () => <div data-testid="live-preview" />,
  LiveError: () => null,
}))
```

---

## Shared Patterns

### ABOUTME Header (ALL new files)
**Source:** All existing source files in `apps/artax/src/`
**Rule:** Every code file starts with exactly 2 lines of `// ABOUTME:` comments. No emoji. First line: what the file is. Second line: what it does or what it owns.

### Terminal Aesthetic (ALL components)
**Source:** `apps/artax/src/components/component-page-client.tsx` lines 58-60, `packages/artax-ui/src/components/molecules/code-block/code-block.tsx`
**Apply to:** All new component files
- Section labels: `{'// label-name'}` in `font-mono text-xs text-muted-foreground`
- Code surfaces: `bg-card border border-border font-mono text-sm`
- 0px border-radius (no `rounded-*` on primary containers)
- JetBrains Mono for code (delivered via `font-mono` Tailwind class)

### Client Boundary Convention
**Source:** `apps/artax/src/components/component-page-client.tsx` line 3, `apps/artax/src/components/component-preview.tsx` line 3
**Apply to:** `component-playground.tsx`, `playground-props-form.tsx`, `playground-jsx-editor.tsx`
- `'use client'` on the first non-comment line, immediately after the ABOUTME block
- Pure utility modules (`playground-url-state.ts`, `playground-prop-coercion.ts`) do NOT get `'use client'`

### Prop Exclusion Rule
**Source:** RESEARCH.md Pattern 3 / CONTEXT.md Decisions
**Apply to:** `playground-props-form.tsx`, `playground-prop-coercion.ts`
Skip any prop where `prop.name === 'children'` or `prop.type.includes('=>')`. Applied before rendering controls.

### dot-grid Preview Canvas
**Source:** `apps/artax/src/components/component-preview.tsx` lines 19-21, 41-44
**Apply to:** `component-playground.tsx` preview section
```
className="bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-[length:16px_16px] border border-border"
```
Inner content wrapper: `className="flex items-center justify-center min-h-[120px] p-6"`

---

## No Analog Found

All files have identifiable analogs. No entries.

---

## Metadata

**Analog search scope:** `apps/artax/src/`, `apps/artax/tests/`, `packages/artax-ui/src/components/molecules/code-block/`
**Files scanned:** 9 source files read directly
**Pattern extraction date:** 2026-04-17
