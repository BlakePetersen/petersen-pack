---
phase: 27-schema-foundations
plan: 05
subsystem: schema-foundations

tags: [velite, calver, content-hash, sha256, manifest, build-time-gate, schema-08]

requires:
  - phase: 27-schema-foundations
    provides: dxSchemaFor + slug uniqueness (Plan 03); cross-ref validator (Plan 04); SlugSchema/CalVerSchema/ArtifactTypeSchema/MergeStrategySchema imports from blink-registry (Plan 02)

provides:
  - Build-time content-hash gate that short-circuits CalVer derivation when an artifact's distributed-payload bytes are unchanged
  - Git-tracked version manifest at content/.artifact-versions.json mapping bare-slug to {hash (64-hex SHA-256), version (CalVer YYYY.MM.DD.N)}
  - SHA-256-hex helper (sha256Hex) inlined in the Velite prepare hook — no new dependency
  - Idempotent build: prose-only edits to *.artifact.md frontmatter (description, etc.) reuse the prior manifest version; body edits trigger a new deriveCalVer call
  - Manifest invariants regression (phase27-manifest-shape.test.ts) — 64-hex hash + CalVer version + slug coverage of public/r/index.json
  - Three-step CalVer behavior regression (phase27-calver-hash-gate.test.ts) — baseline → frontmatter-only edit (version reused) → body edit (hash changes) against real velite

affects: [28-scaffolds-and-lint, 29-content-density, registry consumers (CLI, /r/index.json)]

tech-stack:
  added: [] # node:crypto is already a Node builtin
  patterns:
    - "Hash gate short-circuits BEFORE deriveCalVer call (which is NOT pure — consults git history). Determinism comes from manifest reuse on hash match, not from deriveCalVer purity."
    - "Single-process serial build assumption (Risk #3): no atomic-write pattern. fs.writeFileSync of full JSON in one syscall. v2+ revisits if parallel builds ever land."
    - "Distributed-payload-only hash scope (D-05): single-file = body bytes, multi-file = concatenated file.content in declared order, no separator. Frontmatter + devDependencies excluded — they don't reach consumers."

key-files:
  created:
    - apps/blakepetersen.io/content/.artifact-versions.json
    - apps/blakepetersen.io/tests/phase27-calver-hash-gate.test.ts
    - apps/blakepetersen.io/tests/phase27-manifest-shape.test.ts
  modified:
    - apps/blakepetersen.io/velite.config.ts
    - .gitignore

key-decisions:
  - "Hash function: SHA-256 hex full digest (D-08). node:crypto createHash — no new dependency, computationally infeasible to forge a colliding payload (T-27-05-02 accepted)."
  - "Hash scope: distributed payload only (D-05). Single-file artifacts hash artifact.body; multi-file artifacts hash files.map(f => f.content).join('') in declared order. Frontmatter (description, devDependencies, name) does NOT bump CalVer — those bytes never reach consumers."
  - "Manifest storage: content/.artifact-versions.json, git-tracked per D-06, NOT in any .gitignore. Survives clean checkouts so versions stay deterministic across machines after first capture."
  - "Hash-gate placement: at the top of the artifact assembly section in the Velite prepare hook, short-circuiting BEFORE the deriveCalVer call. deriveCalVer is NOT pure-date — it consults git history via getGitHistoryForFile. The hash gate's determinism guarantee comes from manifest reuse on hash match, not from deriveCalVer purity."
  - "Atomicity: single-process serial build assumption (Risk #3). v1.4 does not run parallel velite builds. fs.writeFileSync of full JSON in one syscall is sufficient. Atomic write-temp-then-rename deferred to v2+ if parallel builds ever land."
  - "Fixture .gitignore extension: existing Phase 27 fixture configs spread baseConfig and now write manifests too. Added test-fixtures/**/.artifact-versions.json to .gitignore so fixture-build artifacts don't pollute git status."
  - "TDD ordering: test(27-05) RED commit before feat(27-05) GREEN commit, mirroring 27-03 / 27-04 plan-level discipline. Plan declared Task 1 (impl) before Task 2 (tests); test-first commit gate overrides declaration order."

patterns-established:
  - "Pattern: load manifest at top of prepare → per-artifact hash + (reuse OR derive) → write updated manifest after artifact validation passes. Generalizes to any future field that should be deterministic across builds when input bytes are unchanged."
  - "Pattern: distinguishing distributed payload from authoring metadata via hash scope — only the bytes consumers cache against participate in CalVer; everything else is review-time metadata."

requirements-completed: [SCHEMA-08]

duration: 4m53s
completed: 2026-04-27
---

# Phase 27 Plan 05: Content-Hash CalVer Gate Summary

**Velite now short-circuits artifact CalVer derivation against a git-tracked SHA-256 manifest at `content/.artifact-versions.json`, so prose-only `.artifact.md` frontmatter edits no longer bump version while body edits still do — implemented as ~70 lines added inside the prepare hook's artifact assembly block, with manifest seeded for all 8 existing artifacts (5 singles + 3 multis).**

## Performance

- **Duration:** 4m53s
- **Started:** 2026-04-27T07:09:19Z
- **Completed:** 2026-04-27T07:14:12Z
- **Tasks:** 2 (executed in TDD order: test RED → impl GREEN)
- **Files changed:** 5 (3 created, 2 modified)

## Accomplishments

- `node:crypto` `createHash` import added to `velite.config.ts:4`; `sha256Hex` helper inlined in prepare hook
- Version manifest read at the top of artifact assembly: `priorVersionManifest` parsed from `content/.artifact-versions.json` if it exists, else `{}`
- Singles loop hashes `artifact.body`, looks up `priorVersionManifest[slug]`, reuses prior `version` on hash match else calls `deriveCalVer` (D-05)
- Multis loop hashes `files.map(f => f.content).join('')` in declared order, same reuse-or-derive flow
- Updated manifest written after artifact validation passes (so a failed build doesn't poison the manifest)
- Initial manifest committed at `apps/blakepetersen.io/content/.artifact-versions.json` with all 8 existing artifacts: 5 singles (claude-global, claude-project, eslint-flat-config, tmux-poweruser, typescript-config) + 3 multis (prettier-config, husky-lint-staged, writing-custom-skills)
- Manifest is NOT in any `.gitignore` (git-tracked per D-06)
- Existing git-history block (lines 211-225 originally, untouched) continues to power freshness labels independently of the hash gate (Risk #6)
- Two consecutive `pnpm velite` runs produce identical manifest bytes (verified via `git diff --exit-code`)
- Phase 27 fixture build artifacts (`test-fixtures/**/.artifact-versions.json`) added to `.gitignore` so fixture configs that spread baseConfig don't pollute git status
- `phase27-manifest-shape.test.ts` (3 cases) — exists, every entry has 64-hex hash + CalVer version, public/r/index.json slug coverage
- `phase27-calver-hash-gate.test.ts` (1 case, ~14s runtime) — three-step against real velite: baseline → frontmatter-only edit (hash + version unchanged) → body edit (hash changes), with try/finally cleanup that always restores the test artifact
- All 15 Phase 27 tests pass (`pnpm test -- --testPathPattern phase27`)
- `pnpm --filter blakepetersen.io build` exits 0 (Next + Pagefind postbuild clean)
- `pnpm --filter blakepetersen.io typecheck` exits 0

## Task Commits

1. **Task 2 (RED): Add manifest-shape + calver hash-gate failing regressions** — `2643406` (test)
2. **Task 1 (GREEN): Add content-hash CalVer gate to Velite prepare hook** — `b5171e7` (feat)

_Plan metadata commit captures SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md updates._

## Files Created/Modified

- `apps/blakepetersen.io/velite.config.ts` (modified) — added `createHash` import, hash-gate block at top of artifact assembly, manifest write after validation
- `apps/blakepetersen.io/content/.artifact-versions.json` (created) — initial seed for 8 existing artifacts, 64-hex SHA-256 hash + CalVer version per slug, git-tracked per D-06
- `apps/blakepetersen.io/tests/phase27-manifest-shape.test.ts` (created) — manifest invariants regression
- `apps/blakepetersen.io/tests/phase27-calver-hash-gate.test.ts` (created) — three-step behavior regression against real velite + real artifact (eslint-flat-config)
- `.gitignore` (modified) — added `apps/blakepetersen.io/test-fixtures/**/.artifact-versions.json` to keep fixture-build manifests out of git status

## Decisions Made

- **27-05:** Hash function = SHA-256 hex full digest via `node:crypto`. No new dependency; standard, computationally infeasible to forge a colliding artifact body. T-27-05-02 (collision tampering) accepted per orchestrator security note T-06.
- **27-05:** Hash scope = distributed payload only (D-05). Single-file = `artifact.body` bytes; multi-file = concatenated `file.content` strings in declared order, no separator. Frontmatter changes (description, devDependencies, name) do NOT bump CalVer because those bytes never reach consumers — they're review-time metadata.
- **27-05:** Manifest storage = git-tracked file at `content/.artifact-versions.json` per D-06. Survives clean checkouts so versions stay deterministic across machines after first capture. T-27-05-01 (commit-access tampering) accepted — already mitigated by code review since the file is git-diffable in PRs.
- **27-05:** Placement of the hash gate = at the top of the artifact assembly section in the Velite prepare hook, short-circuiting BEFORE `deriveCalVer` is called. `deriveCalVer` is NOT pure-date — it consults git history via `getGitHistoryForFile`. The hash gate's determinism guarantee comes from manifest reuse on hash match, not from `deriveCalVer` purity. ROADMAP.md's "if pure-date logic is confirmed" spike note was written before `calver.ts` was actually read; the hash gate works regardless.
- **27-05:** Atomicity = single-process serial build assumption (Risk #3). v1.4 does not run parallel velite builds. `fs.writeFileSync` of full JSON in one syscall is sufficient. T-27-05-04 (cross-machine determinism) mitigated by the git-tracked manifest contract. Atomic write-temp-then-rename deferred to v2+ if parallel builds ever land.
- **27-05:** Manifest write timing = AFTER artifact validation passes, not before. So if a build fails the manifest doesn't get poisoned with versions for invalid artifacts; restart from the prior committed manifest.
- **27-05:** Test artifact pick = `eslint-flat-config` (`content/configs/eslint-flat-config.artifact.md`). Real single-file artifact, has a `description:` line for the frontmatter-only edit, has body content past the second `---` for the body edit. Test uses try/finally to always restore the file's original bytes.
- **27-05:** TDD ordering = test(27-05) RED commit before feat(27-05) GREEN commit, mirroring 27-03 / 27-04 plan-level discipline. Plan declared Task 1 (impl) before Task 2 (tests); the test-first commit gate overrides declaration order.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixture configs spread baseConfig and now write manifests too**
- **Found during:** Task 1 (impl), post-velite-run `git status`
- **Issue:** Phase 27 fixture configs (e.g., `valid-cross-ref/velite.fixture.config.ts`, `voice-field-valid/velite.fixture.config.ts`) spread `baseConfig` and override only `root` + `output.data`. With the hash gate now living in the shared prepare hook, those fixture builds also try to write `.artifact-versions.json` into the fixture's `content/` directory. Two new untracked manifests appeared at `test-fixtures/phase27/{valid-cross-ref,voice-field-valid}/content/.artifact-versions.json`.
- **Fix:** Added `apps/blakepetersen.io/test-fixtures/**/.artifact-versions.json` to the existing "phase 27 fixture build artifacts" group in `.gitignore`. Aligns with the existing `test-fixtures/**/public/` ignore for the same class of generated fixture-build outputs. The fixtures themselves don't ship artifacts that need version-pinning, so the manifests are pure noise.
- **Files modified:** `.gitignore` (one line added)
- **Verification:** `git check-ignore apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/.artifact-versions.json` exits 0 (ignored); real `apps/blakepetersen.io/content/.artifact-versions.json` is NOT ignored (`git check-ignore` exits 1). Both states correct.
- **Committed in:** `b5171e7` (folded into the GREEN commit since it's a same-feature plumbing fix)

### Order Adjustments

**2. [Rule 3 - Blocking] Reordered tasks to satisfy plan-level TDD gate**
- **Found during:** Task setup
- **Issue:** Plan declared Task 1 (impl) before Task 2 (tests). Both tasks have `tdd="true"`. Plan-level TDD discipline (RED before GREEN, established in 27-03 and 27-04) requires the `test(...)` commit BEFORE the `feat(...)` commit; following declaration order would have produced GREEN-without-RED.
- **Fix:** Authored Task 2's tests first against unchanged code, confirmed RED (4 failing assertions across 2 suites — manifest file does not exist yet), committed as `test(27-05)`. Then implemented Task 1, ran velite to seed the manifest, confirmed GREEN (4/4 → 4 pass, 15/15 phase27 suite green), committed as `feat(27-05)`.
- **Files modified:** None additional — same files as plan specified
- **Verification:** RED commit `2643406` confirmed failing (4 assertions failed: manifest ENOENT). GREEN commit `b5171e7` confirmed passing (1/1 hash-gate, 3/3 manifest-shape, 15/15 full phase27).

---

**Total deviations:** 2 (1 plumbing fix-forward, 1 order-only)
**Impact on plan:** Same scope, same files, plus a one-line `.gitignore` addition for fixture artifacts.

## Issues Encountered

- **Pre-existing `node:warning` for `blink-registry` package without `"type": "module"`** — surfaced by every velite run, unrelated to this plan, out of scope per scope-boundary rule. Logged in 27-04's deferred items.
- **Commitlint footer-leading-blank warning** on the GREEN commit message — non-blocking warning (single empty line between the bullet list and the prose paragraph was lost during the heredoc round-trip). Husky pre-commit accepted the commit. No corrective action — the warning is cosmetic and the commit landed cleanly.
- **Pre-commit hooks** (lint-staged ESLint + Prettier) ran clean on both commits.

## User Setup Required

None — pure schema/test/manifest work, no external services, no new dependencies.

## Next Phase Readiness

- **Plan 27-06 (codemod harness skeleton):** unaffected. Skeleton-only deliverable; no overlap with the artifact assembly section the hash gate touches.
- **Plan 27-07 (perf baseline):** unaffected. Captures wall-time metrics; manifest read/write overhead is on the order of milliseconds per build (one fs.readFileSync + one fs.writeFileSync of an ~1KB JSON).
- **Phase 28+ content authoring:** authors editing only `.artifact.md` frontmatter (description, devDependencies version bumps that don't affect the body) will no longer see CalVer churn in `public/r/<type>/<slug>.json`. Body edits — including new sections, code snippet changes, prose inside the artifact body — still bump CalVer via `deriveCalVer`. Authors who want to force a version bump can edit body bytes directly (any non-trivial text change suffices).
- **Velite version pin:** the hash gate depends only on `node:crypto.createHash` (Node builtin) and Velite's `data.singleArtifacts/multiArtifacts` shape (stable Velite API). Independent of the `meta.config.cache` private-API risk that 27-03's slug-uniqueness helper rests on.

## Self-Check: PASSED

Verified all created/modified files exist and both task commits are reachable:

- FOUND: `apps/blakepetersen.io/velite.config.ts` (modified, contains `createHash` + `sha256Hex` + `priorVersionManifest` + `updatedVersionManifest` + `versionManifestPath`)
- FOUND: `apps/blakepetersen.io/content/.artifact-versions.json` (8 entries, 34 lines, NOT git-ignored)
- FOUND: `apps/blakepetersen.io/tests/phase27-manifest-shape.test.ts`
- FOUND: `apps/blakepetersen.io/tests/phase27-calver-hash-gate.test.ts`
- FOUND: `.gitignore` (modified, contains `test-fixtures/**/.artifact-versions.json`)
- FOUND: commit `2643406` (test RED) on `main`
- FOUND: commit `b5171e7` (feat GREEN) on `main`

Verification commands run:
- `pnpm --filter blakepetersen.io velite` → exits 0; manifest written
- Second `pnpm velite` run → identical manifest bytes (`git diff --exit-code` exit 0)
- `pnpm --filter blakepetersen.io test -- --testPathPattern phase27-manifest-shape` → 3/3 passed
- `pnpm --filter blakepetersen.io test -- --testPathPattern phase27-calver-hash-gate` → 1/1 passed (~14s)
- `pnpm --filter blakepetersen.io test -- --testPathPattern phase27` → 15/15 passed
- `pnpm --filter blakepetersen.io typecheck` → exits 0
- `pnpm --filter blakepetersen.io build` → exits 0 (Next + Pagefind postbuild clean)
- `git check-ignore apps/blakepetersen.io/content/.artifact-versions.json` → exit 1 (NOT ignored)
- `git check-ignore apps/blakepetersen.io/test-fixtures/phase27/valid-cross-ref/content/.artifact-versions.json` → exit 0 (ignored, as intended)
- `grep -c "import { createHash } from 'node:crypto'" apps/blakepetersen.io/velite.config.ts` → 1
- `grep -c "sha256Hex" apps/blakepetersen.io/velite.config.ts` → 5 (≥ 3)
- `grep -c "priorVersionManifest" apps/blakepetersen.io/velite.config.ts` → 3 (= 3)
- `grep -c "updatedVersionManifest" apps/blakepetersen.io/velite.config.ts` → 4 (≥ 4)

## TDD Gate Compliance

- **RED gate:** `2643406` (`test(27-05): add failing manifest-shape + calver hash-gate regressions for SCHEMA-08`) — confirmed failing against unchanged code (manifest ENOENT — 4 assertions failed across both test files).
- **GREEN gate:** `b5171e7` (`feat(27-05): add content-hash CalVer gate to Velite prepare hook`) — confirmed passing (1/1 hash-gate test in 14s; 3/3 manifest-shape; 15/15 full phase27 suite; build + typecheck clean; manifest idempotent across two velite runs).
- **REFACTOR gate:** not needed — initial implementation already tight (single hash-gate block following the pattern from RESEARCH.md Q3 with no inline-able simplifications; sha256Hex helper extracted as plan-specified).

---

## Output Document Mandates (per plan output spec)

The plan's `<output>` block requires three explicit documentation items in this SUMMARY:

1. **`deriveCalVer` is NOT pure-date** — it calls `getGitHistoryForFile`, which invokes git history lookup via `child_process` in `apps/blakepetersen.io/src/lib/git-history.ts`. The inner `calverFromDate(date, dateCounters)` IS pure, but the outer wrapper consults git for the date. Documented in `key-decisions` and `Decisions Made` above.

2. **Hash gate purity guarantee comes from short-circuiting BEFORE deriveCalVer** — when `priorVersionManifest[slug]?.hash === sha256Hex(payload)`, the gate reuses `prior.version` verbatim and never calls `deriveCalVer`. So even though `deriveCalVer` is impure, the prose-only-edit-doesn't-bump-CalVer guarantee holds because that code path is unreachable on hash match. Documented in `key-decisions` and `Decisions Made` above.

3. **Single-process build assumption (Risk #3) and atomic-write deferral** — Velite's prepare hook runs serially in a single Node process. Concurrent `pnpm velite` invocations against the same checkout would race the manifest write, but pnpm/turbo serialize within a workspace and developers don't run two velite builds simultaneously. No atomic write-temp-then-rename pattern was implemented. Deferred to v2+ if parallel builds ever land. Documented in `key-decisions` and `Decisions Made` above.

---
*Phase: 27-schema-foundations*
*Completed: 2026-04-27*
