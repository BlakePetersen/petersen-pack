---
phase: 27
phase_name: "schema-foundations"
project: "petersen-group"
generated: "2026-04-28T09:11:35Z"
counts:
  decisions: 8
  lessons: 7
  patterns: 9
  surprises: 7
missing_artifacts:
  - "27-UAT.md"
---

# Phase 27 Learnings: Schema Foundations

## Decisions

### Slug Uniqueness via `superRefine` Instead of `s.slug()`
Kept `s.path()` and added per-collection dedup via Velite's private `meta.config.cache` instead of swapping to `s.slug('<collection>')` as D-19's literal wording suggested.

**Rationale:** `s.slug()` returns a bare slug, which would break every consumer of the path-shaped `entry.slug`. The `superRefine` variant satisfies D-19's substance (per-collection duplicate detection) with zero consumer changes.
**Source:** 27-03-slug-uniqueness-SUMMARY.md, 27-RESEARCH.md (Q1)

---

### Cross-Reference Validation via Full-Path Set Lookup
Built per-collection Sets keyed on full path-shaped slugs and matched cross-refs directly, instead of the research-suggested `.split('/').pop()` bare-slug approach.

**Rationale:** Real content has nested skill paths like `skills/claude-code/writing-custom-skills`. The `.pop()` approach would have placed `writing-custom-skills` in the Set while looking up `claude-code/writing-custom-skills` — a false-positive miss.
**Source:** 27-04-cross-ref-validator-SUMMARY.md (Decisions Made, Deviations #1)

---

### Hash-Gate Short-Circuit Before `deriveCalVer`
Positioned the content-hash manifest check at the top of the artifact assembly section, before any call to `deriveCalVer`.

**Rationale:** `deriveCalVer` shells out to `git log` (not pure). Determinism comes from manifest reuse on hash match, not from CalVer purity. The gate ensures "prose-only edits don't bump CalVer" by never reaching the impure function when hashes match.
**Source:** 27-05-calver-hash-gate-SUMMARY.md (Decisions Made)

---

### Manifest Key-Sorting for Byte-Stable Diffs
Sort top-level keys with raw `<`/`>` string comparison before `JSON.stringify` of the version manifest.

**Rationale:** Velite's materialization order of singles vs multis is non-deterministic. Without sorting, every `pnpm velite` run reordered keys, producing spurious git diffs and violating the D-06 "diffable in PRs" contract. Raw string comparison (not `localeCompare`) avoids locale-dependent results across machines.
**Source:** 27-VERIFICATION.md (Post-verification gap closure 2026-04-28), commit `1874213`

---

### Native ESM `fileURLToPath(import.meta.url)` Over CJS-Shim Polyfill
Used native ESM path resolution in `tsx`-executed scripts rather than the plan's `globalThis.__dirname` polyfill.

**Rationale:** tsx 4.x runs scripts as native ESM in `"type": "module"` host packages. Polyfills throw at module load. Standard pattern proven in both `migrate-content.ts` (27-06) and `perf-baseline.ts` (27-07).
**Source:** 27-06-codemod-harness-SUMMARY.md (Deviations #1), 27-07-perf-baseline-SUMMARY.md (Deviations #1)

---

### Velite Binary Direct Invocation Over `pnpm exec`
The shared test runner invokes the velite binary directly with explicit `cwd` instead of going through `pnpm exec`.

**Rationale:** `pnpm exec velite` requires the cwd to host a `package.json`; fixture directories don't (and shouldn't). Direct binary invocation skips the workspace lookup and the `--strict` CLI flag becomes load-bearing for exit-code semantics.
**Source:** 27-01-voice-and-requires-artifact-SUMMARY.md (Deviations #1)

---

### Tighten `dependencies`/`related` to `CrossRefSchema` at Schema Level
`dxFields.dependencies` and `dxFields.related` typed as `CrossRefSchema` (regex-enforced `<dx-collection>/<slug-path>`) rather than `string[]`.

**Rationale:** The runtime cross-ref validator caught dangling targets at build time, but the type system gave `'skill/foo'` (typo: missing trailing `s`) the same shape as a valid ref. Schema-level enforcement catches typos at parse time, before the existence check.
**Source:** Commit `fd6a5c2` (post-verification PR review C3)

---

### Build `blink-registry` to dist/ Via tsup
Compile `blink-registry` source to ESM + CJS + `.d.ts` in `dist/`, point `package.json` `main`/`exports` at compiled output, add `"type": "module"` and `engines.node>=20`.

**Rationale:** Local Node 24.14.0 strips TypeScript at runtime via `--experimental-strip-types` (default in Node 24+). Vercel's Node 22.x doesn't, so Velite's prepare-hook `import('blink-registry')` crashed on the raw `.ts` source. Plan 27-02's Option A (`.ts` extensions on intra-package re-exports) papered over this on Node 24 only. Compiling to portable JS removes the Node-version dependency entirely.
**Source:** Commit `5e9e055` (post-merge Vercel-fix follow-up to deferred 27-02 item)

---

## Lessons

### Velite's `--strict` CLI Flag, Not `defineConfig({ strict: true })`, Controls Exit Codes
Velite's `strict: true` inside `defineConfig()` controls validation behavior in the build pipeline but does NOT propagate to CLI exit codes. Only the `--strict` CLI flag controls non-zero exit on schema failures.

**Context:** Plan 27-00's runner shipped without `--strict`; failure-path tests in 27-01 surfaced this gap when fixture builds didn't exit non-zero on schema rejection.
**Source:** 27-01-voice-and-requires-artifact-SUMMARY.md (Deviations #1)

---

### `blink-registry` ESM Resolution Conflates Two Code Paths
Plan 27-02's RESEARCH Q2 assumed "esbuild resolves workspace TS" applied uniformly. In reality, tsup-bundled consumers (like `@blink/cli`) traverse the full dependency tree at build time and dodge Node ESM. Velite's esbuild compiles only the config; workspace deps are loaded by Node ESM at runtime, which rejects extensionless re-exports.

**Context:** The conflation surfaced as an Option A → Rule 4 → Rule 3 escalation during 27-02 execution. The deeper lesson — local Node 24 TS-stripping was masking a broken-on-Vercel reality — only surfaced after main merged and CI ran. Workspace packages should not expose raw TS for runtime consumption; bundle them.
**Source:** 27-02-blink-registry-import-SUMMARY.md (Deviations #1), commit `5e9e055`

---

### Manifest Key-Ordering Severity Was Underestimated
`deferred-items.md` flagged the non-determinism as "Cosmetic." Verifier confirmed the manifest is dirty after every `pnpm velite` invocation, violating the D-06 "diffable in PRs" contract and the VALIDATION.md consecutive-run idempotency requirement.

**Context:** "Manual-only verification" classification masked a contract violation. The criterion for "minor" should be "doesn't violate a locked decision," not "doesn't break correctness."
**Source:** 27-VERIFICATION.md (SCHEMA-08 PARTIAL verdict)

---

### `getGitHistoryForFile`'s Silent Fallback Was Load-Bearing for Build-Persisted CalVer
The legacy lenient catch in `getGitHistoryForFile` substitutes `new Date().toISOString()` when git execution fails. UI consumers (graph metadata) wanted this; the new SCHEMA-08 hash gate persisted the fabricated date into `.artifact-versions.json` and locked it forever.

**Context:** The same code can be safe for one consumer and corrupting for another. PR review caught the regression. `deriveCalVer` now shells out directly with `execFileSync`, throws on execution failure with `cause` chain preserved, while keeping `getGitHistoryForFile`'s lenient fallback for UI usage.
**Source:** 27-VERIFICATION.md (Post-verification gap closure), commit `5b771ba`

---

### Cross-Ref Field Names: `dependencies`/`related`, Not `requires:`
Initial REQUIREMENTS.md wording referenced "every `requires:` cross-reference," but D-01 locked the actual validated fields as `dependencies` and `related`. There is no `requires:` field.

**Context:** Documentation drift between requirements language and locked decisions surfaced during verification. Both fields were validated correctly; only the requirement prose was stale.
**Source:** 27-VERIFICATION.md (SCHEMA-04 evidence note)

---

### Plan-Text Drift on Entry Counts
Plan 27-01 claimed "16 entries" but the live count was 11 DX entries (1 skill + 1 hook + 6 configs + 3 guides) plus 12 posts that use a different schema. Default-preserves invariant still held.

**Context:** Plan-authoring snapshots become stale fast under content growth. Don't anchor invariants to specific counts; anchor them to "all existing content continues to validate."
**Source:** 27-01-voice-and-requires-artifact-SUMMARY.md (Plan-text observations)

---

### Tests That Mutate Git-Tracked Files Are a Working-Tree-Pollution Risk
The original `phase27-calver-hash-gate.test.ts` mutated `content/configs/eslint-flat-config.artifact.md` and the git-tracked manifest, restoring in a `finally` block. SIGINT/OOM/jest-timeout could leave both files dirty and staged for accidental commit.

**Context:** PR review C2. Even with `try/finally`, process-level interruptions skip the cleanup. The fix moved the test to a fixture tree with an embedded baseline-string reset in `beforeEach` AND `afterEach` — interrupted runs leave only fixture state dirty, and the next run resets unconditionally.
**Source:** Commit `7771499` (post-verification PR review C2)

---

## Patterns

### `meta.config.cache` + `superRefine` for Cross-File Invariants
Reuse Velite's private `meta.config.cache` Map with namespaced keys (e.g., `phase27:collection-slug:<collection>:<bareSlug>`) inside a Zod `superRefine` to enforce fail-fast, location-aware invariants that span multiple files in a collection.

**When to use:** Per-collection duplicate detection; cross-file shape invariants where Velite's serial parse order is acceptable. Risk: private API; mitigate with version pin + canary regression test.
**Source:** 27-03-slug-uniqueness-SUMMARY.md, 27-04-cross-ref-validator-SUMMARY.md

---

### Schema Factory Pattern for Collection-Scoped Validation
`dxSchemaFor(collection)` returns a closure-bound schema; static `dxSchema` constants are replaced. Single declaration, typed call sites, prevents accidental bare-schema reuse.

**When to use:** Whenever a Velite schema needs collection-aware behavior (slug dedup, cross-ref scoping, type narrowing). Beats threading the collection name through every consumer.
**Source:** 27-03-slug-uniqueness-SUMMARY.md (Decisions Made, Factory shape)

---

### Accumulator-Then-Throw for Batch Author UX
Validator collects ALL violations across all entries, then throws once with the full count + indented list. Authors fix the whole batch in one build cycle instead of one-at-a-time fail-fast.

**When to use:** Build-time validators where the user (content author) operates on multiple entries that fail together. Particularly valuable when the fix per violation is small but locating each one in stderr matters.
**Source:** 27-04-cross-ref-validator-SUMMARY.md (Accomplishments)

---

### Fixture-Tree + Shared Runner Test Pattern
Failure-path tests live as isolated Velite fixture trees under `apps/blakepetersen.io/test-fixtures/phase27/<scenario>/`, exercised via the shared `tests/lib/phase27-velite-runner.ts` helper. Tests assert exit code and stderr substrings.

**When to use:** Any test where Velite (or another build tool) must reject malformed input. The shared runner means new failure-path tests cost only a fixture directory + a Jest assertion.
**Source:** 27-00-test-fixtures-SUMMARY.md, reused in 27-01..27-05

---

### Embedded-Baseline + `beforeEach`/`afterEach` Reset for Mutating Tests
Tests that must mutate disk state during execution embed a baseline-content string as a constant, write it in `beforeEach`, mutate it during the test, and rewrite from the same constant in `afterEach`. Resilient to interruption: the next run unconditionally resets.

**When to use:** Tests that exercise behavior dependent on disk state changing (e.g., the CalVer hash-gate test). Combine with fixture trees so real content is never load-bearing.
**Source:** Commit `7771499` (post-verification PR review C2)

---

### TDD Red-Green Commit Ordering at Plan Level
Author the failing test first (`test(...)` commit), then implement the feature (`feat(...)` commit). Plan-declared task order (impl → test) is overridden by the TDD discipline gate when both options satisfy plan acceptance.

**When to use:** Default for any new validator, schema constraint, or behavioral feature. Established as Phase 27 convention starting in 27-03; subsequent plans follow without re-deciding.
**Source:** 27-03 / 27-04 / 27-05 SUMMARY commit logs

---

### `tsx + fileURLToPath(import.meta.url)` ESM-CJS Reconciliation
In `tsx`-executed scripts living in `"type": "commonjs"` host packages, write code in ESM-shape and replace bare `__dirname` with `fileURLToPath(import.meta.url)`. Avoid top-level await; wrap in `async main()`.

**When to use:** Any new `pnpm tsx` script in `apps/blakepetersen.io` (or other CJS-rooted packages). Standard recipe.
**Source:** 27-06-codemod-harness-SUMMARY.md (Deviations #1), 27-07-perf-baseline-SUMMARY.md (Deviations #1)

---

### Numbered Migration Discovery Convention
Codemod harness discovers migrations from `scripts/migrations/<NNN>-<name>.ts` via `fs.readdirSync` filtered by `/^\d{3}-[a-z0-9-]+\.ts$/`. Each exports `{ name, description, run(contentRoot) }`. Deterministic ordering by prefix; zero shell-injection surface.

**When to use:** When Migration #001 lands in Phase 28+, follow this contract. Future tightening: `run({ contentRoot, dryRun })` instead of harness-side dry-run synthetic-print.
**Source:** 27-06-codemod-harness-SUMMARY.md (Accomplishments + follow-up note)

---

### Workspace Package Should Build to dist/ When Any Consumer Hits Node ESM Directly
If even one consumer of a workspace package goes through Node ESM at runtime (rather than a bundler), the package must compile to portable JS. Raw `./src/index.ts` exposure works only as long as every consumer runs inside a bundler.

**When to use:** Apply by default to any new workspace library. The decision flag: "could a consumer ever `import('this-package')` at runtime in plain Node?" If yes, ship dist/.
**Source:** Commit `5e9e055` (post-merge follow-up to 27-02's deferred-item flag)

---

## Surprises

### Plan 27-02: Velite Resolution Bypassed Esbuild's Workspace Walk
Plan 27-02 RESEARCH Q2 conflated tsup-bundled and Velite-loaded code paths — Velite uses esbuild only for the config file itself, leaving workspace deps to Node ESM. Triggered an Option A → Rule 4 → Rule 3 escalation during execution.

**Impact:** Required Blake-approved scope expansion to add `.ts` extensions to blink-registry re-exports + promote `allowImportingTsExtensions: true` + `noEmit: true` to base tsconfig. The "fix" silently relied on Node 24's experimental TS stripping.
**Source:** 27-02-blink-registry-import-SUMMARY.md (Deviations #1)

---

### Plan 27-04: RESEARCH-Q4 Lookup Pattern Was Buggy
RESEARCH.md Q4's reference snippet built per-collection Sets via `i.slug.split('/').pop()`, but the lookup key was the full path-shaped slug. Real content has nested skill paths that would have produced false-positive misses.

**Impact:** Caught at impl time before landing. If shipped as written, the cross-ref validator would have failed every existing nested-path skill. Fix-forward, no regression in production content.
**Source:** 27-04-cross-ref-validator-SUMMARY.md (Deviations #1)

---

### Plan 27-05: Manifest Key-Ordering Churn on Every Build
Logged in `deferred-items.md` as cosmetic during execution. Verifier ran a consecutive-build idempotency check and confirmed every `pnpm velite` invocation produced a dirty `.artifact-versions.json` — violating the D-06 "diffable in PRs" contract, not just visual noise.

**Impact:** Phase 27 verdict slipped from 8/8 PASS to 7/8 PASS / 1/8 PARTIAL. Closed inline (`1874213`) by sorting keys before stringify and adding a determinism assertion to `phase27-manifest-shape.test.ts`.
**Source:** 27-VERIFICATION.md (SCHEMA-08 PARTIAL → PASS arc)

---

### Plans 27-06 / 27-07: Top-Level Await + Bare `__dirname` Failed Under tsx ESM
Both plans' reference snippets used CJS-shape patterns that tsx couldn't execute. esbuild rejects top-level await in CJS output; bare `__dirname` is undefined in tsx's ESM-shape output. Both plans hit the same failure mode independently.

**Impact:** Each fixed in-flight by switching to `async main()` + `fileURLToPath(import.meta.url)`. Now Phase 27's standard recipe (Patterns above).
**Source:** 27-06-codemod-harness-SUMMARY.md, 27-07-perf-baseline-SUMMARY.md (both Deviations #1)

---

### Plan 27-01: Plan-00 Runner Had Two Latent Bugs Blocking Failure-Path Tests
The runner shipped from 27-00 hit `ERR_PNPM_RECURSIVE_EXEC_NO_PACKAGE` (fixture cwd lacks `package.json`) AND missed the `--strict` CLI flag (Velite's `defineConfig` strict option doesn't control exit codes). The failure-path test in 27-01 was the first to invoke the runner against a real failure scenario, surfacing both bugs.

**Impact:** 27-01 fix-forwarded both — direct binary invocation + `--strict` flag. The runner's API was set in 27-01, not 27-00, despite the runner file being delivered in 27-00.
**Source:** 27-01-voice-and-requires-artifact-SUMMARY.md (Deviations #1)

---

### Local-vs-Vercel Node Version Drift Hid the Real `.ts`-Extension Bug
Plan 27-02's Option A fix made local builds work because Node 24.14.0 strips TS at runtime by default. Vercel uses Node 22.x. The same import that resolved locally crashed `import('blink-registry')` in Node ESM resolution on the first preview deploy.

**Impact:** Required the architectural fix that should have been Phase 27's Option B from the start: build `blink-registry` to dist/ via tsup. Caught by Vercel CI immediately after the merge attempt; closed by `5e9e055`. **Lesson code:** verify against the actual deploy environment, not just local build.
**Source:** Commit `5e9e055` (post-merge fix), Vercel deployment logs (dpl_GK6vr72k7XTZaLvtoJabfF27ptfW failed; dpl_PK7Nv5yn45umqt6hFDvhEwG4BXVh succeeded)

---

### Test Worker Flakiness in `command-palette.test.tsx` + `modal.test.tsx` Surfaced Under Turbo
A single `pnpm test` (turbo) run produced 4 failures in 1 suite (React-testing-library renders); the next direct `pnpm --filter blakepetersen.io test` passed all 249 tests. Pre-existing React 19 + jsdom timing issue, unrelated to Phase 27 code.

**Impact:** Adds noise to phase-end verification but doesn't gate Phase 27's correctness. Logged for awareness; flake reproduction + fix is out of scope.
**Source:** Conversation transcript during post-merge verification; not in any phase artifact
