---
phase: 27-schema-foundations
plan: 00
subsystem: testing

tags: [velite, jest, fixtures, spawn-sync, mdx, schema-foundations]

requires:
  - phase: 13-artifact-pipeline
    provides: dxFields shape, `<collection>/<slug>` cross-ref format, content-pipeline test pattern

provides:
  - Five isolated Velite fixture trees (duplicate-slug, dangling-cross-ref, valid-cross-ref, voice-field-valid, voice-field-invalid)
  - `phase27-velite-runner.ts` shared helper exposing `runVeliteFixture()` + `fixtureDir()`
  - Wave 0 runway for SCHEMA-01, SCHEMA-03, SCHEMA-04 failure-path tests

affects: [27-01-voice-field, 27-03-slug-collection, 27-04-cross-ref-validator, 27-05-blink-registry-imports]

tech-stack:
  added: []
  patterns:
    - "Fixture-config pattern: spread base velite config, override `root` and `output.data`, set `clean: true`"
    - "spawnSync + argv array invocation for Velite subprocess (no shell, no injection surface)"

key-files:
  created:
    - apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/content/skills/foo.mdx
    - apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/content/skills/nested/foo.mdx
    - apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/velite.fixture.config.ts
    - apps/blakepetersen.io/test-fixtures/phase27/dangling-cross-ref/content/guides/orphan.mdx
    - apps/blakepetersen.io/test-fixtures/phase27/dangling-cross-ref/velite.fixture.config.ts
    - apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/guides/source.mdx
    - apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/configs/target.mdx
    - apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/velite.fixture.config.ts
    - apps/blakepetersen.io/test-fixtures/phase27/voice-field-valid/content/skills/voiced.mdx
    - apps/blakepetersen.io/test-fixtures/phase27/voice-field-valid/velite.fixture.config.ts
    - apps/blakepetersen.io/test-fixtures/phase27/voice-field-invalid/content/skills/bad-voice.mdx
    - apps/blakepetersen.io/test-fixtures/phase27/voice-field-invalid/velite.fixture.config.ts
    - apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts
  modified: []

key-decisions:
  - "Fixture configs spread baseConfig and override only `root` + `output.data`+`clean` — no per-collection schema overrides needed"
  - "Runner uses `pnpm exec velite` (not `pnpm velite`) so fixture builds bypass app's velite script"
  - "`fixtureDir` resolves via `path.resolve(__dirname, '..', '..', ...)` — no untrusted input reaches spawnSync"

patterns-established:
  - "Phase-scoped fixture organization: `apps/blakepetersen.io/test-fixtures/<phase>/<scenario>/{content,velite.fixture.config.ts}`"
  - "Failure-path Velite testing via subprocess + exit-code/combined-stderr assertions"

requirements-completed: []

duration: 2m10s
completed: 2026-04-27
---

# Phase 27 Plan 00: Test Fixtures Summary

**Wave 0 runway for Phase 27 schema work — five Velite fixture scenarios + a spawnSync runner helper that all SCHEMA-01/03/04 failure-path tests will consume.**

## Performance

- **Duration:** 2m10s
- **Started:** 2026-04-27T06:24:00Z
- **Completed:** 2026-04-27T06:26:10Z
- **Tasks:** 2
- **Files created:** 13

## Accomplishments

- Seven MDX fixtures laid down across five scenario trees with valid `dxFields` frontmatter (title, description, applies_to)
- Five scenario-scoped `velite.fixture.config.ts` files re-using the base schema and isolating output to `.velite-fixture/`
- `tests/lib/phase27-velite-runner.ts` exporting `runVeliteFixture(dir)` and `fixtureDir(scenario)` for failure-path assertions
- Plan-specified verify (`pnpm --filter blakepetersen.io typecheck`) passes clean

## Task Commits

1. **Task 1: Author the five fixture content trees** — `fe91844` (test)
2. **Task 2: Author the five fixture velite configs and the shared spawnSync helper** — `3c83a2c` (feat)

_Plan metadata commit captures SUMMARY.md, STATE.md, and ROADMAP.md updates._

## Files Created/Modified

### Fixture content (Task 1)
- `apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/content/skills/foo.mdx` — top-level foo skill
- `apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/content/skills/nested/foo.mdx` — nested foo (same bare slug)
- `apps/blakepetersen.io/test-fixtures/phase27/dangling-cross-ref/content/guides/orphan.mdx` — references nonexistent config
- `apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/guides/source.mdx` — references existing target
- `apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/configs/target.mdx` — existence proof for source
- `apps/blakepetersen.io/test-fixtures/phase27/voice-field-valid/content/skills/voiced.mdx` — `voice: ["author-note"]`
- `apps/blakepetersen.io/test-fixtures/phase27/voice-field-invalid/content/skills/bad-voice.mdx` — invalid voice value

### Fixture configs + runner helper (Task 2)
- `apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/velite.fixture.config.ts`
- `apps/blakepetersen.io/test-fixtures/phase27/dangling-cross-ref/velite.fixture.config.ts`
- `apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/velite.fixture.config.ts`
- `apps/blakepetersen.io/test-fixtures/phase27/voice-field-valid/velite.fixture.config.ts`
- `apps/blakepetersen.io/test-fixtures/phase27/voice-field-invalid/velite.fixture.config.ts`
- `apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts` — `runVeliteFixture()` + `fixtureDir()`

## Decisions Made

- **27-00:** Fixture configs spread baseConfig and override only `root: './content'`, `output.data: '.velite-fixture'`, `clean: true`. No per-collection schema overrides needed — the strict-config concern raised in the plan is handled by each scenario's content tree only populating collections under test.
- **27-00:** Runner invokes `pnpm exec velite` (not `pnpm velite`) so fixture builds bypass the app's `velite` package.json script and go directly to the locally-installed binary. `cwd: fixtureDirectory` ensures the fixture's relative `root` resolves correctly.
- **27-00:** `fixtureDir(scenario)` is the only public path-construction surface — composed entirely from `__dirname` join + a static scenario string, satisfying T-27-00-03 (no untrusted input reaches spawn).

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- **tsconfig coverage observation (informational, not a deviation):** The plan's verify command is `pnpm --filter blakepetersen.io typecheck`, which uses `tsconfig.typecheck.json`. That config explicitly **excludes** `tests/`, and the new `test-fixtures/` tree is also outside its `include` paths. The verify command therefore passes tautologically against the new files. As a sanity check I ran `tsc --noEmit -p tsconfig.test.json` (which DOES include `tests/**/*.ts`) and confirmed no errors involve the new `phase27-velite-runner.ts` or any `velite.fixture.config.ts`. Pre-existing errors in `tests/changelog.test.tsx`, `tests/contributors.test.tsx`, and `tests/roadmap.test.tsx` exist on `main` before this plan and are out of scope per the executor's scope-boundary rule (logged here for the verifier, not deferred to a tracking file because none are caused by this plan).

## User Setup Required

None — pure test-runway plan, no external services.

## Next Phase Readiness

- Wave 0 runway is in place. Plans 01 (SCHEMA-01 voice field), 03 (SCHEMA-03 slug collection), and 04 (SCHEMA-04 cross-ref validator) can now write failure-path tests against `runVeliteFixture(fixtureDir('<scenario>'))`.
- The voice-field-invalid fixture intentionally only fails AFTER Plan 01 lands SCHEMA-01 — pre-Plan-01, Velite's strictness on unknown frontmatter keys may surface a different error message. Plan 01's test will assert non-zero exit + a substring on the field name (per plan note in `<action>`).
- No production behavior changed; happy-path content pipeline tests remain unaffected.

## Self-Check: PASSED

Verified all created files exist and both commits are reachable:

- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/content/skills/foo.mdx`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/content/skills/nested/foo.mdx`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/duplicate-slug/velite.fixture.config.ts`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/dangling-cross-ref/content/guides/orphan.mdx`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/dangling-cross-ref/velite.fixture.config.ts`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/guides/source.mdx`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/configs/target.mdx`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/velite.fixture.config.ts`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/voice-field-valid/content/skills/voiced.mdx`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/voice-field-valid/velite.fixture.config.ts`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/voice-field-invalid/content/skills/bad-voice.mdx`
- FOUND: `apps/blakepetersen.io/test-fixtures/phase27/voice-field-invalid/velite.fixture.config.ts`
- FOUND: `apps/blakepetersen.io/tests/lib/phase27-velite-runner.ts`
- FOUND: commit `fe91844`
- FOUND: commit `3c83a2c`

---
*Phase: 27-schema-foundations*
*Completed: 2026-04-27*
