---
phase: 26-blakepetersen-io-page-updates
plan: 01b
type: execute
wave: 1
depends_on: [01]
autonomous: false
requirements: []
requirements_addressed: []
tags: [artax-ui, primitives, author-note, decision-rationale, mdx, d-05]
files_modified:
  - packages/artax-ui/src/components/molecules/author-note/author-note.tsx
  - packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx
  - packages/artax-ui/src/mdx/components.tsx
  - packages/artax-ui/src/index.ts
  - packages/artax-ui/tests/components/author-note.test.tsx
  - packages/artax-ui/tests/components/decision-rationale.test.tsx
must_haves:
  truths:
    - "AuthorNote molecule is the single source of truth for the author-note visual; packages/artax-ui/src/mdx/components.tsx AuthorNote entry re-exports the molecule (no duplicate implementation)"
    - "DecisionRationale molecule exists with decision/rationale/alternatives/collapsed props"
    - "D-05 editorial-voice gate is resolved via opening checkpoint before any primitive source is committed to artax-ui"
    - "AuthorNote source does NOT contain hardcoded first-person editorial copy (source-grep test guard)"
    - "New primitive source files use semantic tokens only (no literal amber/cyan/emerald/red/zinc-N color classes)"
  artifacts:
    - path: "packages/artax-ui/src/components/molecules/author-note/author-note.tsx"
      provides: "Generic author-byline aside, post-D-05 gate"
      contains: "role=\"note\""
    - path: "packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx"
      provides: "Decision + rationale card with optional alternatives + collapsed variant"
      contains: "// decision"
  key_links:
    - from: "packages/artax-ui/src/mdx/components.tsx"
      to: "packages/artax-ui/src/components/molecules/author-note/author-note.tsx"
      via: "import { AuthorNote as AuthorNoteMolecule }"
      pattern: "from '../components/molecules/author-note/author-note'"
    - from: "packages/artax-ui/src/index.ts"
      to: "packages/artax-ui/src/components/molecules/{author-note,decision-rationale}/*.tsx"
      via: "barrel export appended after Plan 01's exports"
      pattern: "export \\{ AuthorNote|export \\{ DecisionRationale"
---

<objective>
Ship the two editorial primitives — **AuthorNote** (reconciled with existing `mdxComponents.AuthorNote`) and **DecisionRationale** (new). Gate the work behind a D-05 editorial-voice checkpoint that inspects Pencil frames BEFORE any source lands in artax-ui. Wire barrel exports and reconcile `mdxComponents.AuthorNote` to re-export the new molecule (single source of truth per RESEARCH Pitfall 1).

Purpose: Plan 04 (About) and Plan 05 (Start Here) consume these primitives. This plan is infrastructure; it does not claim any SITE-03..07 requirement.

Pre-condition for executor: Pencil desktop app running so `mcp__pencil__batch_get` can extract frame content for the D-05 checkpoint (Task 1).

Split rationale (per checker Warning #1): Plan 01 covers generic-by-construction primitives (Badge, Modal, PrevNextNav) that need no editorial gate. Plan 01b carries the two primitives that require a D-05 judgment call. Splitting puts the checkpoint in the first task of a smaller plan, gives atomic commit boundaries, and keeps context budget healthy (~30% per plan vs ~60% combined).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/26-blakepetersen-io-page-updates/26-CONTEXT.md
@.planning/phases/26-blakepetersen-io-page-updates/26-UI-SPEC.md
@.planning/phases/26-blakepetersen-io-page-updates/26-RESEARCH.md
@.planning/phases/26-blakepetersen-io-page-updates/26-PATTERNS.md
@.planning/phases/26-blakepetersen-io-page-updates/26-VALIDATION.md
@.planning/phases/26-blakepetersen-io-page-updates/26-01-SUMMARY.md

<interfaces>
From packages/artax-ui/src/mdx/components.tsx lines 269-277 (AuthorNote to reconcile):
```typescript
AuthorNote: ({ children, ...props }) => (
  <aside className="my-6 border-l-2 border-info bg-[var(--surface-info)] px-4 py-3" {...props}>
    <p className="mb-2 font-mono text-xs text-info">{'// author_note'}</p>
    <div className="font-sans text-sm text-secondary-foreground leading-relaxed">{children}</div>
  </aside>
)
```

From packages/artax-ui/src/components/molecules/callout/callout.tsx (left-rule structural analog for DecisionRationale):
```typescript
// bg-card border border-border border-l-4 p-4 font-mono text-sm text-foreground
// variant-driven left border color
```
</interfaces>
</context>

<tasks>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 1: D-05 Editorial-Voice Gate — AuthorNote + DecisionRationale Pencil inspection</name>
  <decision>Are the Pencil frames for `AuthorNote` and `DecisionRationale` generic enough to land in `packages/artax-ui` (Blake's stated default per D-04), OR do they contain editorial-voice copy (e.g., hardcoded "Blake's note:", first-person prose, bp.io-specific decision framework vocabulary) that must stay bp.io-local?</decision>
  <context>
    Per CONTEXT D-05, before committing `AuthorNote` and `DecisionRationale` to `packages/artax-ui`, verify their Pencil frames are author/content-model agnostic. If Pencil shows editorial-voice copy baked into the primitive (not a prop slot), pause for Blake's call on placement.

    **Checks the executor runs before this checkpoint (record findings in commit message / SUMMARY.md):**
    1. `mcp__pencil__get_editor_state` to confirm Pencil app is running with `bp.io.pen` active.
    2. `mcp__pencil__batch_get({ patterns: ['AuthorNote', 'DecisionRationale'] })` to extract primitive frame content.
    3. Grep `mdxComponents.AuthorNote` code consumers across the monorepo (Assumption A4 from RESEARCH.md — confirm nothing outside `mdx/components.tsx` imports it directly).

    **Pre-resolved facts (do NOT re-check):**
    - Content-tree grep (`<AuthorNote` / `<DecisionRationale` in `apps/blakepetersen.io/content/`) returned **zero matches** per RESEARCH Open Q #2 RESOLVED. No existing MDX files use these primitives inline. The reconciliation in Task 3 is still required (it eliminates the name collision described in Pitfall 1) but its current active-render surface is only the primitives themselves, not any in-tree content.

    **Findings to present to Blake:**
    - Pencil `AuthorNote` frame: body text content (screenshot or `batch_get` excerpt)
    - Pencil `DecisionRationale` frame: body text content
    - Any direct code consumers of `mdxComponents.AuthorNote` outside the MDX pipeline
  </context>
  <options>
    <option id="option-a">
      <name>Generic — land both primitives in artax-ui (default per D-04)</name>
      <pros>Honors D-04; enables cross-consumer reuse; MDX map continues to work via re-export.</pros>
      <cons>None if Pencil is genuinely generic.</cons>
    </option>
    <option id="option-b">
      <name>AuthorNote generic (artax-ui); DecisionRationale bp.io-local</name>
      <pros>Extracts the clearly-generic one; keeps the editorial one close to content.</pros>
      <cons>Plan 01b changes: DecisionRationale moves to `apps/blakepetersen.io/src/components/decision-rationale.tsx`; Plan 05 imports change path.</cons>
    </option>
    <option id="option-c">
      <name>Both bp.io-local</name>
      <pros>Keeps editorial voice scoped.</pros>
      <cons>Violates D-04 default; requires explicit Blake approval.</cons>
    </option>
    <option id="option-d">
      <name>Rename both to generic wrappers (e.g., `Callout.Author`, `Callout.Decision`) and keep editorial concrete names in bp.io</name>
      <pros>Primitive is crystal-generic; editorial name lives at call site.</pros>
      <cons>Bigger refactor — touches existing mdxComponents.AuthorNote re-export path.</cons>
    </option>
  </options>
  <resume-signal>Select: option-a, option-b, option-c, or option-d</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Build AuthorNote + DecisionRationale molecules with tests (per Task 1 outcome)</name>
  <files>packages/artax-ui/src/components/molecules/author-note/author-note.tsx, packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx, packages/artax-ui/tests/components/author-note.test.tsx, packages/artax-ui/tests/components/decision-rationale.test.tsx</files>
  <read_first>
    - packages/artax-ui/src/mdx/components.tsx lines 269-277 — existing `AuthorNote` impl (style reference for reconciliation)
    - packages/artax-ui/src/components/molecules/callout/callout.tsx (full — 36 lines) — left-rule + variant structure analog for DecisionRationale
    - packages/artax-ui/tests/components/callout.test.tsx (full — 74 lines) — molecule test pattern
    - .planning/phases/26-blakepetersen-io-page-updates/26-PATTERNS.md §"AuthorNote" and §"DecisionRationale" — prop surfaces
    - .planning/phases/26-blakepetersen-io-page-updates/26-UI-SPEC.md §"AuthorNote (molecule)" and §"DecisionRationale (molecule)"
    - Task 1 decision — if option-b/c/d selected, ADJUST file paths accordingly
  </read_first>
  <action>
    **Branch on Task 1 outcome:**
    - If **option-a** (default): create both files in `packages/artax-ui/src/components/molecules/`.
    - If **option-b**: AuthorNote in artax-ui; DecisionRationale at `apps/blakepetersen.io/src/components/decision-rationale.tsx` (no artax-ui barrel entry for it in Task 4; Plan 05 imports from the bp.io-local path).
    - If **option-c**: both at `apps/blakepetersen.io/src/components/`; skip Task 4 exports for both; skip Task 3 mdx reconciliation (existing inline impl stays).
    - If **option-d**: add `Callout.Author` and `Callout.Decision` compound slots on the existing Callout molecule at `packages/artax-ui/src/components/molecules/callout/callout.tsx`; tests live alongside Callout tests.

    **Default path (option-a):**

    1. Create `packages/artax-ui/src/components/molecules/author-note/author-note.tsx`:

    ```tsx
    // ABOUTME: AuthorNote — generic editorial aside with optional byline + date header.
    // ABOUTME: Single source of truth; mdxComponents.AuthorNote re-exports from here.
    import type { ReactNode } from 'react'
    import { cn } from '../../../lib/utils'

    type AuthorNoteProps = {
      author?: { name: string; avatar?: string; href?: string }
      date?: string
      children: ReactNode
      className?: string
    }

    export function AuthorNote({ author, date, children, className }: AuthorNoteProps) {
      return (
        <aside
          role="note"
          aria-label="Author's note"
          className={cn(
            'my-6 border-l-2 border-info bg-[var(--surface-info)] px-4 py-3',
            className
          )}
        >
          <p className="mb-2 font-mono text-xs text-info">{'// author_note'}</p>
          {(author || date) && (
            <p className="mb-2 font-mono text-xs text-muted-foreground">
              {author?.name}
              {author && date && ' · '}
              {date}
            </p>
          )}
          <div className="font-mono text-sm text-secondary-foreground leading-relaxed">{children}</div>
        </aside>
      )
    }
    ```

    Notes: Preserved existing `border-l-info` + `bg-[var(--surface-info)]` + `// author_note` caption from the existing MDX impl to minimize visual regression. UI-SPEC asks for `border-l-primary` — escalate via commit message if Pencil-batch_get showed amber; otherwise keep `border-l-info` (matches existing aesthetic; Phase 25 audit canonical). Body font changed from `font-sans` → `font-mono` per UI-SPEC "body copy is monospace" (terminal aesthetic, line 62).

    2. Create `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx`:

    ```tsx
    // ABOUTME: DecisionRationale — decision card with rationale body + optional alternatives list.
    // ABOUTME: Collapsed variant uses <details>/<summary>; otherwise renders as plain <section>.
    import type { ReactNode } from 'react'
    import { cn } from '../../../lib/utils'

    type Alternative = { name: string; reason: string }

    type DecisionRationaleProps = {
      decision: string
      rationale: ReactNode
      alternatives?: Alternative[]
      collapsed?: boolean
      className?: string
    }

    export function DecisionRationale({
      decision, rationale, alternatives, collapsed, className,
    }: DecisionRationaleProps) {
      const containerClass = cn(
        'my-6 bg-card p-6 border-l-4 border-primary font-mono text-sm text-foreground',
        className
      )
      const body = (
        <>
          <p className="mb-2 font-mono text-xs text-muted-foreground">{'// decision'}</p>
          <h3 className="mb-3 text-base font-medium text-foreground">{decision}</h3>
          <div className="leading-relaxed">{rationale}</div>
          {alternatives && alternatives.length > 0 && (
            <ul className="mt-4 space-y-1">
              {alternatives.map((alt) => (
                <li key={alt.name} className="text-muted-foreground">
                  <span className="text-foreground">{alt.name}</span>{': '}{alt.reason}
                </li>
              ))}
            </ul>
          )}
        </>
      )
      if (collapsed) {
        return (
          <details className={containerClass}>
            <summary className="cursor-pointer text-base font-medium text-foreground">{decision}</summary>
            <div className="mt-3">{rationale}</div>
          </details>
        )
      }
      return <section className={containerClass}>{body}</section>
    }
    ```

    3. Create `packages/artax-ui/tests/components/author-note.test.tsx` covering:
       - Renders `<aside role="note" aria-label="Author's note">` wrapper (query by role).
       - Renders `// author_note` caption.
       - Renders children body content.
       - Renders byline when `author` prop provided.
       - **D-05 source grep:** read the source file via `fs.readFileSync` inside the test and assert the source string does NOT match `/Blake'?s note/i` (ensures no hardcoded editorial copy).

    4. Create `packages/artax-ui/tests/components/decision-rationale.test.tsx` covering:
       - Renders `// decision` caption.
       - Renders `decision` headline.
       - Renders `alternatives` list when provided (list item count matches input length).
       - When `collapsed={true}`: output contains `<details>` + `<summary>` (use `container.querySelector`).
       - When `collapsed` omitted/false: output is a `<section>` (no `<details>`).
  </action>
  <verify>
    <automated>pnpm --filter artax-ui test -- --watchAll=false --testPathPattern='(author-note|decision-rationale)'</automated>
  </verify>
  <acceptance_criteria>
    - `packages/artax-ui/src/components/molecules/author-note/author-note.tsx` contains `role="note"` AND `aria-label="Author's note"` (unless Task 1 = option-c, in which case the file lives at `apps/blakepetersen.io/src/components/author-note.tsx`)
    - `packages/artax-ui/src/components/molecules/author-note/author-note.tsx` contains `// author_note`
    - `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` contains `// decision` AND `border-l-primary` (unless Task 1 = option-b/c, in which case file lives at bp.io-local path)
    - `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` contains both a `<details>` path (when collapsed) AND a `<section>` path
    - `packages/artax-ui/tests/components/author-note.test.tsx` contains a source-grep assertion for `/Blake'?s note/i` NOT matching
    - `grep -E 'bg-(amber|cyan|emerald|red|zinc)-[0-9]' packages/artax-ui/src/components/molecules/author-note/author-note.tsx packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` returns empty (paths adjust per Task 1 outcome)
    - `pnpm --filter artax-ui test -- --watchAll=false --testPathPattern='(author-note|decision-rationale)'` exits 0
  </acceptance_criteria>
  <done>AuthorNote + DecisionRationale shipped per Task 1 outcome; tests green including D-05 source-grep guard.</done>
</task>

<task type="auto">
  <name>Task 3: Reconcile mdxComponents.AuthorNote + barrel exports + full suite green</name>
  <files>packages/artax-ui/src/mdx/components.tsx, packages/artax-ui/src/index.ts</files>
  <read_first>
    - packages/artax-ui/src/mdx/components.tsx (full — 279 lines) — especially the `mdxComponents` export shape around lines 269-277
    - packages/artax-ui/src/index.ts (full — 92 lines) — current exports; Plan 01 added Modal + PrevNextNav; this task adds AuthorNote + DecisionRationale (option-a default)
    - .planning/phases/26-blakepetersen-io-page-updates/26-PATTERNS.md §"packages/artax-ui/src/mdx/components.tsx" — reconciliation pattern
    - Task 1 outcome — if option-c, SKIP the mdx reconciliation and barrel exports
  </read_first>
  <action>
    **Step 1 — Reconcile `packages/artax-ui/src/mdx/components.tsx`** (option-a / option-b):

    Add the import(s) near the top of the file:
    ```tsx
    import { AuthorNote as AuthorNoteMolecule } from '../components/molecules/author-note/author-note'
    // Option-a only:
    import { DecisionRationale as DecisionRationaleMolecule } from '../components/molecules/decision-rationale/decision-rationale'
    ```

    In the `mdxComponents` object, REPLACE the existing inline `AuthorNote` definition (lines 269-277) with:
    ```tsx
    AuthorNote: AuthorNoteMolecule,
    ```

    Option-a only — also add:
    ```tsx
    DecisionRationale: DecisionRationaleMolecule,
    ```

    This collapses the name-collision per RESEARCH Pitfall 1 — the molecule becomes the single source of truth; MDX and code consumers share one implementation.

    If Task 1 = option-c: SKIP this step. The existing inline `mdxComponents.AuthorNote` stays.

    If Task 1 = option-d: replace the inline AuthorNote with a reference to the new `Callout.Author` slot; skip the DecisionRationale entry.

    **Step 2 — Barrel exports in `packages/artax-ui/src/index.ts`** (option-a default):

    Append to the Molecules section (after Plan 01's `PrevNextNav` line, preserving the `// Molecules` marker):
    ```ts
    export { AuthorNote } from './components/molecules/author-note/author-note'
    export { DecisionRationale } from './components/molecules/decision-rationale/decision-rationale'
    ```

    Option-b: only `AuthorNote` export; skip DecisionRationale (it lives at the bp.io path).
    Option-c: skip both exports.
    Option-d: replace with a re-export that surfaces the Callout compound slots per Task 2.

    **Step 3 — Full suite verification:**

    Run the full artax-ui test suite to ensure no regressions:
    `pnpm --filter artax-ui test -- --watchAll=false` must exit 0.
    Also run `pnpm --filter artax-ui typecheck` to ensure no type errors.
  </action>
  <verify>
    <automated>pnpm --filter artax-ui test -- --watchAll=false && pnpm --filter artax-ui typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `packages/artax-ui/src/mdx/components.tsx` contains `AuthorNote: AuthorNoteMolecule` (re-export, not inline JSX) — unless Task 1 = option-c/d
    - `packages/artax-ui/src/mdx/components.tsx` contains `from '../components/molecules/author-note/author-note'` — unless Task 1 = option-c/d
    - `packages/artax-ui/src/index.ts` contains `export { AuthorNote }` from the molecule path — unless Task 1 = option-c
    - `packages/artax-ui/src/index.ts` contains `export { DecisionRationale }` — unless Task 1 = option-b/c/d
    - `packages/artax-ui/src/index.ts` preserves the `// Atoms`, `// Molecules`, `// Organisms` comment markers
    - `packages/artax-ui/src/index.ts` still contains Plan 01's `export { Modal }` and `export { PrevNextNav }` lines (not accidentally removed)
    - `pnpm --filter artax-ui test -- --watchAll=false` exits 0 (FULL suite)
    - `pnpm --filter artax-ui typecheck` exits 0
  </acceptance_criteria>
  <done>mdxComponents.AuthorNote re-exports the molecule per Task 1 outcome; barrel adds AuthorNote + DecisionRationale (option-a); full test suite green; typecheck clean. Plans 04/05 can `import { AuthorNote, DecisionRationale } from 'artax-ui'` (or bp.io-local per option-b/c).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| MDX (compiled)→render (AuthorNote, DecisionRationale via mdxComponents) | Content is authored in-repo, compiled by Velite at build time — no runtime user-submitted MDX enters this pipeline (VERIFIED in Phase 26 RESEARCH §Security Domain). |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-26-01b-01 | Tampering (MDX injection) | AuthorNote, DecisionRationale as MDX components | accept | Content is in-repo + Velite-compiled at build. No runtime user-submitted MDX surface per RESEARCH §Security Domain. No mitigation required. |
| T-26-01b-02 | Tampering (XSS via raw-HTML React API) | Both new primitives | mitigate | Both render via JSX children only. No use of React's unsafe-inner-HTML prop. Banned per RESEARCH §Security Domain. |
| T-26-01b-03 | Tampering (D-05 gate bypass) | AuthorNote source | mitigate | Task 2 test contains source-grep assertion `/Blake'?s note/i` must not match. CI enforces the gate. |
| T-26-01b-04 | Information Disclosure (secrets in bundle) | New primitives | accept | No `process.env.*` reads introduced. |
</threat_model>

<verification>
1. Task 1 checkpoint resolved before any source lands.
2. `pnpm --filter artax-ui test -- --watchAll=false` exits 0 (all primitive tests including new ones + pre-existing + Plan 01's).
3. `pnpm --filter artax-ui typecheck` exits 0.
4. `grep -rE 'bg-(amber|cyan|emerald|red|zinc)-[0-9]+'` in new primitive paths returns empty.
5. mdx/components.tsx re-exports `AuthorNote` from the new molecule (no duplicate inline impl) — per Task 1 outcome.
6. artax-ui barrel cumulatively exports Modal, PrevNextNav (Plan 01) + AuthorNote, DecisionRationale (Plan 01b, per Task 1 outcome).
7. Source-grep D-05 guard in author-note.test.tsx passes.
</verification>

<success_criteria>
- D-05 editorial-voice gate resolved via Task 1 checkpoint
- 2 new primitive source files + 2 new test files (paths per Task 1 outcome)
- mdx/components.tsx AuthorNote re-exports the molecule (Pitfall 1 collision fixed)
- Barrel exports AuthorNote + DecisionRationale (option-a default)
- All tests + typecheck green
- No color-literal regressions
</success_criteria>

<output>
After completion, create `.planning/phases/26-blakepetersen-io-page-updates/26-01b-SUMMARY.md` documenting:
- Which Task 1 option Blake selected and why
- Pencil `batch_get` findings for AuthorNote + DecisionRationale frames (border color, editorial copy presence)
- Any AuthorNote direct-consumer grep findings (Assumption A4 confirmation)
- Handoff notes for Plans 04 (About) and 05 (Start Here) — final import paths
</output>
