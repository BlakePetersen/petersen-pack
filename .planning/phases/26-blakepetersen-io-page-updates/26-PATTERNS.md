# Phase 26: blakepetersen.io Page Updates - Pattern Map

**Mapped:** 2026-04-19
**Files analyzed:** 21 (5 new primitives + 5 test files + 6 page rewrites + 2 MDX/barrel modifications + 3 MDX-map/factory modifications + 1 deletion)
**Analogs found:** 20 / 21 (1 primitive — DecisionRationale — has no direct analog; use Callout left-rule pattern + AuthorNote block structure)

## File Classification

### New Files (Plan 01 — Primitive Extraction)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `packages/artax-ui/src/components/atoms/badge/badge.tsx` (MODIFY) | primitive (atom) | pure-render | self (extend `badgeVariants`) | exact |
| `packages/artax-ui/src/components/organisms/modal/modal.tsx` | primitive (organism) | event-driven / portal | `packages/artax-ui/src/components/organisms/dialog/dialog.tsx` + `apps/blakepetersen.io/src/components/sidebar-drawer.tsx` | exact (compose over Dialog + mounted-flag gate) |
| `packages/artax-ui/src/components/molecules/author-note/author-note.tsx` | primitive (molecule) | pure-render | `packages/artax-ui/src/mdx/components.tsx#AuthorNote` (lines 269-277) + `Callout` (border-l structure) | role-match (existing impl to reconcile) |
| `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` | primitive (molecule) | pure-render | `packages/artax-ui/src/components/molecules/callout/callout.tsx` (left-rule + variant scaffolding) | partial (no direct content-card analog) |
| `packages/artax-ui/src/components/molecules/prev-next-nav/prev-next-nav.tsx` | primitive (molecule) | pure-render | `apps/blakepetersen.io/src/components/page-navigation.tsx` | exact (extraction source) |

### New Files (Plan 01 — Tests)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `packages/artax-ui/tests/components/modal.test.tsx` | test | unit (RTL + SSR) | `packages/artax-ui/tests/components/dialog.test.tsx` + `apps/artax/tests/header.test.tsx` (renderToString) | role-match |
| `packages/artax-ui/tests/components/author-note.test.tsx` | test | unit (RTL) | `packages/artax-ui/tests/components/callout.test.tsx` | exact |
| `packages/artax-ui/tests/components/decision-rationale.test.tsx` | test | unit (RTL) | `packages/artax-ui/tests/components/callout.test.tsx` | exact |
| `packages/artax-ui/tests/components/prev-next-nav.test.tsx` | test | unit (RTL) | `packages/artax-ui/tests/components/callout.test.tsx` (structure) + `badge.test.tsx` (variant coverage) | role-match |
| `packages/artax-ui/tests/components/badge.test.tsx` (EXTEND) | test | unit (RTL) | self — add 4 variant assertions (info, success, warning, destructive) | exact |

### Modified Files

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `packages/artax-ui/src/index.ts` | barrel-export | pure-render | self (existing export lines 5-72) | exact |
| `packages/artax-ui/src/mdx/components.tsx` | mdx-integration | pure-render | self (reconcile `AuthorNote` at lines 269-277 to re-use new molecule) | exact |
| `apps/blakepetersen.io/src/app/page.tsx` | page | SSG + getter | self (Homepage — surgical recompose) | exact |
| `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` | page (factory consumer) | SSG + MDX | self — no change; edit flows through `collection-pages.tsx` factory + `DxContentLayout` | exact |
| `apps/blakepetersen.io/src/components/dx-content-layout.tsx` | page-composition | pure-render | self — swap `PageNavigation` → `PrevNextNav` (line 8, 96) | exact |
| `apps/blakepetersen.io/src/components/post-layout.tsx` | page-composition | pure-render | self — swap `PageNavigation` → `PrevNextNav` (line 7, 55) | exact |
| `apps/blakepetersen.io/src/app/about/page.tsx` | page | static | self (surgical recompose) | exact |
| `apps/blakepetersen.io/src/app/start-here/page.tsx` | page | SSG + getter | self (surgical recompose; preserve `resolveSteps`) | exact |
| `apps/blakepetersen.io/src/lib/collection-pages.tsx` | page-factory | SSG + getter | self (`createCollectionIndexPage` lines 98-188 — recompose listing row) | exact |
| `apps/blakepetersen.io/src/app/{configs,hooks,guides,skills,posts}/page.tsx` | page (factory consumer) | SSG | self — no change; edits flow through factory | exact |
| `apps/blakepetersen.io/src/components/mdx-content.tsx` | mdx-integration | client render | self — register `<AuthorNote>`/`<DecisionRationale>` in `components` prop if Skills MDX demands them (conditional per D-06 plan 03) | role-match |

### Deleted Files

| File | Reason |
|------|--------|
| `apps/blakepetersen.io/src/components/page-navigation.tsx` | Superseded by `PrevNextNav` in artax-ui. Delete AFTER `dx-content-layout.tsx` + `post-layout.tsx` switch to the primitive (per RESEARCH "git-blame-friendly swap"). |

---

## Pattern Assignments

### `packages/artax-ui/src/components/atoms/badge/badge.tsx` (primitive, pure-render) — EXTEND

**Analog:** self — additive `badgeVariants` extension.

**Current variant block** (badge.tsx lines 6-20):
```tsx
const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 font-mono text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-border text-foreground',
        secondary: 'bg-muted text-secondary-foreground'
      }
    },
    defaultVariants: { variant: 'default' }
  }
)
```

**Extension target** (per UI-SPEC line 159-160 + RESEARCH "Badge Variant Extension"):
```tsx
// NEW — additive only, no renames
info: 'bg-[var(--surface-info)] text-info',
success: 'bg-[var(--surface-success)] text-success',
warning: 'bg-[var(--surface-warning)] text-warning',
destructive: 'bg-destructive/10 text-destructive',
```

**Consumer regression guard:** `collection-pages.tsx` line 155, 171 uses `<Badge variant="secondary">` — do not rename.

---

### `packages/artax-ui/src/components/organisms/modal/modal.tsx` (primitive, event-driven) — NEW

**Primary analog:** `packages/artax-ui/src/components/organisms/dialog/dialog.tsx` (compose over, don't re-wrap Radix)
**Secondary analog:** `apps/blakepetersen.io/src/components/sidebar-drawer.tsx` (mounted-flag SSR gate)

**Import pattern** (compose from sibling `dialog/dialog.tsx`):
```tsx
'use client'
// ABOUTME: Modal — thin composition over artax-ui Dialog with header/body/footer slots.
// ABOUTME: Applies mounted-flag SSR gate per Phase 24.1 D-09 for above-the-fold usage.
import { useState, useEffect, type ReactNode } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../dialog/dialog'
import { cn } from '../../../lib/utils'
```

**Mounted-flag gate pattern** (copy verbatim from `sidebar-drawer.tsx` structure; adapt for Modal prop surface):
```tsx
// Source: apps/blakepetersen.io/src/components/sidebar-drawer.tsx lines 12-27
// (no explicit useEffect mounted-flag there — Dialog is below-fold; Modal needs explicit gate per Phase 24.1 D-09)
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
if (!mounted && trigger) return <>{trigger}</>  // SSR: emit plain trigger
```

**Dialog composition** (copy structure from `dialog.tsx` `DialogContent` lines 83-102):
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
  <DialogContent className={cn(sizeClass[size], className)}>
    {children}
  </DialogContent>
</Dialog>
```

**Size variants** (per UI-SPEC line 168):
```tsx
const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' } as const
```

**Slot re-export pattern** (Phase 24 molecule convention):
```tsx
Modal.Title = DialogTitle
Modal.Description = DialogDescription
Modal.Close = DialogClose
```

**SSR test pattern** (copy from `apps/artax/tests/header.test.tsx` — renderToString + `.not.toMatch(/aria-controls="radix-/)`).

---

### `packages/artax-ui/src/components/molecules/author-note/author-note.tsx` (primitive, pure-render) — NEW + RECONCILE

**Primary analog:** `packages/artax-ui/src/mdx/components.tsx` lines 269-277 (existing AuthorNote — reconcile)
**Secondary analog:** `packages/artax-ui/src/components/molecules/callout/callout.tsx` (border-l + variant scaffolding)

**Existing implementation to replace** (mdx/components.tsx lines 269-277):
```tsx
AuthorNote: ({ children, ...props }: Props) => (
  <aside
    className="my-6 border-l-2 border-info bg-[var(--surface-info)] px-4 py-3"
    {...props}
  >
    <p className="mb-2 font-mono text-xs text-info">{'// author_note'}</p>
    <div className="font-sans text-sm text-secondary-foreground leading-relaxed">{children}</div>
  </aside>
),
```

**Reconciliation plan (D-05 gate):**
1. Extract the shape above into the new standalone molecule at `components/molecules/author-note/author-note.tsx`.
2. Molecule prop surface (generic — NO hardcoded "Blake's note"): `author?: { name: string; avatar?: string; href?: string }`, `date?: string`, `children`.
3. UI-SPEC line 177 asks for `border-l-primary`; current impl uses `border-l-info`. Decision belongs to plan 01 writer after `batch_get` on the Pencil AuthorNote frame. Default: preserve `border-l-info` unless Pencil shows amber, to minimize visual regression for existing MDX consumers.
4. After extraction, `mdx/components.tsx` AuthorNote entry becomes `AuthorNote: AuthorNoteMolecule` (re-export; single source of truth).

**Caption pattern** (preserve `// author_note` muted mono label from existing impl).

**Test analog:** `packages/artax-ui/tests/components/callout.test.tsx` (adapt — assert aside role="note", border-l class, children pass-through, no hardcoded editorial copy in source file).

---

### `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` (primitive, pure-render) — NEW

**Primary analog:** `packages/artax-ui/src/components/molecules/callout/callout.tsx` (left-rule structure)
**Secondary analog:** existing `mdxComponents.AuthorNote` (caption + body block pattern)

**Callout base pattern to adapt** (callout.tsx lines 14-32):
```tsx
function Callout({ className, variant = 'info', children, ...props }: ...) {
  return (
    <div
      className={cn(
        'bg-card border border-border border-l-4 p-4 font-mono text-sm text-foreground',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

**DecisionRationale prop surface** (per UI-SPEC line 184-188):
```tsx
type DecisionRationaleProps = {
  decision: string                                      // headline
  rationale: ReactNode                                  // body
  alternatives?: Array<{ name: string; reason: string }>
  collapsed?: boolean                                   // use <details>/<summary> if true
}
```

**Composition target** (UI-SPEC line 186): `bg-card p-6 border-l-4 border-primary` with `// decision` caption, headline at `text-base font-medium`, optional alternatives list.

**D-05 gate:** If Pencil `DecisionRationale` frame embeds bp.io-specific vocabulary ("Blake's call", project refs), pause per CONTEXT D-05. Prop names above are content-model-agnostic — maintain.

**Test analog:** `callout.test.tsx` — assert `border-l-primary`, `bg-card`, caption presence, collapsed/expanded toggle behavior when `collapsed` prop is set.

---

### `packages/artax-ui/src/components/molecules/prev-next-nav/prev-next-nav.tsx` (primitive, pure-render) — NEW

**Analog:** `apps/blakepetersen.io/src/components/page-navigation.tsx` (extraction source — verbatim shape, generic API)

**Source implementation to extract from** (page-navigation.tsx lines 22-52):
```tsx
<nav aria-label="Page navigation" className="mt-8 border-t border-border pt-6">
  <div className="flex justify-between font-mono text-sm">
    <div>
      {prev && (
        <Link href={prev.href} className="text-muted-foreground hover:text-foreground">
          {'< '}{prev.title}
        </Link>
      )}
    </div>
    <div>
      {next && (
        <Link href={next.href} className="text-muted-foreground hover:text-foreground">
          {next.title}{' >'}
        </Link>
      )}
    </div>
  </div>
</nav>
```

**API generalization** (per UI-SPEC line 192-196):
- Props: `prev?: { href: string; label: string }`, `next?: { href: string; label: string }`, `className?: string`
- Glyph: UI-SPEC "Copywriting Contract" specifies `← prev: {title}` / `next: {title} →`. Replace `<` / `>` from `page-navigation.tsx` with `←` / `→`.
- Hover: UI-SPEC line 194 says `text-primary hover:underline` on label — upgrade from existing `hover:text-foreground`.
- Aria label: UI-SPEC line 195 → `aria-label="Article navigation"` (existing uses `"Page navigation"`).

**Resolution callout:** `page-navigation.tsx` couples to `buildNavData()` + `getPrevNext()` internally. The new primitive MUST be dumb — consumers resolve prev/next and pass `{ href, label }`. `dx-content-layout.tsx` and `post-layout.tsx` become the resolvers (swap-in site — they already own the slug).

**`next/link` coupling caveat** (RESEARCH line 440): artax-ui currently has no Next.js dependency. Importing `next/link` adds a soft coupling. Two options per RESEARCH:
- (a) Accept the dep — artax-ui is consumed by Next apps only.
- (b) Accept an `asChild` slot pattern; consumers pass their own `<Link>`.

RESEARCH recommends (a). Fall back to (b) only if Jest jsdom context fails.

**Test analog:** new file, pattern from `callout.test.tsx` — assert 4 cases (prev-only, next-only, both, neither → returns null), aria-label wiring, arrow glyph presence.

---

### `packages/artax-ui/src/index.ts` (barrel-export) — MODIFY

**Analog:** self, lines 5-72 (existing pattern).

**Add after line 7** (`Badge` export — atoms section):
*(No change to Badge line itself — the new variants reuse the same export.)*

**Add after line 48** (molecules — TooltipContentPrimitive):
```tsx
export { AuthorNote } from './components/molecules/author-note/author-note'
export { DecisionRationale } from './components/molecules/decision-rationale/decision-rationale'
export { PrevNextNav } from './components/molecules/prev-next-nav/prev-next-nav'
```

**Add after line 72** (organisms — Dialog*):
```tsx
export { Modal } from './components/organisms/modal/modal'
```

---

### `packages/artax-ui/src/mdx/components.tsx` (mdx-integration) — MODIFY

**Analog:** self, lines 269-277 (existing AuthorNote).

**Change pattern** (replace inline def with primitive re-export):
```tsx
import { AuthorNote as AuthorNoteMolecule } from '../components/molecules/author-note/author-note'
// ...
export const mdxComponents = {
  // ...existing entries (h1..em)...
  AuthorNote: AuthorNoteMolecule,
  // (optional per D-06 plan 03) DecisionRationale: DecisionRationaleMolecule,
}
```

**Rationale (RESEARCH Pitfall 1):** Eliminates the AuthorNote name collision. MDX and page consumers share the same implementation.

---

### `apps/blakepetersen.io/src/app/page.tsx` (page, SSG) — MODIFY

**Analog:** self — surgical recompose per UI-SPEC "Homepage" section.

**Preserve verbatim** (data contract per D-01):
- Line 5: `import { getAllCollections, getCollection } from '../lib/collection-registry'`
- Line 11-13: `categories`, `stackTools` module scope
- Line 20-22: `getCollection('posts').getter()` + slice
- Line 25: `mx-auto max-w-[1600px] px-4 py-8` container
- Line 28, 44, 56, 82, 119: `// dx_workbench`, `// stack`, `// collections`, `// recent_posts`, `// contribute` section captions (UI-SPEC: preserve as brand motif)
- Line 34-37: `[skills]`, `[hooks]`, `[configs]`, `[guides]` bracket CTA convention
- Line 125-129: `$ report-problem`, `$ suggest-improvement` shell-command convention

**Replace** (per UI-SPEC line 214):
- Lines 47-50 — inline stack-chip span:
  ```tsx
  <span className="border border-border px-2 py-1 font-mono text-xs text-secondary-foreground">{tool}</span>
  ```
  With `<Badge variant="outline">{tool}</Badge>`.

**Conditional primitive** (D-06 plan 02):
- Modal only if Pencil Homepage frame wires a subscribe/contact modal off `// contribute`. If introduced, wrap in a `'use client'` island (`components/home-subscribe-modal.tsx`) per RESEARCH Pitfall 3 to keep `page.tsx` as a server component.

**CategoryCard** (line 61-73): keep — UI-SPEC line 216 "do not recreate".

---

### `apps/blakepetersen.io/src/components/dx-content-layout.tsx` (page-composition) — MODIFY

**Analog:** self — line 8 import + line 96 usage.

**Swap pattern** (one-line change each):
```diff
- import { PageNavigation } from './page-navigation'
+ import { PrevNextNav } from 'artax-ui'
...
- <PageNavigation slug={item.slug} />
+ { /* resolve prev/next here using buildNavData + getPrevNext, pass as { href, label } */ }
+ <PrevNextNav prev={prev && { href: prev.href, label: prev.title }} next={next && { href: next.href, label: next.title }} />
```

**Resolution move:** `page-navigation.tsx` line 8-20 wraps `buildNavData()` + `getPrevNext()`. Lift this resolution into the layout consumer so the primitive stays presentational.

---

### `apps/blakepetersen.io/src/components/post-layout.tsx` (page-composition) — MODIFY

**Analog:** self — line 7 import + line 55 usage.

Same swap pattern as `dx-content-layout.tsx` above.

---

### `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` (page, SSG + MDX) — NO CHANGE

All edits flow through `createCollectionDetailPage('skills')` factory → `DxContentLayout` (for skills' `layout !== 'post'`). Plan 03 touches `dx-content-layout.tsx` + optionally `mdx-content.tsx` components prop, NOT this file.

---

### `apps/blakepetersen.io/src/components/mdx-content.tsx` (mdx-integration) — CONDITIONAL MODIFY (Plan 03)

**Analog:** self — `components` prop spread at line 55 (per RESEARCH Pattern 4).

**Pattern for scoping primitives to Skills only** (if plan 03 opts for scope-vs-global per D-06):
```tsx
// In DxContentLayout's MDXContent call:
<MDXContent code={...} components={{ DecisionRationale }} />
```
Alternatively, register globally in `packages/artax-ui/src/mdx/components.tsx` (see that file's entry above).

**Decision gate (Plan 03 opening step per RESEARCH Open Q #2):**
```bash
grep -r "<AuthorNote\|<DecisionRationale" apps/blakepetersen.io/content/
```
If present, register globally. If absent, defer MDX-map registration.

---

### `apps/blakepetersen.io/src/app/about/page.tsx` (page, static) — MODIFY

**Analog:** self — surgical recompose per UI-SPEC "About" section.

**Preserve:**
- Line 13 container shape (may widen from `max-w-[80ch]` to `max-w-prose` per UI-SPEC line 234; verify against Pencil).
- Line 15, 28, 42 `// section_name` captions.
- Existing 3-section structure (about, philosophy, this_project).

**Add per UI-SPEC line 238-240:**
- Badge chip row (name / role / location) — use new `Badge variant="outline"` or `variant="secondary"`.
- Contact CTA row (`$ email-blake`, `$ find-me-on-github`) — terminal anchor style (copy from `page.tsx` line 125-129 pattern).
- Optional `AuthorNote` wrap around the editorial prose (D-05 gate — Pencil frame confirms).

---

### `apps/blakepetersen.io/src/app/start-here/page.tsx` (page, SSG + getter) — MODIFY

**Analog:** self — surgical recompose per UI-SPEC "Start Here" section.

**Preserve verbatim:**
- Line 19-24 `steps` array.
- Line 26-45 `resolveSteps()` function.
- Line 51 container + line 53 `// start_here` caption.

**Recompose:**
- Line 60-70 step card — per UI-SPEC line 249, use `bg-card p-6` with step number in `text-primary font-mono text-lg`. Current impl uses `border border-border p-4` and number is inlined with title.
- Add `// next` continuation block per UI-SPEC line 250 (link to homepage or `/skills`).
- Optional `DecisionRationale` for a "why this stack" block per UI-SPEC line 251 (D-05 gate).

---

### `apps/blakepetersen.io/src/lib/collection-pages.tsx` (page-factory) — MODIFY (Plan 06)

**Analog:** self — `createCollectionIndexPage` lines 98-188.

**Preserve verbatim** (D-01):
- Line 98-110: factory signature, `generateMetadata`, canonical URL.
- Line 112-115: `items = collection.getter()`, ContentShell wrapping.
- Line 122-124: Link wrapper with `hover:border-primary`.
- Line 155, 171: `<Badge variant="secondary">{tag}</Badge>` — do not rename variants.

**Recompose per UI-SPEC "Collection Listing" section (line 258-266):**
- Line 118-120 header: add count Badge + one-line description from registry (registry already exposes `label`, `indexDescription(count)`).
- Empty state (line 113 `items` empty) — add branch per UI-SPEC copywriting: `// empty_collection` + `No entries yet. Check back, or contribute one → [link]`.
- Row structure line 129-177 — keep current post-layout/dx-layout branching. Tag Badges line 150-158, 169-175 stay `variant="secondary"`.

---

## Shared Patterns

### Mounted-flag SSR gate (above-fold Radix)

**Source:** `apps/blakepetersen.io/src/components/sidebar-drawer.tsx` (Phase 24.1 D-09 pattern) — note: the existing drawer is below-fold and uses a simpler gate via `useState(open)`. Modal needs the explicit `useState(false) + useEffect(() => setMounted(true), [])` mount guard per RESEARCH Pattern 1.

**Apply to:** `packages/artax-ui/src/components/organisms/modal/modal.tsx`.

```tsx
'use client'
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
if (!mounted && trigger) return <>{trigger}</>   // SSR: inert trigger
// client-only: full Radix tree
```

---

### Semantic token usage (no color literals)

**Source:** Phase 25 D-05 replacement map; `packages/artax-ui/src/components/molecules/callout/callout.tsx` (lines 5-10 variant → token map).

**Apply to:** ALL new primitives (Badge variants, Modal content, AuthorNote border, DecisionRationale border, PrevNextNav hover).

| Semantic intent | Token class |
|-----------------|-------------|
| Background (neutral) | `bg-background` |
| Background (card/panel) | `bg-card` |
| Body text | `text-foreground` |
| Muted caption | `text-muted-foreground` |
| Accent / CTA | `text-primary`, `bg-primary` |
| Info status | `text-info`, `bg-[var(--surface-info)]`, `border-info` |
| Success status | `text-success`, `bg-[var(--surface-success)]`, `border-success` |
| Warning status | `text-warning`, `bg-[var(--surface-warning)]`, `border-warning` |
| Destructive | `text-destructive`, `bg-destructive/10`, `border-destructive` |
| Border (default) | `border-border` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` |

**Regression guard:** grep `bg-(amber|cyan|emerald|red|zinc)-[0-9]+` in new primitive files — must return empty. Exceptions require `// theme-static: <reason>` annotation (Phase 25 D-03).

---

### `// section_name` caption motif

**Source:** `apps/blakepetersen.io/src/app/page.tsx` lines 28, 44, 56, 82, 119.

**Apply to:** ALL page rewrites (Homepage, About, Start Here, Skills Detail header, Collection Listing header).

```tsx
<p className="mb-4 font-mono text-xs text-muted-foreground">{'// section_name'}</p>
```

---

### Shell-command CTA motif

**Source:** `apps/blakepetersen.io/src/app/page.tsx` lines 125-129.

**Apply to:** Homepage `// contribute`, About contact CTAs, Start Here `$ start-here` hero, any terminal-voice anchor link.

```tsx
<a href="..." className="text-primary hover:underline">$ verb-noun</a>
```

---

### Bracket CTA motif

**Source:** `apps/blakepetersen.io/src/app/page.tsx` lines 34-37.

**Apply to:** Homepage primary CTAs and anywhere the UI-SPEC copywriting contract specifies `[label]` anchors.

```tsx
<Link href="/..." className="text-primary hover:underline">[label]</Link>
```

---

### ABOUTME comment header

**Source:** every file in `apps/blakepetersen.io/src/` and `packages/artax-ui/src/` (e.g., `page.tsx:1-2`, `badge.tsx:1-2`).

**Apply to:** ALL new files (every primitive, every test, every page).

```tsx
// ABOUTME: <one-line purpose>.
// ABOUTME: <one-line elaboration or secondary concern>.
```

---

### Primitive test structure (artax-ui)

**Source:** `packages/artax-ui/tests/components/callout.test.tsx` (molecules), `packages/artax-ui/tests/components/badge.test.tsx` (atoms with variants), `packages/artax-ui/tests/components/dialog.test.tsx` (organism primitive variants).

**Apply to:** all 5 new test files.

Common contract:
```tsx
// ABOUTME: Tests for <component>.
// ABOUTME: <assertion scope>.
import { render, screen } from '@testing-library/react'
import { Component } from '../../src/components/<layer>/<name>/<name>'

describe('Component', () => {
  it('renders with children', () => { /* ... */ })
  it('applies monospace font class', () => { /* ... */ })
  it('supports custom className', () => { /* ... */ })
  it('renders <variant> variant', () => { /* ... */ })
})
```

Modal additionally requires SSR assertion:
```tsx
import { renderToString } from 'react-dom/server'
// ...
it('SSR emits no radix-prefixed aria-controls', () => {
  const html = renderToString(<Modal trigger={<button>open</button>}>body</Modal>)
  expect(html).not.toMatch(/aria-controls="radix-/)
})
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` | primitive (molecule) | pure-render | No existing "card-with-heading-and-optional-alternatives-list" primitive. Closest match is `Callout` (border-l-accent + body), so the plan should adapt Callout's structure + borrow the caption/heading pattern from existing `mdxComponents.AuthorNote`. Pencil frame is the definitive reference — use `mcp__pencil__batch_get DecisionRationale` at plan-time. |

---

## Metadata

**Analog search scope:**
- `apps/blakepetersen.io/src/` (components, app routes, lib)
- `packages/artax-ui/src/` (components, mdx, lib, styles)
- `packages/artax-ui/tests/components/` (test patterns)

**Files read (non-overlapping):**
- `apps/blakepetersen.io/src/app/page.tsx` (full — 137 lines)
- `apps/blakepetersen.io/src/app/about/page.tsx` (full — 57 lines)
- `apps/blakepetersen.io/src/app/start-here/page.tsx` (full — 83 lines)
- `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` (full — 12 lines)
- `apps/blakepetersen.io/src/app/configs/page.tsx` (full — factory consumer shape)
- `apps/blakepetersen.io/src/components/page-navigation.tsx` (full — 54 lines)
- `apps/blakepetersen.io/src/components/sidebar-drawer.tsx` (full — 46 lines)
- `apps/blakepetersen.io/src/lib/collection-pages.tsx` (full — 189 lines)
- `packages/artax-ui/src/index.ts` (full — 92 lines)
- `packages/artax-ui/src/components/atoms/badge/badge.tsx` (full — 33 lines)
- `packages/artax-ui/src/components/organisms/dialog/dialog.tsx` (full — 159 lines)
- `packages/artax-ui/src/components/molecules/callout/callout.tsx` (full — 36 lines)
- `packages/artax-ui/src/mdx/components.tsx` (full — 279 lines)
- `packages/artax-ui/tests/components/badge.test.tsx` (full — 38 lines)
- `packages/artax-ui/tests/components/callout.test.tsx` (full — 74 lines)
- `packages/artax-ui/tests/components/dialog.test.tsx` (full — 36 lines)

**Pattern extraction date:** 2026-04-19

---

*Phase: 26-blakepetersen-io-page-updates*
*Pattern mapping complete: 2026-04-19*
