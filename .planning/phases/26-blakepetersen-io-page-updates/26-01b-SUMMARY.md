---
phase: 26
plan: 01b
subsystem: artax-ui
tags: [artax-ui, primitives, author-note, decision-rationale, mdx, d-05]
requires:
  - packages/artax-ui/src/components/molecules/callout/callout.tsx
  - packages/artax-ui/src/lib/utils.ts
provides:
  - artax-ui::AuthorNote (generic editorial aside, role="note", optional author/date byline)
  - artax-ui::DecisionRationale (decision card, alternatives, collapsed <details> variant)
affects:
  - packages/artax-ui/src/mdx/components.tsx (AuthorNote now re-exports molecule; adds DecisionRationale entry)
  - packages/artax-ui/src/index.ts (barrel exports AuthorNote + DecisionRationale + prop types)
  - packages/artax-ui/tests/boundaries.test.ts (registers both as server-safe)
tech-stack:
  added: []
  patterns:
    - "Molecule-first reconciliation: mdxComponents.AuthorNote becomes a re-export of the molecule to eliminate the Pitfall 1 name collision."
    - "D-05 editorial-voice gate enforced in CI via source-grep assertion in author-note.test.tsx (ensures no hardcoded first-person copy)."
    - "DecisionRationale collapsed variant uses native <details>/<summary> — no JS, SSR-safe."
key-files:
  created:
    - packages/artax-ui/src/components/molecules/author-note/author-note.tsx
    - packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx
    - packages/artax-ui/tests/components/author-note.test.tsx
    - packages/artax-ui/tests/components/decision-rationale.test.tsx
  modified:
    - packages/artax-ui/src/mdx/components.tsx
    - packages/artax-ui/src/index.ts
    - packages/artax-ui/tests/boundaries.test.ts
decisions:
  - "D-05 resolved via orchestrator pre-authorization (option-a, both primitives generic): existing mdxComponents.AuthorNote uses the generic '// author_note' caption + passthrough children — no first-person or bp.io-specific copy baked in. Content-tree grep is zero-match (RESEARCH Q2 RESOLVED). Pencil MCP unavailable at execute-time; proceeded per D-05 pre-authorized path."
  - "Body font for AuthorNote changed from font-sans to font-mono per UI-SPEC terminal-aesthetic body copy rule; caption + border palette preserved from existing impl to minimize visual regression."
  - "border-l-4 + border-l-primary (color) pattern used on DecisionRationale to satisfy the plan's explicit 'border-l-primary' class-literal check AND the 4px width spec."
metrics:
  duration: "~3 minutes"
  completed: "2026-04-19T20:13:00Z"
  tasks: 3
  files_changed: 7
  tests_added: 15 (7 AuthorNote + 8 DecisionRationale)
  tests_total_artax_ui: 314 (was 293)
---

# Phase 26 Plan 01b: Editorial Primitives (AuthorNote, DecisionRationale) Summary

Shipped the two editorial primitives that were deferred from Plan 01 pending the D-05 editorial-voice judgment: **AuthorNote** (reconciled so `mdxComponents.AuthorNote` now re-exports the molecule — Pitfall 1 collision eliminated) and **DecisionRationale** (new, with optional `alternatives` list and a collapsed `<details>` variant). Both land in `packages/artax-ui` per D-04 default. D-05 gate enforced via a source-grep test assertion that fails the build if hardcoded first-person editorial copy is reintroduced.

## Tasks Executed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | D-05 editorial-voice gate (orchestrator-resolved; option-a selected) | (no commit — decision logged below) | — |
| 2 | Build AuthorNote + DecisionRationale molecules with tests | `1de7906` | author-note.tsx, decision-rationale.tsx, author-note.test.tsx, decision-rationale.test.tsx |
| 3 | Reconcile mdxComponents + barrel exports + boundaries | `248f10f` | mdx/components.tsx, index.ts, boundaries.test.ts |

## D-05 Verdict (Task 1)

**Selected:** `option-a` — both primitives generic → artax-ui.

**Basis for verdict** (Pencil MCP was unavailable; decision grounded in source inspection + orchestrator pre-authorization):

1. **Existing `mdxComponents.AuthorNote` (`packages/artax-ui/src/mdx/components.tsx:269-277`, pre-reconciliation):** Uses `// author_note` caption (generic motif, not first-person), children passthrough (no baked-in copy), `border-l-info` accent. **No references to "Blake", "blakepetersen", or any first-person prose inside the component body.** Generic by construction.

2. **Callout structural analog (`callout.tsx`, DecisionRationale's pattern reference):** `bg-card border border-border border-l-4 font-mono` with variant-driven left border color. **Zero editorial-voice framing.** Generic by construction.

3. **Content-tree usage check (RESEARCH Q2, pre-resolved):** `grep '<AuthorNote' apps/blakepetersen.io/content/` → **zero matches**. Neither primitive is referenced from in-tree MDX. No live content contract to preserve.

4. **Assumption A4 (direct code consumers outside the MDX pipeline):** Confirmed via fresh grep during Task 3 — only hit is the new molecule source file itself. No external consumers import `mdxComponents.AuthorNote` directly.

**Outcome:** Both primitives land in `packages/artax-ui/src/components/molecules/` with unprefixed `AuthorNote` / `DecisionRationale` names. Editorial voice is delivered by consumer-passed children, never by the primitives themselves.

## Verification Outcomes

- `npx jest --watchAll=false` in `packages/artax-ui`: **314/314 passing** (27 suites, 0 failures). Up from Plan 01's 293 → +21 cases (15 new molecule tests + 6 new boundaries `it.each` cases from the two registrations).
- AuthorNote suite: 7 cases — role + aria-label, `// author_note` caption, children, byline combined, date alone, custom className, **D-05 source-grep guard** (asserts source does NOT match `/Blake'?s note/i` OR `/blakepetersen/i`).
- DecisionRationale suite: 8 cases — `// decision` caption, headline, rationale body, alternatives list count, `<section>` default, `<details>`/`<summary>` collapsed path, `border-l-primary` accent, custom className.
- Boundary suite: both molecules registered as server-safe; `every component file is covered by boundary tests` passes (no unregistered `.tsx` files).
- `grep -rE 'bg-(amber|cyan|emerald|red|zinc)-[0-9]+'` across the 2 new primitive sources: **empty**. Semantic tokens only.
- `tsc --noEmit` against `packages/artax-ui`: **0 errors** (tsconfig excludes `tests/`; Plan 01 deferred token-usage pre-existing errors unchanged, not re-surfaced here).
- `grep '// decision' packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx`: present (both render paths).
- `grep 'border-l-primary' packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx`: present (single containerClass shared by both paths).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DecisionRationale color class didn't match acceptance-criteria literal**
- **Found during:** Task 2 (running targeted tests)
- **Issue:** Initial implementation used `border-l-4 border-primary` (width + generic border color). Plan acceptance criterion explicitly required the literal string `border-l-primary`. The `border-primary` form sets all four border colors and would collide at the visual edge anyway.
- **Fix:** Switched to `border-l-4 border-l-primary` — width via `border-l-4`, left-edge color via `border-l-primary`. Matches Callout's structural pattern and satisfies the acceptance-criteria grep.
- **Files modified:** `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx`
- **Commit:** `1de7906` (fix squashed into the initial Task 2 commit before staging — no separate commit)

### Pre-authorized fallback

**Pencil MCP unavailable at execute-time.** The plan's Task 1 prescribed `mcp__pencil__batch_get({ patterns: ['AuthorNote', 'DecisionRationale'] })` to extract Pencil frame content. Pencil desktop was not running. Per orchestrator's pre-authorized D-05 path (spelled out in the execution-context block), the verdict was derived from:
- Inspection of the existing `mdxComponents.AuthorNote` source (lines 269-277).
- Inspection of the Callout molecule as the DecisionRationale structural analog.
- Pre-resolved RESEARCH Q2 (zero matches in content tree).

No Pencil frame screenshots attached — frame-to-source parity deferred to a future Pencil-online pass if Blake wants visual confirmation.

### Additive scope

**Boundary test registration.** The plan did not explicitly enumerate the `boundaries.test.ts` update in Task 3's file list, but Plan 01's handoff note flagged this as a required downstream step. Registered both new molecules under `serverSafeFiles`. This is a Rule 2 auto-add — without it, the `every component file is covered by boundary tests` case would fail. Plan 01 followed the same pattern.

## Threat Model Mitigations Applied

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-26-01b-01 | Accept (static MDX pipeline) | No runtime MDX surface introduced; Velite-compile-time only. |
| T-26-01b-02 | No raw-HTML prop usage | Both components render via JSX children only; `grep dangerouslyInnerHTML` in both sources: empty. |
| T-26-01b-03 | D-05 source-grep CI guard | `author-note.test.tsx` "source file contains no hardcoded editorial first-person voice" case passes. Would fail CI if `Blake's note` or `blakepetersen` ever appear in the source. |
| T-26-01b-04 | No `process.env` reads introduced | `grep process.env` across both new sources: empty. |

## Handoff Notes

**For Plans 04 (About) and 05 (Start Here):**
- Import pattern: `import { AuthorNote, DecisionRationale } from 'artax-ui'`.
- `AuthorNote` prop surface: `{ author?: { name, avatar?, href? }, date?, children, className? }`. Role/aria fixed (`role="note"`, `aria-label="Author's note"`).
- `DecisionRationale` prop surface: `{ decision: string, rationale: ReactNode, alternatives?: { name, reason }[], collapsed?: boolean, className? }`. Collapsed mode is SSR-safe (native `<details>`, no JS).
- MDX consumers: the existing mdx provider spread (`<MDXProvider components={mdxComponents}>`) now routes both tags to the molecules transparently — no changes needed in `apps/blakepetersen.io`.

**For any follow-up MDX author using `<AuthorNote>` inline:**
- The tag now accepts typed props; raw HTML spreads that previously relied on `...props` being forwarded to the `<aside>` (e.g., `<AuthorNote data-x="y">`) will still work because `className` is explicit but unknown attributes are ignored rather than forwarded. If a consumer needs attribute pass-through, raise it in a follow-up — the primitive can grow an `HTMLAttributes<HTMLElement>` spread.

## Self-Check: PASSED

- [x] `packages/artax-ui/src/components/molecules/author-note/author-note.tsx` — FOUND
- [x] `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` — FOUND
- [x] `packages/artax-ui/tests/components/author-note.test.tsx` — FOUND (7 cases incl. D-05 guard)
- [x] `packages/artax-ui/tests/components/decision-rationale.test.tsx` — FOUND (8 cases)
- [x] `packages/artax-ui/src/mdx/components.tsx` — MODIFIED (AuthorNote + DecisionRationale = molecule re-exports; no inline JSX duplicate)
- [x] `packages/artax-ui/src/index.ts` — MODIFIED (AuthorNote + DecisionRationale + prop types exported; Modal + PrevNextNav exports preserved)
- [x] `packages/artax-ui/tests/boundaries.test.ts` — MODIFIED (both new molecules registered server-safe)
- [x] Commit `1de7906` — FOUND (Task 2: molecules + tests)
- [x] Commit `248f10f` — FOUND (Task 3: reconcile + barrel + boundaries)
