---
phase: 26-blakepetersen-io-page-updates
reviewed: 2026-04-19T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - packages/artax-ui/src/components/atoms/badge/badge.tsx
  - packages/artax-ui/src/components/organisms/modal/modal.tsx
  - packages/artax-ui/src/components/molecules/prev-next-nav/prev-next-nav.tsx
  - packages/artax-ui/src/components/molecules/author-note/author-note.tsx
  - packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx
  - packages/artax-ui/src/mdx/components.tsx
  - packages/artax-ui/src/index.ts
  - packages/artax-ui/tests/components/badge.test.tsx
  - packages/artax-ui/tests/components/modal.test.tsx
  - packages/artax-ui/tests/components/prev-next-nav.test.tsx
  - packages/artax-ui/tests/components/author-note.test.tsx
  - packages/artax-ui/tests/components/decision-rationale.test.tsx
  - packages/artax-ui/tests/boundaries.test.ts
  - apps/blakepetersen.io/src/app/page.tsx
  - apps/blakepetersen.io/src/app/about/page.tsx
  - apps/blakepetersen.io/src/app/start-here/page.tsx
  - apps/blakepetersen.io/src/components/dx-content-layout.tsx
  - apps/blakepetersen.io/src/components/post-layout.tsx
  - apps/blakepetersen.io/src/lib/collection-pages.tsx
  - apps/blakepetersen.io/tests/lib/collection-pages.test.tsx
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
status: issues_found
---

# Phase 26: Code Review Report

**Reviewed:** 2026-04-19
**Depth:** standard
**Files Reviewed:** 20 (+ 1 deletion verified clean)
**Status:** issues_found

## Summary

Phase 26 is structurally sound. The surgical rewrite strategy (D-01) was respected — no data contract changes were introduced. All five new artax-ui primitives are correctly exported from the barrel, the deleted `page-navigation.tsx` leaves zero dangling imports, the Modal SSR gate is correctly implemented, and the D-05 editorial-voice gate passes (no hardcoded `Blake's note` or `blakepetersen` patterns in primitive source). Server-component boundaries are enforced correctly across all page files.

Five warnings and three info-level findings are noted. None are critical. The warnings concern typography and spacing spec deviations introduced in the new primitive files — all three new molecule primitives (`PrevNextNav`, `AuthorNote`, `DecisionRationale`) contain size tokens outside the 4-token cap (`text-sm`), and two contain Tailwind-3 spacing (12px) which the UI-SPEC prohibits.

---

## Warnings

### WR-01: PrevNextNav uses `text-sm` — outside the 4-size cap

**File:** `packages/artax-ui/src/components/molecules/prev-next-nav/prev-next-nav.tsx:20`

**Issue:** The UI-SPEC locks typography to exactly four tokens: `text-xs`, `text-base`, `text-lg`, `text-3xl`. `text-sm` (14px) is explicitly excluded. `PrevNextNav` ships with `font-mono text-sm` as its base text size. As a reusable artax-ui primitive this will propagate the disallowed token to every consumer.

**Fix:** Replace `text-sm` with `text-xs` (for a tighter caption feel matching the `← prev:` / `next: →` meta role) or `text-base` (if the nav links should read at body weight):

```tsx
// Before (line 20)
'mt-12 flex justify-between border-t border-border pt-6 font-mono text-sm',

// After — use text-xs to match the muted meta tone of the UI-SPEC caption role
'mt-12 flex justify-between border-t border-border pt-6 font-mono text-xs',
```

---

### WR-02: AuthorNote uses `text-sm` for body content

**File:** `packages/artax-ui/src/components/molecules/author-note/author-note.tsx:32`

**Issue:** The body content `<div>` uses `font-mono text-sm`. The UI-SPEC does not include `text-sm` in its 4-size cap. The body of an editorial aside should be `text-base` (body/UI scale per the spec table).

**Fix:**

```tsx
// Before (line 32)
<div className="font-mono text-sm text-secondary-foreground leading-relaxed">

// After
<div className="font-mono text-base text-secondary-foreground leading-relaxed">
```

---

### WR-03: DecisionRationale base class uses `text-sm`

**File:** `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx:24`

**Issue:** The `containerClass` cva string includes `font-mono text-sm text-foreground`. This sets the default text size for the entire card at `text-sm`, which is outside the 4-size cap. Body content should default to `text-base`.

**Fix:**

```tsx
// Before (line 23-26)
const containerClass = cn(
  'my-6 bg-card p-6 border-l-4 border-l-primary font-mono text-sm text-foreground',
  className
)

// After
const containerClass = cn(
  'my-6 bg-card p-6 border-l-4 border-l-primary font-mono text-base text-foreground',
  className
)
```

---

### WR-04: AuthorNote introduces `py-3` (12px) — non-canonical spacing

**File:** `packages/artax-ui/src/components/molecules/author-note/author-note.tsx:20`

**Issue:** The UI-SPEC spacing canonical set is `{4, 8, 16, 24, 32, 48, 64}` px. The review criteria explicitly calls out "no 12px (Tailwind `3`) introduced." `py-3` = 12px is outside the canonical set.

**Fix:** Use `py-2` (8px) for tight inset or `py-4` (16px) for standard card padding:

```tsx
// Before (line 20)
'my-6 border-l-2 border-info bg-[var(--surface-info)] px-4 py-3',

// After — py-4 matches the standard card padding rhythm
'my-6 border-l-2 border-info bg-[var(--surface-info)] px-4 py-4',
```

---

### WR-05: DecisionRationale introduces `mt-3` and `mb-3` (12px) — non-canonical spacing

**File:** `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx:37,58`

**Issue:** Two instances of Tailwind-3 (12px) spacing appear in the new DecisionRationale primitive:
- Line 37: `<div className="mt-3 leading-relaxed">`
- Line 58: `<h3 className="mb-3 text-base font-medium text-foreground">`

Both are outside the canonical spacing set.

**Fix:** Use `mt-4` / `mb-4` (16px) which is the canonical default card rhythm:

```tsx
// Line 37
<div className="mt-4 leading-relaxed">{rationale}</div>

// Line 58
<h3 className="mb-4 text-base font-medium text-foreground">{decision}</h3>
```

---

## Info

### IN-01: `about/page.tsx` contains placeholder TODO copy

**File:** `apps/blakepetersen.io/src/app/about/page.tsx:34,47,61`

**Issue:** Three `[TODO: Blake to ...]` strings are embedded in rendered paragraph tags. These are visible in production output if the page ships as-is. This is editorial content, not a code defect, but it is a gap between the rewrite and a fully polished page.

**Fix:** Replace with real copy before deploying, or render the TODO paragraphs conditionally behind a `process.env.NODE_ENV === 'development'` guard if they are intentionally left as stubs. Given D-07 (light/dark smoke check), confirm whether these TODOs were visible during verification.

---

### IN-02: `mdx/components.tsx` uses pre-spec `text-2xl` and `text-xl` in heading renderers

**File:** `packages/artax-ui/src/mdx/components.tsx:20,32`

**Issue:** The `h1` MDX renderer uses `text-2xl` (line 20) and `h2` uses `text-xl` (line 32). Both are outside the 4-size cap (`text-xs`, `text-base`, `text-lg`, `text-3xl`). These were pre-existing before Phase 26 — the Phase 26 change to this file was only the `AuthorNote`/`DecisionRationale` import reconciliation. This is flagged for awareness; it is a pre-existing defect carried forward, not introduced in Phase 26.

**Fix (separate cleanup pass):** Map h1 to `text-3xl` and h2 to `text-lg` per the UI-SPEC typography table.

---

### IN-03: `collection-pages.test.tsx` mock hardcodes `color: '#10B981'`

**File:** `apps/blakepetersen.io/tests/lib/collection-pages.test.tsx:29`

**Issue:** The `CollectionDefinition` mock includes `color: '#10B981'` (a hardcoded Tailwind emerald value). This is test-only code with no production impact, and the field is not used by any code path under test. Low-priority, but if the `color` field is ever validated or transformed by the factory, a semantic token name would be more robust.

**Fix:** Remove the `color` field from the mock if it is not required by `CollectionDefinition`, or replace with a semantic placeholder string like `'#ignored'` to signal it is not the subject of any assertion.

---

## Cross-Cutting Concerns

### D-05 Editorial-Voice Gate — PASS

Both `author-note.tsx` and `decision-rationale.tsx` source files contain no `/Blake'?s note/i` or `/blakepetersen/i` patterns. The D-05 source-grep guard in `author-note.test.tsx` enforces this at CI time.

### SSR Contract — PASS

`modal.tsx` correctly implements the mounted-flag gate: when `!mounted && trigger`, only the trigger node is returned with no Radix Dialog subtree. The `modal.test.tsx` SSR case confirms `aria-controls="radix-..."` is not present in the SSR output.

Note: when `trigger` is absent (no trigger, controlled-only usage), the Dialog renders on SSR. This is safe because Radix only emits `aria-controls` on the trigger element, which is absent.

### Deleted `page-navigation.tsx` — PASS (no dangling refs)

grep across `apps/blakepetersen.io/src` confirms zero files import from `page-navigation`. The retirement is clean.

### Server-Component Boundaries — PASS

All five `page.tsx` files remain server components (no `'use client'` at page root). `modal.tsx` is correctly marked `'use client'` and is listed in `boundaries.test.ts` client file set. The boundary test includes a walk-and-classify assertion to catch any uncovered files.

### No Hardcoded Color Literals in New Files — PASS

No bare hex literals or Tailwind palette classes (e.g., `text-amber-*`, `bg-zinc-*`) appear in any Phase 26 new or modified source file. The `bg-[var(--surface-info)]` CSS variable reference in `badge.tsx` and `author-note.tsx` is intentional and tokens are defined in `globals.css`.

---

_Reviewed: 2026-04-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
