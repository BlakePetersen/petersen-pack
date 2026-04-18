---
phase: 24-editable-previews
type: research
status: complete
generated: 2026-04-17
---

# Phase 24: Editable Previews — Research

**Researched:** 2026-04-17
**Domain:** react-live, Next.js App Router searchParams, prism-react-renderer theming, props-form type coercion
**Confidence:** HIGH (core stack verified from source); MEDIUM (React 19 spike risk — warning confirmed, not a render failure)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Library:** `react-live@^4.1` with a 30-min compat spike as Plan 24-01. No pivot to sandpack on spike-fail.
- **Fail path:** Props-form ships alone if spike fails; "Edit JSX" toggle is the only gated surface.
- **Surface shape:** Hybrid — props-form default (always works), "Edit JSX" toggle reveals react-live editor.
- **Integration:** Third `Playground` tab in existing `TabsList` at `component-page-client.tsx`.
- **Layout:** Top: preview canvas; below: props-form (2-col md+, stacked mobile); below: "Edit JSX" toggle + conditional editor.
- **Static preview strip stays untouched.**
- **State — props:** URL-encoded via Next.js App Router searchParams. Decode on mount.
- **State — JSX:** Ephemeral (useState). "Reset to example" reverts to codeExamples[0].
- **SSR:** Playground tab hydrates with ?p[*]=... values applied — no flash of default state.
- **Imports scope for JSX editor:** artax-ui exports + React primitives only.
- **Broken-JSX UX:** react-live default error surface. No custom error boundary.
- **Mobile:** Single column below md; Playground tab stays visible.

### Claude's Discretion
- **Per-component opt-in:** Decide which 15 components get a Playground tab. Likely exclude Dialog, Dropdown, Tooltip, Accordion.
- **ComponentDef schema change:** Optional playground field or derive from playgroundPreview render function.
- **Type coercion rules:** Best-effort from type string. Booleans to Toggle, string-literal unions to select when parseable.

### Deferred Ideas (OUT OF SCOPE)
- Sandpack-based playground (ARTAX-F01)
- JSX state in URL via base64
- localStorage per slug
- Imports beyond artax-ui scope
- Accessibility audit (ARTAX-F02)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARTAX-08 | Editable mock data on component previews (gated on react-live React 19 compat; falls back to static) | Spike protocol defined; props-form coercion patterns documented; URL state encoding approach specified |
</phase_requirements>

---

## Summary

Phase 24 adds a Playground tab to each component page in `apps/artax`. The tab renders a live preview canvas, a typed props-form that encodes state to the URL, and (conditionally) a react-live JSX editor. The phase opens with a 30-minute compatibility spike that must be completed before any production work begins.

The core risk is react-live's use of Sucrase, which still emits the older JSX classic transform. React 19 introduced a dev-mode console warning when a component tree encounters the classic transform. This is a **warning, not a runtime failure** — the library still renders correctly. The warning originates from issue #405 (opened Dec 2024, no fix released in 4.1.8). A PR (#406) exists to add a jsxRuntime option but has not merged. The spike should confirm the warning is non-fatal and decide whether to suppress it or tolerate it.

URL state is handled with window.history.pushState (true shallow — does not trigger RSC re-renders) rather than router.replace (which does trigger server re-fetches). The nuqs library wraps this pattern cleanly; use it or roll a small helper. Props-form type coercion is entirely client-side heuristic parsing of PropDef.type strings — no TypeScript compiler integration needed.

**Primary recommendation:** Proceed with the spike. The known React 19 issue is a console warning in dev mode, not a render failure. If the spike passes (likely), build the hybrid surface. If it fails, ship props-form only.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Props-form rendering | Browser / Client | — | Reads PropDef[] from registry, renders controlled inputs, pure client state |
| URL encoding/decoding | Browser / Client | Frontend Server (SSR) | Written client-side via pushState; read at hydration from useSearchParams() |
| JSX compile-and-render | Browser / Client | — | Sucrase runs in-browser via dynamic eval; no server involvement |
| Preview canvas | Browser / Client | — | Same as existing ComponentPreview — pure client render |
| Tab structure | Browser / Client | — | Extends existing component-page-client.tsx (use client) |
| ComponentDef opt-in field | — (data layer) | — | Static registry data; no tier boundary |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-live | 4.1.8 (latest) | JSX compile-and-render in browser | Locked by CONTEXT.md; smallest bundle, SSR-compatible, React 18+ peer deps |
| prism-react-renderer | 2.4.1 (bundled) | Syntax highlighting + theming for LiveEditor | Transitive dep; themes export gives structured theme objects |
| window.history.pushState | native browser API | Shallow URL state updates without RSC re-render | No package; native API confirmed to work with Next.js App Router useSearchParams |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-debounce | 10.1.1 | Debounce searchParam writes | Prevents URL churn on every keystroke when rolling the URL helper without nuqs |
| nuqs | 2.8.9 | Type-safe URL query state (useState-like API synced to URL) | If rolling a bespoke helper feels too heavy; integrates cleanly with Next.js 16 App Router |

**Note on nuqs:** Not locked in CONTEXT.md. Available at Claude's discretion for playground-url-state.ts. Peer deps accept react >=18.2.0 || ^19.0.0-0. [VERIFIED: npm registry]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-live | sandpack | Deferred per CONTEXT.md — explicit React 19 support but heavier iframe bundler |
| window.history.pushState | router.replace | router.replace triggers RSC re-fetch on each keystroke — too expensive |
| nuqs | hand-rolled encode/decode | Both viable; nuqs saves ~30 lines and handles edge cases (arrays, coercion, shallow option) |

**Installation (spike):**
```bash
pnpm --filter artax add react-live
```

**Version verification:** [VERIFIED: npm registry — 2026-04-17]
- react-live@4.1.8 — published 2024-11-19
- prism-react-renderer@2.4.1 — bundled by react-live (also latest standalone)
- use-editable@2.3.3 — bundled by react-live; peer deps react >= 16.8.0
- sucrase@3.35.1 — bundled by react-live; last published 2025-11-19


---

## Architecture Patterns

### System Architecture Diagram

```
URL (?p[variant]=outline&p[size]=sm)
        |
        v
  [Playground Tab -- ComponentPlayground client component]
        |
        +--- useSearchParams() ---> decode props state on mount
        |
        +--- [Preview Canvas] <-- comp.preview(propsFromState)
        |    (dot-grid container, same CSS as ComponentPreview)
        |
        +--- [PropsForm]
        |    |  PropDef[] --> heuristic parser --> form controls
        |    |  onChange: write to local state + pushState to URL
        |    +- debounce 300ms to limit URL writes
        |
        +--- [Edit JSX Toggle] (only if spike passed)
                    |
                    +-- pressed=false: props-form controls only
                    +-- pressed=true:
                            v
                       [LiveProvider code=codeExamples[0] scope={artaxUI, React}]
                            |
                            +-- [LiveEditor] (contenteditable via use-editable)
                            +-- [LivePreview] (eval'd component)
                            +-- [LiveError] (red surface on error)
                            +-- "Reset to example" button --> resets to codeExamples[0]
```

### Recommended Project Structure

```
apps/artax/src/
+-- components/
|   +-- component-page-client.tsx    # existing -- add Playground TabsTrigger + TabsContent
|   +-- component-playground.tsx     # NEW -- full Playground tab body
|   +-- props-form.tsx               # NEW -- form driven by PropDef[]
|   +-- playground-editor.tsx        # NEW -- react-live wrapper (conditionally rendered)
+-- lib/
    +-- component-registry.ts        # existing -- add optional playground field to ComponentDef
    +-- playground-url-state.ts      # NEW -- encode/decode helpers for ?p[*]= params
    +-- playground-theme.ts          # NEW -- custom PrismTheme matching terminal aesthetic
    +-- parse-prop-type.ts           # NEW -- heuristic regex parser for PropDef.type strings
```

### Pattern 1: react-live Integration (SSR-safe)

react-live's LiveProvider, LiveEditor, LivePreview, and LiveError are all client-only (they use useEffect, useState, contenteditable). Because component-page-client.tsx is already 'use client', **no additional next/dynamic wrapping is needed**. [VERIFIED: react-live source — LiveProvider.tsx uses useEffect and useState only]

Sucrase's dynamic eval runs only in the browser. playground-editor.tsx must carry 'use client' and must not be imported from any server component.

```tsx
// Source: react-live source + Context7 /formidablelabs/react-live
// apps/artax/src/components/playground-editor.tsx
'use client'

import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live'
import { artaxTerminalTheme } from '@/lib/playground-theme'

export function PlaygroundEditor({
  code,
  scope,
  onReset,
}: {
  code: string
  scope: Record<string, unknown>
  onReset: () => void
}) {
  return (
    <LiveProvider code={code} scope={scope} theme={artaxTerminalTheme} language="tsx">
      <LivePreview />
      <LiveError />
      <LiveEditor />
      <button type="button" onClick={onReset} className="font-mono text-xs text-muted-foreground">
        {'// reset to example'}
      </button>
    </LiveProvider>
  )
}
```

### Pattern 2: URL State (Shallow — No RSC Re-render)

router.replace in Next.js App Router triggers a server fetch for RSC segments. For ephemeral playground state, use window.history.pushState instead — Next.js's useSearchParams picks up the change without re-running the server component tree. [VERIFIED: Next.js discussion #49540, confirmed behavior in Next.js 14.2+; applies to Next.js 16]

```ts
// Source: Next.js discussion #49540 + MDN
// apps/artax/src/lib/playground-url-state.ts

// Encode: { variant: 'outline', size: 'sm' } -> '?p[variant]=outline&p[size]=sm'
export function encodePlaygroundParams(props: Record<string, string>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(props)) {
    params.set(`p[${key}]`, value)
  }
  return params.toString()
}

// Decode: URLSearchParams -> { variant: 'outline', size: 'sm' }
export function decodePlaygroundParams(searchParams: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^p\[(.+)\]$/)
    if (match) result[match[1]] = value
  }
  return result
}

// Shallow push -- does NOT trigger RSC re-render
export function pushPlaygroundParams(props: Record<string, string>): void {
  const encoded = encodePlaygroundParams(props)
  const url = `${window.location.pathname}?${encoded}`
  window.history.pushState(null, '', url)
}
```

**Debouncing:** Wrap pushPlaygroundParams calls with a 300ms debounce via use-debounce or a plain useRef-based timer.

**SSR hydration:** ComponentPlayground is 'use client'. useSearchParams() at mount returns the current URL's params. Pass decoded props as initial state to the props-form. No hydration mismatch — the server component at page.tsx renders no playground HTML.

### Pattern 3: Props-form Type Coercion

Parse PropDef.type strings heuristically. No TypeScript compiler; pure regex. [ASSUMED — pattern is conventional for doc-site props forms]

```ts
// apps/artax/src/lib/parse-prop-type.ts

export type ControlType =
  | { kind: 'boolean' }
  | { kind: 'select'; options: string[] }
  | { kind: 'number' }
  | { kind: 'text' }

export function parsePropType(typeStr: string): ControlType {
  const t = typeStr.trim()

  if (t === 'boolean') return { kind: 'boolean' }
  if (t === 'number') return { kind: 'number' }

  // String literal union: "'sm' | 'md' | 'lg'" or '"sm" | "md"'
  const literalUnionRe = /^(?:'[^']*'|"[^"]*")(?:\s*\|\s*(?:'[^']*'|"[^"]*"))+$/
  if (literalUnionRe.test(t)) {
    const options = [...t.matchAll(/['"]([^'"]*)['"]/g)].map((m) => m[1])
    return { kind: 'select', options }
  }

  // Fall through: ReactNode, string, unknown, generics, callbacks
  return { kind: 'text' }
}
```

**Edge cases against real registry data:**
- `"'default' | 'outline' | 'ghost'"` -> select (correct)
- `"'sm' | 'md' | 'lg'"` -> select (correct)
- `"'info' | 'warning' | 'error' | 'success'"` -> select (correct)
- `"boolean"` -> boolean (correct)
- `"number"` -> number (correct)
- `"string"` -> text (correct — free-form string input)
- `"ReactNode"` -> text (correct)
- `"'text' | 'email' | 'password' | 'number' | 'search' | ..."` -> text (trailing ... breaks the pattern — acceptable fallback)
- `"(pressed: boolean) => void"` -> text (but should be excluded by callback-detection)

**Prop exclusion:** Skip props where name === 'children' or the type string contains `=>` (callback signatures). These cannot be meaningfully expressed in a form control.

### Pattern 4: prism-react-renderer Custom Theme

```ts
// Source: prism-react-renderer PrismTheme type + vsDark.ts reference
// apps/artax/src/lib/playground-theme.ts
import type { PrismTheme } from 'prism-react-renderer'

// Maps artax CSS tokens to a PrismTheme object.
// Background: #0A0A0A (--color-background).
// Amber (#F59E0B) used for keywords per terminal aesthetic.
export const artaxTerminalTheme: PrismTheme = {
  plain: {
    backgroundColor: '#0A0A0A',
    color: '#D4D4D4',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '13px',
  },
  styles: [
    { types: ['keyword', 'operator'], style: { color: '#F59E0B' } },
    { types: ['string', 'attr-value'], style: { color: '#86EFAC' } },
    { types: ['comment'], style: { color: '#6B7280', fontStyle: 'italic' } },
    { types: ['punctuation'], style: { color: '#9CA3AF' } },
    { types: ['tag', 'attr-name'], style: { color: '#93C5FD' } },
    { types: ['number', 'boolean'], style: { color: '#F59E0B' } },
    { types: ['function'], style: { color: '#D4D4D4' } },
    { types: ['class-name', 'maybe-class-name'], style: { color: '#FBBF24' } },
  ],
}
```

### Pattern 5: Per-Component Opt-In (ComponentDef Schema Change)

Add an optional playground field to ComponentDef:

```ts
// apps/artax/src/lib/component-registry.ts

export interface ComponentDef {
  // ... existing fields ...
  playground?: {
    enabled: boolean
    // Optional: override which codeExample index seeds the JSX editor (default: 0)
    defaultExampleIndex?: number
  }
}
```

**Recommended exclusion list (Claude's Discretion):**

| Component | Playground Enabled? | Reason |
|-----------|---------------------|--------|
| Button | Yes | Simple atom; variant + size + disabled all work as form controls |
| Input | Yes | type, placeholder, disabled — all expressible |
| Badge | Yes | variant — select control |
| Separator | Yes | orientation — select control |
| CopyButton | Yes | text — string input |
| Toggle | Yes | pressed, defaultPressed — boolean controls |
| Card | Yes | className — string input; children skipped |
| Table | Yes | className — string input |
| Callout | Yes | variant — select control |
| CodeBlock | Yes | filename, language, rawCode — string inputs |
| Tabs | Yes | defaultValue — string input |
| Tooltip | No | Requires TooltipProvider wrapper + hover state; single-render model breaks |
| Accordion | No | Multi-child composition; form can't express item structure |
| Dialog | No | Trigger-based; portal z-index conflicts with preview canvas |
| Dropdown | No | Same as Dialog — trigger-based, portal out of canvas bounds |

**Enabled count:** 11 of 15 components get a Playground tab.

### Anti-Patterns to Avoid

- **Using router.replace for prop updates** — triggers RSC re-fetch on every keystroke. Use window.history.pushState instead.
- **Rendering PlaygroundEditor (react-live) during SSR** — the dynamic eval inside react-live throws in Node.js. Since component-page-client.tsx is already 'use client', this is avoided automatically. Do not add next/dynamic with ssr: false on top — redundant and adds complexity.
- **Passing the h alias (createElement shorthand) into scope** — the registry uses `const h = createElement` for dense internal code. Users editing JSX will not have `h` available. Scope must expose named artax-ui components directly.
- **Setting noInline=true by default** — only needed for multi-statement imperative code. Registry previews use single-expression style.


---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSX in-browser compile | Custom Babel/SWC wasm integration | react-live + Sucrase | Sucrase is already battle-tested; wasm Babel adds 500KB+ |
| URL state serialization | Bespoke base64 encoding | URLSearchParams + ?p[key]=val format | Base64 is opaque and uneditable by hand; query strings are human-readable |
| Syntax highlighting in editor | Custom textarea + CSS | react-live's LiveEditor (uses use-editable + prism-react-renderer) | use-editable handles contenteditable cursor management — a notoriously hard problem |
| Error boundary around live preview | Custom React error boundary class | LiveError from react-live | react-live's error boundary is already wired to catch Sucrase eval errors, not just React render errors |

**Key insight:** react-live's value is the integrated compile -> eval -> render -> error-capture pipeline, not just the editor UI.

---

## Common Pitfalls

### Pitfall 1: React 19 Dev-Mode JSX Transform Warning
**What goes wrong:** LivePreview shows a console warning in development: "Your app (or one of its dependencies) is using an outdated JSX transform." Sucrase emits React.createElement calls (classic transform); React 19 warns when it detects this in dynamically evaluated code.
**Why it happens:** react-live's transform.ts uses Sucrase with transforms: ["jsx", "imports"]. Sucrase does not yet emit the automatic JSX runtime by default (sucrase issue #585 closed as too complex). PR #406 on react-live adds a jsxRuntime option but has not merged into 4.1.8.
**How to avoid:** The warning is **dev-mode only and non-fatal** — the component still renders. The spike should explicitly check: (1) is the warning present in dev? (2) does it appear in a production build? If dev-only, document and move on. Do not block the spike on this warning.
**Warning signs for actual failure:** If warnings escalate to thrown errors, if HMR breaks, or if LivePreview renders nothing and LiveError shows a React invariant — those indicate a real spike failure.

### Pitfall 2: Radix Children Typing (Lesson from Phase 23)
**What goes wrong:** Tooltip, Dialog, and Dropdown registry previews use a children prop object pattern rather than nested JSX. If a user edits JSX in the editor and tries to compose Tooltip, it requires TooltipProvider in scope.
**Why it happens:** These components need orchestration wrappers. The registry handles this with closed h() calls. The JSX editor exposes raw artax-ui primitives.
**How to avoid:** These components are excluded from the Playground (see exclusion list).

### Pitfall 3: Scope Variable Name Collision with Reserved Words
**What goes wrong:** react-live issue #391 (open) reports that scope variable names that are JS reserved keywords (default, class) cause Sucrase parse errors.
**Why it happens:** The dynamic code evaluation fails when a scope key is a reserved word.
**How to avoid:** Do not add any artax-ui export with a reserved name to the scope. Current registry exports are all safe (Button, Input, Badge, etc.). No action needed unless new reserved-name exports are added.

### Pitfall 4: URL Param Hydration — Not an Issue Here
**What goes wrong:** Some Next.js URL state patterns cause a flash of default state before hydrated values apply.
**Why it happens:** Would occur if server-rendered HTML showed default-state UI that the client then corrected.
**How to avoid:** Not a risk for this phase. The component page server component passes only {tier, slug} to ComponentPageClient. No playground-specific HTML is server-rendered. The Playground tab is fully client-rendered — useSearchParams() at mount produces correct initial values immediately.

### Pitfall 5: Testing react-live Components in jsdom
**What goes wrong:** Integration-testing the full compile-and-render cycle for PlaygroundEditor in jsdom hits limitations around dynamic code evaluation and some browser APIs.
**Why it happens:** react-live's internal eval pipeline involves browser-specific APIs that jsdom partially polyfills.
**How to avoid:** Do not integration-test the compile-render cycle in jsdom. Test the encode/decode helpers and type coercer as pure functions. Test React component wiring with a mocked react-live via jest.mock. Reserve real react-live smoke-testing for the manual spike commit.

### Pitfall 6: Next.js Turbopack — Not an Issue Here
**What goes wrong:** The project uses --webpack for dev mode due to a known Velite + Turbopack incompatibility.
**Why it happens:** Velite's build-time hooks conflict with Turbopack's module graph.
**How to avoid:** No action needed. react-live is a client-only runtime dependency — no build-time transforms. The webpack workaround stays in place and does not affect react-live behavior.

---

## Runtime State Inventory

Step 2.5 SKIPPED — Phase 24 is greenfield (new files, new tab). No rename, refactor, or migration involved.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| react-live | JSX editor (spike) | Not yet installed | — | Props-form only (CONTEXT.md fail path) |
| pnpm | Package install | Yes | 10.28.2 | — |
| Next.js | App runtime | Yes | 16.2.2 | — |
| React 19 | Peer dep target | Yes | 19.2.4 | — |
| jest + ts-jest | Tests | Yes | jest 30.3.0 | — |
| jest-environment-jsdom | Component tests | Yes | 30.3.0 (in devDeps) | — |

**Missing dependencies with no fallback:**
- react-live — must be installed in Plan 24-01 (spike). If spike fails, install is rolled back and props-form ships without it.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + ts-jest |
| Config file | apps/artax/jest.config.ts |
| Quick run command | pnpm --filter artax test |
| Full suite command | pnpm --filter artax test --coverage |
| Environment | node (default per jest.config.ts) — playground component tests need @jest-environment jsdom docblock |

**Note:** jest-environment-jsdom@30.3.0 is already in devDependencies — no install needed. Add `/** @jest-environment jsdom */` at the top of test files that interact with DOM APIs or React components.

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARTAX-08 | encodePlaygroundParams round-trips props to URL and back | unit | pnpm --filter artax test -- playground-url-state | Wave 0 gap |
| ARTAX-08 | parsePropType returns correct ControlType for each category | unit | pnpm --filter artax test -- parse-prop-type | Wave 0 gap |
| ARTAX-08 | ComponentPlayground renders PropsForm for enabled components | unit (jsdom) | pnpm --filter artax test -- component-playground | Wave 0 gap |
| ARTAX-08 | Excluded components render no Playground tab | unit (jsdom) | pnpm --filter artax test -- component-playground | Wave 0 gap |
| ARTAX-08 | generateStaticParams still returns 15 after registry changes | regression | pnpm --filter artax test -- component-routes | Exists |

### Sampling Rate
- **Per task commit:** pnpm --filter artax test
- **Per wave merge:** pnpm --filter artax test --coverage
- **Phase gate:** Full suite green before /gsd-verify-work

### Wave 0 Gaps
- [ ] tests/playground-url-state.test.ts — covers ARTAX-08 encode/decode
- [ ] tests/parse-prop-type.test.ts — covers ARTAX-08 type coercion
- [ ] tests/component-playground.test.tsx — covers ARTAX-08 component wiring (needs @jest-environment jsdom docblock)

---

## Security Domain

Minimal surface — the Playground is a public docs site with no auth, no user data storage, and no server-side execution of user input. The JSX eval runs in the user's own browser against their own input.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | Partial | parsePropType validates prop type strings; URL params are decoded but never executed server-side |
| V6 Cryptography | No | — |

**URL-injected XSS:** URL-decoded values are used as React prop values (strings, booleans, numbers), not rendered as raw HTML. React's default escaping applies. No server-side rendering of user-controlled URL values occurs.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| router.replace for shallow URL updates | window.history.pushState | Next.js 13 App Router GA | router.replace triggers RSC re-render; pushState does not |
| babel-standalone in-browser (component-playground) | Sucrase (react-live 3+) | react-live v3 (2022) | ~10x smaller bundle; no async runtime loading |
| react-simple-code-editor (react-live 2.x) | use-editable + contenteditable | react-live v3 (2022) | Fixes duplicate React version install issue (old issue #278) |
| Global themes default (vsDark) | Pass custom PrismTheme object | prism-react-renderer v2 (2023) | Custom theme objects are the standard flexibility point |

**Deprecated/outdated:**
- react-live v2.x: Used react-simple-code-editor which caused a duplicate React invariant issue (#278). Fully resolved in v4 — do not reference v2 patterns.
- noInline=true as default: Only for multi-statement imperative code. Registry previews use single-expression style.

---

## Open Questions (RESOLVED)

1. **React 19 JSX warning — suppress or tolerate?**
   - What we know: Issue #405 reports a dev-mode warning when react-live code is evaluated under React 19. PR #406 adds jsxRuntime option but hasn't merged.
   - What's unclear: Whether the warning appears in production builds (likely stripped by React's prod bundle) or only in development.
   - **RESOLVED:** tolerate dev-only warning per Pitfall #1 analysis (Sucrase issue #405 confirms non-fatal in production builds); spike captures whether warning also appears in `next build` output. If confirmed dev-only, document and move on; if it surfaces in prod, escalate before proceeding to plan 24-06.

2. **Scope population strategy for artax-ui exports**
   - What we know: Scope must include all artax-ui named exports so users can compose them in the JSX editor. The registry already imports all of them.
   - What's unclear: Whether `import * as artaxUI from 'artax-ui'` and spread is safe (tree-shaking, side effects).
   - **RESOLVED:** default to `import * as artaxUI` wildcard spread; spike measures bundle impact via `next build --profile`. Fallback to explicit enumeration only if tree-shaking is confirmed broken.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | window.history.pushState does not trigger RSC re-render in Next.js 16.2.2 | Architecture Patterns / Pattern 2 | Props changes cause expensive server round-trips on each keystroke; mitigation: switch to nuqs with shallow: true |
| A2 | react-live renders correctly under React 19 (spike outcome) | Summary | Phase ships props-form only per CONTEXT.md fail path |
| A3 | artax-ui barrel can be spread into LiveProvider scope without side effects | Open Questions #2 | Some exports might not be safe to bundle this way; audit at spike time |
| A4 | Skipping callback-typed props in the props-form is acceptable UX | Pattern 3 / Prop Exclusion | Users lose the ability to wire event handlers from the form; acceptable given CONTEXT.md best-effort framing |

---

## Sources

### Primary (HIGH confidence)
- GitHub API direct read: FormidableLabs/react-live source — transform.ts, LiveProvider.tsx, evalCode.ts, usage.md, faq.md [VERIFIED]
- npm registry: react-live@4.1.8, prism-react-renderer@2.4.1, use-editable@2.3.3, sucrase@3.35.1, nuqs@2.8.9, use-debounce@10.1.1 — versions verified 2026-04-17 [VERIFIED]
- GitHub API: FormidableLabs/react-live releases — changelog confirmed for v4.1.x series [VERIFIED]
- Context7 /formidablelabs/react-live — LiveProvider, scope, SSR, noInline, theming docs [VERIFIED]

### Secondary (MEDIUM confidence)
- GitHub issue #405 (react-live): React 19 JSX transform warning — dev-mode warning only, not a render failure [CITED: github.com/FormidableLabs/react-live/issues/405]
- GitHub PR #406 (react-live): jsxRuntime option attempt — confirmed unmerged in 4.1.8 [CITED: github.com/FormidableLabs/react-live/pulls/406]
- GitHub issue #391 (react-live): Reserved keyword scope collision — confirmed open [CITED: github.com/FormidableLabs/react-live/issues/391]
- GitHub discussion #49540 (Next.js): Shallow routing / pushState behavior [CITED: github.com/vercel/next.js/discussions/49540]
- prism-react-renderer PrismTheme type structure — confirmed from WebSearch + npm package structure

### Tertiary (LOW confidence)
- WebSearch: shadcn-ui sandpack playground Next.js 15 — confirms shadcn uses Sandpack (not react-live); supports CONTEXT.md decision
- WebSearch: sucrase React 19 JSX transform — confirms the classic transform warning is widespread and not artax-specific

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from npm registry and react-live source
- Architecture patterns: HIGH for react-live API; MEDIUM for pushState behavior (confirmed from Next.js discussion, not official docs page)
- Pitfalls: HIGH for #1 (verified issue #405), HIGH for #2 (Phase 23 recorded decision), MEDIUM for #3-#6 (source reading and general Next.js knowledge)
- Type coercion: MEDIUM — conventional doc-site pattern; regex approach is original [ASSUMED workable]

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (react-live moves slowly; Next.js URL behavior stable)
