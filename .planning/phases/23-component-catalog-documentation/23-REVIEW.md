---
phase: 23-component-catalog-documentation
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - apps/artax/src/app/components/page.tsx
  - apps/artax/src/app/getting-started/page.tsx
  - apps/artax/src/lib/component-registry.ts
  - apps/artax/tests/component-registry.test.ts
  - apps/artax/tests/component-routes.test.ts
findings:
  critical: 0
  warning: 1
  info: 3
  total: 4
status: needs-fix
---

# Phase 23: Code Review Report

**Reviewed:** 2026-04-17T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** needs-fix

## Summary

Five files were reviewed covering the component catalog overview page, getting-started page, the 15-component registry, and both test suites. The architecture is clean: server components are correctly unmarked, Next.js 15 async `params` are awaited throughout, `generateStaticParams` correctly delegates to `getAllComponents()` (exactly 15 entries), and no XSS or SSR-unsafe patterns were found. One warning requires a fix before merge: the `Table` entry's `imports` documentation string advertises `TableCaption` as a named export, but that symbol is never imported or verified in the registry — if the package does not export it, consumers who copy the snippet verbatim will get a runtime import error.

---

## Warnings

### WR-01: `TableCaption` in Table imports string is unverified and likely incorrect

**File:** `apps/artax/src/lib/component-registry.ts:445`
**Issue:** The `imports` field for the `Table` component reads:
```
"import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from 'artax-ui'"
```
`TableCaption` is not imported anywhere in `component-registry.ts` (lines 17–50) and is not used in the preview factory. If `artax-ui` does not export `TableCaption`, any consumer who copies this snippet will receive a runtime module error. Even if the export exists, the documentation claim is not validated by any test.

**Fix:**
1. Either add `TableCaption` to the registry's own import block and use it in the Table preview, or
2. Remove `TableCaption` from the `imports` documentation string if it is not a real export.

To guard against future drift, add an assertion in `component-registry.test.ts`:
```ts
it('Table imports string matches symbols verified in the registry', () => {
  const table = getComponent('molecules', 'table')
  // Adjust to whatever symbols are confirmed exported from artax-ui
  expect(table?.imports).not.toContain('TableCaption')
})
```

---

## Info

### IN-01: Heading visual style may obscure semantic heading role

**File:** `apps/artax/src/app/components/page.tsx:38-40`
**File:** `apps/artax/src/app/getting-started/page.tsx:65-67`
**Issue:** Section headings are rendered as `<h2>` elements but styled with `font-mono text-xs text-muted-foreground`. The tiny muted monospace style is intentional for the terminal aesthetic, but it means the visual hierarchy gives no cue that these are document headings. Sighted users relying on visual scanning may not identify them as navigable landmarks; screen reader users will hear them as headings, which is correct but inconsistent with the visual presentation.

**Fix:** No code change is required if the design intent is explicit. Consider adding an `aria-label` or a visually-hidden complement if heading navigation is important for end-users. This is a design decision, not a bug.

---

### IN-02: `CodeBlock` rawCode/children sync is manual and untested

**File:** `apps/artax/src/app/getting-started/page.tsx:72-80, 94-116, 129-137, 153-161`
**Issue:** Every `CodeBlock` in this file passes `rawCode={constant}` and separately renders `<pre><code>{constant}</code></pre>` as children using the same constant. The API requires both to stay in sync manually. If a future edit updates the visible code but forgets to update `rawCode` (or vice versa), the copy button will silently copy stale text.

**Fix:** This is inherent to the `CodeBlock` API. Document the invariant in a comment at each usage site, or (if the `CodeBlock` component permits it) render children programmatically from `rawCode` so there is a single source of truth. No immediate action required.

---

### IN-03: `notFound()` path is not covered by any test

**File:** `apps/artax/tests/component-routes.test.ts`
**Issue:** `component-routes.test.ts` exercises `generateStaticParams` thoroughly but does not test the `ComponentPage` default export's `notFound()` branch. If `getComponent` returns `undefined` for an unregistered slug, the page should call `notFound()`. This path is not validated, so a regression in `getComponent` would be invisible.

**Fix:** Add an integration or unit test that calls the page with a slug absent from the registry and asserts the `notFound` behavior. Because `notFound()` throws in Next.js, the pattern in tests is:
```ts
import { notFound } from 'next/navigation'
vi.mock('next/navigation', () => ({ notFound: vi.fn() }))

it('calls notFound for unregistered slug', async () => {
  await ComponentPage({ params: Promise.resolve({ tier: 'atoms', component: 'does-not-exist' }) })
  expect(notFound).toHaveBeenCalled()
})
```

---

_Reviewed: 2026-04-17T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
