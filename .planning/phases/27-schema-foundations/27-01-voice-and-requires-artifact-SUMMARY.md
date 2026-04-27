---
phase: 27-schema-foundations
plan: 01
subsystem: content-schema

tags: [velite, zod, dx-fields, voice, requires_artifact, schema-foundations]

requires:
  - phase: 27-schema-foundations
    plan: 00
    provides: phase27-velite-runner.ts + voice-field-valid/invalid fixture trees

provides:
  - SCHEMA-01 (voice) and SCHEMA-02 (requires_artifact) on dxFields in apps/blakepetersen.io/velite.config.ts
  - Fixture-driven happy + failure-path tests for the voice enum
  - Default-application coverage for both new fields across all 4 DX collections (skills, hooks, configs, guides)

affects:
  - apps/blakepetersen.io/velite.config.ts
  - apps/blakepetersen.io/tests/phase27-voice-field.test.ts
  - apps/blakepetersen.io/tests/frontmatter-schema.test.ts
  - apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts (Plan 00 helper, fixed in this plan — see Deviations #1)
  - .gitignore (fixture build artifacts)

tech-stack:
  added: []
  patterns:
    - "voice: s.array(s.enum(['author-note', 'decision-rationale'])).default([])"
    - "requires_artifact: s.boolean().default(false)"
    - "Direct velite binary invocation in test runner (bypasses pnpm-exec workspace lookup)"
    - "--strict CLI flag passed unconditionally so schema failures exit non-zero"

key-files:
  created:
    - apps/blakepetersen.io/tests/phase27-voice-field.test.ts
  modified:
    - apps/blakepetersen.io/velite.config.ts
    - apps/blakepetersen.io/tests/frontmatter-schema.test.ts
    - apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts
    - .gitignore

key-decisions:
  - "Velite's `strict` config option does NOT affect CLI exit codes — only the `--strict` CLI flag does. Runner now passes `--strict` unconditionally."
  - "Runner invokes the velite binary directly (not via `pnpm exec`) so cwd can be the fixture dir without triggering ERR_PNPM_RECURSIVE_EXEC_NO_PACKAGE."
  - "Fixture build artifacts (.velite-fixture/, fixture-local public/) are gitignored — they are deterministic outputs of running the test, not source."

requirements-completed: [SCHEMA-01, SCHEMA-02]

duration: 4m41s
completed: 2026-04-27
---

# Phase 27 Plan 01: Voice + Requires-Artifact Summary

**SCHEMA-01 (`voice`) and SCHEMA-02 (`requires_artifact`) shipped on `dxFields` with default-preserves invariant intact across all 11 existing DX entries; failure path proven via Plan 00 fixture + a runner fix that exposes Velite's real exit-code contract.**

## Performance

- **Duration:** 4m41s
- **Started:** 2026-04-27T06:29:51Z
- **Completed:** 2026-04-27T06:34:32Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 4

## Accomplishments

- Two new fields landed on the shared `dxFields` block in `apps/blakepetersen.io/velite.config.ts`:
  - `voice: s.array(s.enum(['author-note', 'decision-rationale'])).default([])`
  - `requires_artifact: s.boolean().default(false)`
- All 11 existing DX entries (1 skill, 1 hook, 6 configs, 3 guides) continue to validate with no frontmatter changes — defaults applied transparently.
- New `phase27-voice-field.test.ts` exercises both happy (`voice: ['author-note']` round-trips through `.velite-fixture/skills.json`) and failure (`voice: ['not-a-real-voice-type']` exits non-zero with `voice` in stderr) paths.
- Existing `frontmatter-schema.test.ts` extended with `test.each` matrix asserting every DX entry exposes `voice` (array) and `requires_artifact` (boolean) — drift sentinel for future schema changes.
- Plan 00's `phase27-velite-runner.ts` helper repaired so the `--strict` CLI flag and direct binary invocation actually surface schema failures as non-zero exits (see Deviations #1).

## Task Commits

1. **Task 1: Add voice + requires_artifact to dxFields** — `c6a8c9c` (feat)
2. **Task 2: Author voice-field tests + extend frontmatter-schema; fix runner** — `13c12bb` (test)

_Plan metadata commit will capture SUMMARY.md, STATE.md, and ROADMAP.md updates._

## Files Created/Modified

### Schema (Task 1)
- `apps/blakepetersen.io/velite.config.ts` — added `voice` and `requires_artifact` between `tags` and `category` per RESEARCH.md Q7.

### Tests + tooling (Task 2)
- `apps/blakepetersen.io/tests/phase27-voice-field.test.ts` (new) — 2 tests covering enum success + enum failure via fixtures.
- `apps/blakepetersen.io/tests/frontmatter-schema.test.ts` — appended `SCHEMA-01 / SCHEMA-02` describe block with 8 `test.each`-generated cases (4 collections × 2 fields).
- `apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts` — switched from `pnpm exec velite` to direct binary, added `--strict`, kept `cwd=fixtureDir` so the fixture's relative `root: './content'` still resolves correctly.
- `.gitignore` — added `.velite-fixture` and `apps/blakepetersen.io/test-fixtures/**/public/` to suppress velite test-build artifacts.

## Decisions Made

- **27-01:** `voice` array enum sits between `tags` and `category` in `dxFields` per RESEARCH.md Q7 ("group with related metadata fields"). `requires_artifact` follows it on the next line. `.default([])` and `.default(false)` guarantee zero existing-entry impact.
- **27-01:** No `.refine()` for voice duplicate detection / ordering rules — explicitly deferred to Phase 28 LINT-03 per CONTEXT.md `<deferred>`. Plan 27-01 ships the smallest enum that satisfies SCHEMA-01.
- **27-01:** Fix runner via the binary path + `--strict` flag (see Deviations #1) rather than redesigning the fixture configs to use absolute roots. Smaller surface area, no fixture-config churn for downstream Plans 03/04.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Plan 00's velite runner had two latent bugs that prevented Task 2's failure-path test from ever passing**

- **Found during:** Task 2 (running the new `rejects voice: [not-a-real-voice-type]` test).
- **Issue A:** `pnpm exec velite` invoked with `cwd: fixtureDirectory` returned `ERR_PNPM_RECURSIVE_EXEC_NO_PACKAGE` because the fixture dir has no `package.json`. Result: `result.combined` contained pnpm's error, never reaching velite at all.
- **Issue B:** Even with the cwd issue worked around, Velite without the `--strict` CLI flag emits the schema error to stderr but still exits 0 — `strict: true` inside `defineConfig` controls validation behavior in the build pipeline but does NOT propagate to the CLI exit code (verified via `velite build --help`; `--strict` is the CLI knob). Acceptance criteria in the plan asserted non-zero exit.
- **Fix:** In `tests/lib/phase27-velite-runner.ts`:
  - Resolve the velite binary from the app's `node_modules/.bin` and invoke it directly (skipping `pnpm exec`) so `cwd: fixtureDirectory` is harmless.
  - Pass `--strict` to every fixture build so schema failures exit non-zero per the documented Velite contract.
- **Files modified:** `apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts`.
- **Commit:** `13c12bb` (combined with Task 2 since the test file is meaningless without this fix).
- **Rationale for in-scope:** Plan 27-00 produced this helper specifically as runway for Plan 27-01. The helper's contract (return non-zero exit on schema failure) is required by Plan 27-01's acceptance criteria. Fixing it here prevents repeat blockage in Plans 03/04 which consume the same helper for duplicate-slug and dangling-cross-ref scenarios.

**2. [Rule 3 — Blocking] Fixture build artifacts polluted git status**

- **Found during:** Task 2 verification.
- **Issue:** Running `runVeliteFixture` writes `.velite-fixture/` and a per-fixture `public/` (Velite's default `output.assets`). These appeared as untracked files after `pnpm test`.
- **Fix:** Added two lines to root `.gitignore` (`.velite-fixture` and `apps/blakepetersen.io/test-fixtures/**/public/`).
- **Commit:** `13c12bb`.

### Plan-text observations (not deviations)

- The plan's `<behavior>` referenced "16 entries" — the live count is 11 DX entries (1 skill + 1 hook + 6 configs + 3 guides) plus 12 posts (which don't share `dxFields`). The default-preserves invariant still holds for all 11 DX entries; verifier should treat "16" as a stale planning-time estimate.

## Issues Encountered

- **None unresolved.** Both deviations above are auto-fixed and committed.

## User Setup Required

- None. Pure schema + test additions, no environment, runtime, or external service changes.

## Verification Receipts

- `pnpm --filter blakepetersen.io velite` exits 0 with the new schema (verified pre- and post-edit).
- `pnpm --filter blakepetersen.io build` exits 0 (Next + Velite + Pagefind succeed).
- `pnpm --filter blakepetersen.io test -- --testPathPattern "phase27-voice-field|frontmatter-schema"` exits 0 (25 tests pass, 0 fail).
- `pnpm --filter blakepetersen.io typecheck` exits 0.
- `grep -E "voice: s.array.*author-note.*decision-rationale" apps/blakepetersen.io/velite.config.ts` → 1 match.
- `grep -E "requires_artifact: s.boolean" apps/blakepetersen.io/velite.config.ts` → 1 match.
- Pre-commit hooks (Husky + lint-staged ESLint --fix) ran cleanly on both task commits — no `--no-verify` used.

## Threat Register Status

- **T-27-01-01 (Tampering, voice enum):** mitigated — `s.array(s.enum([...]))` rejects any non-enum value with a non-zero exit when `--strict` is in play. Verified via `voice-field-invalid` fixture.
- **T-27-01-02 (Tampering, requires_artifact):** mitigated — `s.boolean()` rejects strings/numbers; default `false` preserves all 11 existing entries (verified — every DX entry's `requires_artifact` is `false` post-build).

No new threat surface introduced beyond the planned dxFields extension.

## Next Phase Readiness

- Plan 02 (`27-02-blink-registry-import`) can proceed — `dxFields` shape is now field-frozen for v1.4 per v1.4-PLAN-02 lock-in.
- Plans 03 (slug uniqueness) and 04 (cross-ref validator) can rely on the fixed `phase27-velite-runner.ts` returning real non-zero exits when fixture content fails validation.
- Phase 28 LINT-03 (voice duplicate/ordering refine) starting position is clean — no `.refine()` was added; it's a green-field add-on next milestone.

## Self-Check: PASSED

Verified all created/modified files exist and both task commits are reachable:

- FOUND: `apps/blakepetersen.io/velite.config.ts` (modified, lines 30-31 contain new fields)
- FOUND: `apps/blakepetersen.io/tests/phase27-voice-field.test.ts`
- FOUND: `apps/blakepetersen.io/tests/frontmatter-schema.test.ts` (modified, new describe block at end)
- FOUND: `apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts` (modified — direct binary + --strict)
- FOUND: `.gitignore` (modified — `.velite-fixture` + fixture public/)
- FOUND: commit `c6a8c9c` (Task 1)
- FOUND: commit `13c12bb` (Task 2)

---
*Phase: 27-schema-foundations*
*Completed: 2026-04-27*
