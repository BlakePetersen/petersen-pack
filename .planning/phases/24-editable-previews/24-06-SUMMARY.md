---
phase: 24-editable-previews
plan: 6
subsystem: ui
tags: [react-live, jsx-editor, prism-theme, scope-enumeration, spike-gated, react-19]

# Dependency graph
requires:
  - phase: 24-editable-previews
    provides: "react-live@^4.1.8 installed + React 19 compat VERDICT: PASS (24-01)"
  - phase: 24-editable-previews
    provides: "ComponentPlayground base with props-form + URL state (24-05)"
  - phase: 24-editable-previews
    provides: "ComponentDef.playground?.enabled opt-in (24-03), codeExamples[0] seed source (23-02)"
provides:
  - PlaygroundJsxEditor — react-live wrapper (LiveProvider + LivePreview + LiveError + LiveEditor)
  - artaxTerminalTheme — PrismTheme mapping artax tokens to prism-react-renderer syntax classes
  - Edit JSX toggle on ComponentPlayground with conditional editor mount and reset-via-remount
affects: [24-07]

# Tech tracking
tech-stack:
  added:
    - "react-live 4.1.8 (first production use — spike installed it; this plan integrates it)"
    - "prism-react-renderer 2.4.1 (transitive via react-live; PrismTheme type imported directly)"
  patterns:
    - "Named-scope enumeration: jsxEditorScope is a hand-curated Record<string, unknown> of 22 artax-ui exports + React (NOT `...artaxUI` spread) per 24-01-SPIKE-RESULT.md Open Question 2"
    - "Reset-via-key-remount: onReset bumps a resetCounter useState; PlaygroundJsxEditor's `key={resetCounter}` forces a fresh mount so LiveEditor's contenteditable buffer picks up the seed again"
    - "Mocked react-live in jsdom tests per RESEARCH.md Pitfall 5 — LiveProvider stub captures `code` as `data-code` attribute so assertions can read the seed value without running Sucrase"
    - "'use client' required on any file importing react-live (internals use hooks); already satisfied by existing component-page-client 'use client' boundary"

key-files:
  created:
    - apps/artax/src/components/playground-jsx-editor.tsx
    - apps/artax/src/lib/playground-theme.ts
    - apps/artax/tests/playground-jsx-editor.test.tsx
  modified:
    - apps/artax/src/components/component-playground.tsx
    - apps/artax/tests/component-playground.test.tsx

key-decisions:
  - "Scope strategy: enumerate named exports (22 names + React), NOT `...artaxUI` spread — preserves tree-shaking and prevents future artax-ui exports from auto-leaking into the sandbox. Matches 24-01 spike Open Question 2 recommendation."
  - "React 19 JSX-transform warning: tolerated (not suppressed). No `transformCode` wired to silence it — a silent warning is worse than a visible one, and upstream react-live PR #406 will eventually modernize the Sucrase transform. Absent from production build output per 24-01 spike."
  - "Reset path: `key={resetCounter}` on PlaygroundJsxEditor + incrementing counter in onReset. Plan's Task 4 anticipated this fallback because LiveEditor owns its contenteditable buffer and does not respect seed-prop changes after mount."
  - "Theme: dropped fontFamily/fontSize from `plain` — PrismThemeEntry (prism-react-renderer 2.4.1) does not accept them. Font is applied via `font-mono text-sm` Tailwind classes on the editor wrapper instead; visual result is the same."
  - "JSX state is ephemeral: `showJsx` + `resetCounter` useState only. URL never mutated by JSX interactions (D-04 hard constraint). Verified by test 'does NOT trigger pushPlaygroundParams when the JSX toggle is flipped'."

patterns-established:
  - "Scope-by-enumeration: every future react-live mount site should hand-curate its scope from named imports rather than spreading a barrel, so new barrel exports don't auto-leak into sandboxes."
  - "Mock-react-live-and-capture-seed-as-data-attr: the mocked LiveProvider stub renders `data-code={code}` so tests assert the seed without running Sucrase. Reusable for any future react-live consumer."
  - "Key-remount for external-state reset: when a child component owns uncontrolled state (contenteditable, file input, etc.), a parent-owned counter used as `key` is the idiomatic reset path."

requirements-completed: [ARTAX-08]

# Metrics
duration: ~4min
completed: 2026-04-19
---

# Phase 24 Plan 6: JSX Editor Integration Summary

**react-live JSX editor layered over the ComponentPlayground props-form — Edit JSX toggle reveals a LiveProvider/LivePreview/LiveEditor shell with artaxTerminalTheme syntax colors, 22 named artax-ui exports in scope, and key-remount reset.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-19T04:44:46Z
- **Completed:** 2026-04-19T04:48:49Z
- **Tasks:** 4 (1 checkpoint verify, 1 auto theme, 1 TDD editor component, 1 auto integration)
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments

- Playground tab now offers both surfaces: props-form (default, URL-shareable) + JSX editor (toggled, ephemeral) — ARTAX-08 fully satisfied.
- `artaxTerminalTheme` PrismTheme ships as a standalone module; reusable for any future react-live mount site.
- `PlaygroundJsxEditor` wraps LiveProvider/LivePreview/LiveError/LiveEditor in a CodeBlock-style chrome with the terminal aesthetic (`bg-card border border-border font-mono text-sm`, `// jsx editor` label, `// reset to example` button).
- `ComponentPlayground` gains a Toggle + conditional editor mount beneath the props form. JSX edits are ephemeral (no URL mutation); reset is a key-remount that reseeds from `codeExamples[0].code`.
- jsdom test coverage mocks react-live per RESEARCH.md Pitfall 5 — 5 new tests on `PlaygroundJsxEditor` + 5 new tests on `ComponentPlayground` JSX-toggle behavior. Full suite 118/118 green.
- Production build succeeds; the React-19 JSX-transform warning is confirmed absent from build output (matches 24-01 spike evidence).

## Task Commits

1. **Task 1: Spike-gate verification (checkpoint)** — no commit; VERDICT: PASS confirmed from `24-01-SPIKE-RESULT.md` line 7.
2. **Task 2: artaxTerminalTheme module** — `4d171f8` (feat)
3. **Task 3 RED: failing tests for PlaygroundJsxEditor** — `b01d8f1` (test)
4. **Task 3 GREEN: PlaygroundJsxEditor implementation** — `ddbe567` (feat)
5. **Task 4: Edit JSX toggle + scope + reset wiring in ComponentPlayground** — `f2ce53c` (feat)

**Plan metadata:** pending (this SUMMARY + state updates, separate commit).

## Files Created/Modified

- `apps/artax/src/lib/playground-theme.ts` (created) — `artaxTerminalTheme: PrismTheme` with 8 token-class mappings; documents the fontFamily/fontSize-are-not-in-PrismThemeEntry caveat.
- `apps/artax/src/components/playground-jsx-editor.tsx` (created) — `PlaygroundJsxEditor` wrapper: LiveProvider/LivePreview/LiveError/LiveEditor in CodeBlock-chrome; `// jsx editor` label; `// reset to example` button.
- `apps/artax/tests/playground-jsx-editor.test.tsx` (created) — 5 jsdom tests with mocked react-live covering composition, chrome classes, label, reset wiring, and button styling.
- `apps/artax/src/components/component-playground.tsx` (modified) — Added `jsxEditorScope` (22 artax-ui names + React), `showJsx` and `resetCounter` state, Toggle + conditional editor with `key={resetCounter}` reset.
- `apps/artax/tests/component-playground.test.tsx` (modified) — 5 new tests: toggle default-off, toggle-on mounts editor, toggle-off unmounts, seed code wiring, URL cleanliness (no pushPlayground from JSX).

## Decisions Made

- **Scope: enumerate, don't spread.** 22 artax-ui named exports + React are hand-curated in `jsxEditorScope`. Per 24-01-SPIKE-RESULT.md Open Question 2: 68 named exports on `artax-ui` barrel is too large a surface to spread. Enumerating per-Playground preserves tree-shaking and prevents future exports from auto-leaking into the sandbox. Drawback: new artax-ui components need explicit scope-addition; acceptable tradeoff.
- **Warning: tolerate, don't suppress.** The React-19 dev-mode JSX-transform warning (RESEARCH.md Pitfall 1) fires once per LiveProvider mount in dev. Not wiring `transformCode` to silence it — spike classified it as non-fatal and upstream PR #406 will eventually modernize Sucrase. Absent from production builds per spike.
- **Reset: key-remount.** Plan Task 4 anticipated this fallback. LiveEditor wraps a contenteditable and does not respect seed-prop changes after mount. `onReset` increments `resetCounter`; `key={resetCounter}` on PlaygroundJsxEditor forces a fresh mount with `codeExamples[0].code` as the new seed.
- **Theme font dropped from `plain`.** PrismThemeEntry (prism-react-renderer 2.4.1) does not accept `fontFamily` or `fontSize`. The plan's Task 2 pasted them verbatim from RESEARCH.md Pattern 4, but that type-checks fail. Moved font/size to the editor wrapper's Tailwind classes (`font-mono text-sm`) where they belong. Visual result is identical.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PrismTheme plain.fontFamily / fontSize cause typecheck failure**
- **Found during:** Task 2 (artaxTerminalTheme module)
- **Issue:** Plan instructed pasting the RESEARCH.md Pattern 4 theme verbatim, but `fontFamily: '"JetBrains Mono", monospace'` and `fontSize: '13px'` are not valid `PrismThemeEntry` keys (TS2353). `PrismThemeEntry` accepts only color/cursor/background*/textShadow/fontStyle/fontWeight/textDecorationLine/opacity (per prism-react-renderer 2.4.1 `dist/index.d.ts` lines 66–77).
- **Fix:** Dropped both keys from `plain`. Added an inline comment explaining the type constraint and pointing at the Tailwind `font-mono text-sm` wrapper classes that provide the font stack and size instead.
- **Files modified:** `apps/artax/src/lib/playground-theme.ts`
- **Verification:** `pnpm --filter artax typecheck` clean; `pnpm --filter artax build` clean; syntax highlighting still applies via the `color` keys on each `types` entry.
- **Committed in:** `4d171f8` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in plan-specified code that would not compile under prism-react-renderer 2.4.1).
**Impact on plan:** Zero scope change. The theme still maps artax tokens to Prism syntax classes; font rendering is unaffected because the wrapper already carries `font-mono text-sm`. All other plan specifications were followed verbatim.

## Issues Encountered

- None during execution. Tests, typecheck, and build all green after the initial PrismTheme typecheck fix.

## Spike Gate Resolution

`24-01-SPIKE-RESULT.md` records `VERDICT: PASS` (line 7) with:
- React 19 dev-only JSX-transform warning — tolerate (don't suppress)
- Scope strategy — enumerate named exports (not wildcard spread)

Both recommendations were honored here. Plan proceeded unmodified.

## React 19 JSX Transform Warning Status

- **Dev:** Warning fires once per LiveProvider mount (confirmed by spike; unchanged here).
- **Build:** Absent from `pnpm --filter artax build` stdout/stderr (confirmed by spike; reconfirmed after this plan — only the pre-existing Turbopack NFT trace on `token-registry.ts` remains).
- **Verdict:** Non-blocking. Monitoring upstream react-live PR #406.

## LiveProvider Typing Notes (React 19)

No surprises. `LiveProvider` typed imports resolved cleanly; `LiveProviderProps.scope` is typed as `Record<string, unknown>` which matches our hand-curated scope object. No `as any` escape hatches needed.

## Self-Check: PASSED

- `apps/artax/src/lib/playground-theme.ts` — FOUND
- `apps/artax/src/components/playground-jsx-editor.tsx` — FOUND
- `apps/artax/tests/playground-jsx-editor.test.tsx` — FOUND
- `apps/artax/src/components/component-playground.tsx` — modified (22-name scope + Toggle + conditional editor confirmed via grep)
- `apps/artax/tests/component-playground.test.tsx` — modified (5 new test cases confirmed)
- Commit `4d171f8` (feat: theme) — FOUND
- Commit `b01d8f1` (test: RED) — FOUND
- Commit `ddbe567` (feat: GREEN editor) — FOUND
- Commit `f2ce53c` (feat: toggle wiring) — FOUND
- `pnpm --filter artax test` — 118/118 passed (14 suites)
- `pnpm --filter artax typecheck` — passed
- `pnpm --filter artax build` — compiled (21 static pages generated; React-19 JSX warning absent)
- `grep -c "PlaygroundJsxEditor" apps/artax/src/components/component-playground.tsx` — 3 (import + type + usage)
- `grep -c "Edit JSX" apps/artax/src/components/component-playground.tsx` — 1 (Toggle label)
- `grep -c "\.\.\.artaxUI" component-playground.tsx` — 0 actual spreads (1 match is in a comment documenting why we don't spread)
- `grep -rn "transformCode" apps/artax/src/` — 0 matches (warning not suppressed, per spike recommendation)

## TDD Gate Compliance

Task 3 followed RED-GREEN cleanly:
- RED: `b01d8f1` — `test(24-06): add failing tests for PlaygroundJsxEditor` (5 failing tests)
- GREEN: `ddbe567` — `feat(24-06): implement PlaygroundJsxEditor with react-live` (5/5 passing)
- REFACTOR: skipped — initial GREEN implementation was already minimal and followed PATTERNS.md verbatim.

Task 4 did not use strict RED-GREEN separation (task was `type="auto"`, not `tdd="true"`), but tests were extended first and implementation followed.

## Next Phase Readiness

- Plan 24-07 (route-level integration tests) is the final plan in the phase. It should cover: (a) visiting `/components/atoms/button` and toggling Edit JSX in a real browser/CI context, (b) asserting the real react-live compile cycle produces a preview without Sucrase errors, (c) confirming the `// reset to example` button reseeds the editor. Unit tests here mock react-live; 24-07 should exercise the real pipeline.
- Any follow-up that adds new `artax-ui` named exports intended for the Playground sandbox must also add them to `jsxEditorScope` in `component-playground.tsx`. Consider a lint rule or a single source of truth (e.g., deriving the scope from `component-registry.ts`) if new exports become frequent.

---
*Phase: 24-editable-previews*
*Completed: 2026-04-19*
