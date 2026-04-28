---
phase: 27-schema-foundations
verified: 2026-04-26T00:00:00Z
status: passed
score: 8/8 requirements verified (SCHEMA-08 PARTIAL → PASS after inline gap closure 2026-04-28)
overrides_applied: 0
gaps:
  - truth: "prose-only edits do not bump artifact CalVer across consecutive builds on the same machine"
    status: partial
    reason: "The CalVer hash gate is correctly implemented and non-determinism is hashes/versions only (none change). However the manifest key ordering is non-deterministic across runs — prettier-config and husky-lint-staged swap positions on every build — producing spurious git diffs on .artifact-versions.json after any pnpm velite or pnpm build invocation. This means the manifest cannot be committed to a clean working tree after any build without always having a diff, which breaks the D-06 contract ('diffable in PRs') and makes CI diff-detection unreliable."
    artifacts:
      - path: "apps/blakepetersen.io/velite.config.ts"
        issue: "updatedVersionManifest populated from separate singles and multis loops in insertion order; JSON.stringify preserves insertion order which varies between runs. No sort before writeFileSync."
      - path: "apps/blakepetersen.io/content/.artifact-versions.json"
        issue: "Committed manifest does not survive a single pnpm velite run without churn (confirmed live: husky-lint-staged and prettier-config swap on every invocation)"
    missing:
      - "Sort manifest keys alphabetically before JSON.stringify in the prepare hook writeFileSync call — 3 LOC per the deferred-items.md suggested fix"
      - "Add a consecutive-run determinism assertion to phase27-manifest-shape.test.ts (or a dedicated test): run velite once, capture manifest bytes, run velite again, assert bytes are identical — this is the CI safety net that was flagged in VALIDATION.md Manual-Only Verifications but never automated"
human_verification: []
---

# Phase 27: Schema Foundations — Verification Report

**Phase Goal:** Lock the `dxFields` Velite schema, slug invariants, cross-reference integrity, CalVer behavior, ESM debt, and build-perf baseline before any v1.4 content authoring begins.
**Verified:** 2026-04-26
**Status:** GAPS FOUND (1 PARTIAL)
**Re-verification:** No — initial verification

---

## Overall Phase Verdict

**7 of 8 requirements PASS. SCHEMA-08 is PARTIAL.**

The schema surface is locked and correct. All build-time invariants enforce as specified. The single gap is a manifest key-ordering non-determinism that was correctly identified during execution (deferred-items.md), correctly classified as cosmetic, but the severity assessment is wrong: every `pnpm velite` or `pnpm build` invocation produces a dirty `content/.artifact-versions.json` that must be reverted or re-committed. The D-06 "diffable in PRs" guarantee and the VALIDATION.md consecutive-run idempotency check are both violated by this.

---

## Requirement-by-Requirement Verdicts

### SCHEMA-01: `voice` field on dxFields — PASS

**Evidence:**
- `velite.config.ts:37` — `voice: s.array(s.enum(['author-note', 'decision-rationale'])).default([])`
- D-17 wording honored exactly: array, enum, empty-array default
- `phase27-voice-field.test.ts` — 2 tests: fixture with `voice: ['author-note']` exits 0 and round-trips through `.velite-fixture/skills.json`; fixture with invalid voice value exits non-zero with "voice" in stderr
- `frontmatter-schema.test.ts` — extended with `test.each` matrix: 4 collections × 2 fields; all 8 entries expose `voice` as an array
- Full test suite: 26/26 phase27 tests green; 248/248 full suite green

**Verdict: PASS**

---

### SCHEMA-02: `requires_artifact` boolean on dxFields — PASS

**Evidence:**
- `velite.config.ts:38` — `requires_artifact: s.boolean().default(false)`
- D-18 wording honored: boolean, `false` default
- Covered by the same `frontmatter-schema.test.ts` `test.each` matrix as SCHEMA-01 (4 collections × `requires_artifact` present and boolean)
- All 11 existing DX entries continue to validate without frontmatter changes

**Verdict: PASS**

---

### SCHEMA-03: Per-collection slug uniqueness — PASS (with documented deviation)

**Evidence:**
- `velite.config.ts:57-73` — `pathSlugWithCollectionDedup(collection)` helper + `dxSchemaFor(collection)` factory wired to all four DX collections (skills, hooks, configs, guides) at lines 95, 101, 107, 113
- Duplicate-slug fixture exits non-zero, names both offending file paths, names the bare slug `'foo'`, and includes "duplicate" in stderr — all 4 assertions green
- D-19 literal wording ("swap to `s.slug('<collection>')`") was not followed; instead, `s.path().superRefine` reuses Velite's own `meta.config.cache` for per-collection namespaced dedup
- **Deviation defensibility:** `s.slug('<collection>')` in Velite returns a bare slug, which would break every consumer of the path-shaped `entry.slug` (route handlers, `dxSchema.transform`'s category fallback, `.velite/skills.json` readers). The deviation preserves D-19's substance (duplicate bare-slug detection per collection) while keeping the path-shaped value. The SUMMARY correctly documents this. CONTEXT.md explicitly marks this implementation detail as "Claude's Discretion."
- The internal `meta.config.cache` dependency is a pinned-version risk, but it is documented and has a canary test

**Verdict: PASS (deviation from D-19 letter, honors D-19 substance; defensible and documented)**

---

### SCHEMA-04: Cross-reference integrity — PASS (with field-name note)

**Evidence:**
- `velite.config.ts:228-284` — cross-reference validator block walks `dependencies` and `related` arrays (per D-01), builds per-collection `Set<pathSlug>`, accumulates all broken refs, throws once with count + list (per D-04)
- Three discriminated failure modes: invalid format, unknown collection, target not found
- Dangling-cross-ref fixture: exits non-zero, contains the offending ref string, "dependencies", "Broken cross-references" — all assertions green
- Valid-cross-ref fixture: exits 0 (cross-collection refs allowed per D-02)
- Real content: all 16 DX entries pass (no false-positive dangling refs from nested slug paths — the `.pop()` bug in RESEARCH.md Q4 was fixed before landing)

**Field-name note (documentation defect, not a requirement failure):** REQUIREMENTS.md SCHEMA-04 says "every `requires:` cross-reference" but the actual validated fields are `dependencies` and `related` (per D-01, which correctly excludes `decisions`). There is no `requires:` field in the DX schema — this is a requirements-text imprecision. The implemented behavior is the right behavior per CONTEXT.md decisions.

**Verdict: PASS**

---

### SCHEMA-05: blink-registry direct import — PASS (with package-name note)

**Evidence:**
- `velite.config.ts:21-26` — imports `SlugSchema`, `CalVerSchema`, `ArtifactTypeSchema`, `MergeStrategySchema` from `'blink-registry'`
- `grep slugPattern|calverPattern|validTypes|validMerges velite.config.ts` → 0 matches (inline duplicates removed)
- `phase27-registry-import.test.ts` — 6 tests: grep regression (inline declarations absent, import present with all four names) + Zod-shape sanity for all four schemas — all 6 green
- Blake-approved Option A (mechanical `.ts` extension fix on blink-registry re-exports) enabled Node ESM strict resolution; `packages/tsconfig/base.json` gained `allowImportingTsExtensions: true` + `noEmit: true`

**Package-name note (documentation defect, not a requirement failure):** REQUIREMENTS.md SCHEMA-05 says `@blink-dx/registry` but the actual package is `blink-registry` (confirmed via `packages/blink-registry/package.json`). This is a requirements-text naming error — the intent is clear and the implementation is correct.

**Pre-existing non-blocking warning:** Every `velite build` prints `Reparsing as ES module because module syntax was detected. To eliminate this warning, add "type": "module" to .../packages/blink-registry/package.json.` This is a cosmetic Node warning logged in deferred-items (from plan 27-04), not a correctness issue. No correctness impact; blink-registry loads and exports correctly.

**Verdict: PASS**

---

### SCHEMA-06: Codemod harness skeleton — PASS

**Evidence:**
- `apps/blakepetersen.io/scripts/migrate-content.ts` — exists, has `// ABOUTME:` header, implements `--list` / `--dry-run <name>` / positional execute flag vocabulary (D-16), discovers migrations via `fs.readdirSync` + `/^\d{3}-[a-z0-9-]+\.ts$/` regex (D-15), validates `{ name, description, run }` export shape
- `apps/blakepetersen.io/scripts/migrations/000-noop.ts` — exists, exports `{ name: '000-noop', description, run }` returning `{ filesChanged: 0 }`
- `pnpm --filter blakepetersen.io migrate --list` → exits 0, shows `000-noop\tNo-op placeholder migration...`
- `pnpm --filter blakepetersen.io migrate --dry-run 000-noop` → exits 0, shows `[dry-run] filesChanged: 0`
- `phase27-migrate-harness.test.ts` — 3 tests: `--list` shows 000-noop, `--dry-run 000-noop` exits 0, `--dry-run nonexistent` exits non-zero
- Build isolation verified: no "migrate"/"Running 000-noop" in `pnpm build` stdout

**Note on dry-run contract:** The current `--dry-run` short-circuits BEFORE calling `migration.run()` (prints synthetic output). This is correct for a skeleton-only deliverable but must be addressed when Migration #001 lands. The SUMMARY documents this explicitly as a follow-up contract for Phase 28+.

**Verdict: PASS**

---

### SCHEMA-07: Build-perf baseline — PASS

**Evidence:**
- `.planning/intel/build-perf-baseline.json` — exists, committed, git-tracked
- JSON keys: `capturedAt` (ISO 8601), `nodeVersion` (v24.14.0), `contentCount` (23), `metrics.fullBuildWallMs` (12456.79), `metrics.veliteWallMs` (3509.55), `metrics.webpackCompileMs` (6300), `metrics.nextDevReadyMs` (181)
- All four D-09 metrics present; D-10 storage path honored; D-12 metadata (nodeVersion, contentCount, capturedAt) present
- `phase27-perf-baseline.test.ts` — 8 shape-only assertions, all green
- VALIDATION.md manual sign-off: `fullBuildWallMs < 60000` (12.5s), `nextDevReadyMs < 10000` (181ms), values are internally consistent (3.5 + 6.3 + ~2.7 overhead ≈ 12.5s)
- `pnpm --filter blakepetersen.io perf:baseline` script in package.json (line 31)

**Verdict: PASS**

---

### SCHEMA-08: Content-hash CalVer gate — PARTIAL

**Evidence of implementation (correct):**
- `velite.config.ts:341-445` — hash gate present: loads `priorVersionManifest`, computes SHA-256 hex of distributed payload, short-circuits to prior version on hash match, calls `deriveCalVer` only on hash change, writes `updatedVersionManifest` after artifact validation
- `node:crypto createHash` import at line 4; `sha256Hex` helper at line 356
- D-05 (hash scope), D-06 (git-tracked manifest), D-07 (daily counter advance only on hash change), D-08 (SHA-256 hex) — all implemented
- `content/.artifact-versions.json` — exists, 8 entries (5 singles + 3 multis), each with 64-char hex hash and CalVer version, NOT gitignored (confirmed via `git check-ignore` exit 1)
- `phase27-calver-hash-gate.test.ts` (1 test, ~14s) — three-step: baseline, frontmatter-only edit (version reused), body edit (hash changes); passed
- `phase27-manifest-shape.test.ts` (3 tests) — file exists, every entry has valid hash + CalVer, slug coverage matches `public/r/index.json`

**Evidence of gap (non-determinism):**
- Consecutive `pnpm velite` runs produce different manifest key ordering: `husky-lint-staged` and `prettier-config` swap positions on every run
- Confirmed live during verification: first run post-restore produces `index 6a4c930..2e139c4` diff (ordering only, hashes/versions identical)
- Same churn after `pnpm build`
- `updatedVersionManifest` is built as a plain `{}` object; singles loop (`data.singleArtifacts`) and multis loop (`data.multiArtifacts`) run in Velite's own materialization order which is not guaranteed stable
- Manifest is NOT sorted before `JSON.stringify` call

**Why this is PARTIAL not PASS:**
- The hash gate's core correctness guarantee holds (same payload bytes → same version)
- But the D-06 guarantee ("diffable in PRs") is violated: every pnpm velite run produces a modified working tree that must be manually reverted or re-committed
- The VALIDATION.md Manual-Only Verifications row says "two consecutive `pnpm velite` runs → `git diff --exit-code` should be empty" — this check FAILS live
- The consecutive-run idempotency test was never added to the Jest suite (VALIDATION.md correctly flags this as a manual check, but given the live failure it should be automated)
- deferred-items.md correctly identifies the root cause and the 3-LOC fix, but classifies severity as "Cosmetic" — underestimating the operational impact on committers who run velite before PRs

**Verdict: PARTIAL**

---

## Artifact Existence and Wiring

| Artifact | Exists | Substantive | Wired | Status |
|---|---|---|---|---|
| `velite.config.ts` — `dxFields` voice+requires_artifact | Yes | Yes | Yes (all DX collections) | VERIFIED |
| `velite.config.ts` — `pathSlugWithCollectionDedup` + `dxSchemaFor` | Yes | Yes | Yes (4 collections) | VERIFIED |
| `velite.config.ts` — cross-ref validator block | Yes | Yes | Yes (prepare hook) | VERIFIED |
| `velite.config.ts` — blink-registry imports | Yes | Yes | Yes (4 schemas used) | VERIFIED |
| `velite.config.ts` — hash gate + sha256Hex | Yes | Yes | Yes (prepare hook, singles+multis) | VERIFIED |
| `content/.artifact-versions.json` | Yes | Yes (8 entries) | Yes (git-tracked, not gitignored) | VERIFIED (key-ordering gap) |
| `scripts/migrate-content.ts` | Yes | Yes | Yes (pnpm migrate script) | VERIFIED |
| `scripts/migrations/000-noop.ts` | Yes | Yes | Yes (discovered by harness) | VERIFIED |
| `.planning/intel/build-perf-baseline.json` | Yes | Yes (4 metrics) | Yes (pnpm perf:baseline) | VERIFIED |
| `tests/phase27-voice-field.test.ts` | Yes | Yes (2 tests) | Yes (passes) | VERIFIED |
| `tests/phase27-duplicate-slug.test.ts` | Yes | Yes (4 assertions) | Yes (passes) | VERIFIED |
| `tests/phase27-dangling-cross-ref.test.ts` | Yes | Yes (2 tests) | Yes (passes) | VERIFIED |
| `tests/phase27-registry-import.test.ts` | Yes | Yes (6 tests) | Yes (passes) | VERIFIED |
| `tests/phase27-calver-hash-gate.test.ts` | Yes | Yes (3-step scenario) | Yes (passes) | VERIFIED |
| `tests/phase27-manifest-shape.test.ts` | Yes | Yes (3 tests) | Yes (passes) | PARTIAL — does not catch key-ordering churn |
| `tests/phase27-migrate-harness.test.ts` | Yes | Yes (3 tests) | Yes (passes) | VERIFIED |
| `tests/phase27-perf-baseline.test.ts` | Yes | Yes (8 assertions) | Yes (passes) | VERIFIED |

---

## Decision Compliance: D-01 through D-20

| Decision | Honored | Notes |
|---|---|---|
| D-01 (validate dependencies+related, not decisions) | Yes | velite.config.ts:252 iterates `['dependencies', 'related'] as const` |
| D-02 (cross-collection refs allowed) | Yes | valid-cross-ref fixture tests this; no collection restriction in validator |
| D-03 (`<collection>/<slug>` format, split on first /) | Yes | `slashIndex = ref.indexOf('/')`, compare full-path-slug to Set |
| D-04 (accumulate then throw once) | Yes | `brokenRefs[]` array + single `throw new Error` with count+list |
| D-05 (hash distributed payload only) | Yes | singles=`artifact.body`, multis=`files.map(f=>f.content).join('')` |
| D-06 (manifest git-tracked at content/.artifact-versions.json) | Partial | File exists and is not gitignored; but key-ordering churn means every velite run modifies it, undermining "diffable in PRs" |
| D-07 (daily counter advances only on hash change) | Yes | manifest reuse path confirmed by calver-hash-gate test |
| D-08 (SHA-256 hex, full digest) | Yes | `createHash('sha256').update(payload).digest('hex')` |
| D-09 (4 metrics: cold build, velite-only, webpack, warm dev) | Yes | All 4 present in baseline JSON |
| D-10 (baseline at .planning/intel/build-perf-baseline.json) | Yes | File committed |
| D-11 (manual pnpm perf:baseline script, run once at end of phase) | Yes | Script exists, used, baseline committed in 27-07 |
| D-12 (metadata: nodeVersion + contentCount + capturedAt) | Yes | All 3 in baseline JSON |
| D-13 (vanilla tsx invocation, no new framework dep) | Yes | `tsx scripts/migrate-content.ts`, tsx in devDeps |
| D-14 (harness at apps/blakepetersen.io/scripts/migrate-content.ts) | Yes | File exists at that path |
| D-15 (migrations in scripts/migrations/<NNN>-<name>.ts, each exports {name,description,run}) | Yes | Pattern implemented; 000-noop conforms |
| D-16 (--dry-run + --list flags) | Yes | Both implemented and tested |
| D-17 (voice: array(enum([...])).default([])) | Yes | velite.config.ts:37 exact match |
| D-18 (requires_artifact: boolean.default(false)) | Yes | velite.config.ts:38 exact match |
| D-19 (slug('<collection>') or equivalent per-collection dedup) | Partial per letter, full per substance | s.path()+superRefine instead of s.slug(); substance (per-collection dedup + build failure) fully met; path-shaped slug preserved for consumers |
| D-20 (import from blink-registry, remove inline duplicates) | Yes | Import at line 26; no inline pattern declarations remain |

---

## Test Suite Summary

| Test File | Tests | Status |
|---|---|---|
| `phase27-voice-field.test.ts` | 2 | PASS |
| `phase27-duplicate-slug.test.ts` | 1 | PASS |
| `phase27-dangling-cross-ref.test.ts` | 2 | PASS |
| `phase27-registry-import.test.ts` | 6 | PASS |
| `phase27-calver-hash-gate.test.ts` | 1 | PASS |
| `phase27-manifest-shape.test.ts` | 3 | PASS (does not detect key-ordering churn) |
| `phase27-migrate-harness.test.ts` | 3 | PASS |
| `phase27-perf-baseline.test.ts` | 8 | PASS |
| **Phase 27 total** | **26** | **26/26 PASS** |
| **Full suite** | **248** | **248/248 PASS** |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Build exits 0 | `pnpm --filter blakepetersen.io build` | Exit 0 | PASS |
| Typecheck exits 0 | `pnpm --filter blakepetersen.io typecheck` | Exit 0 | PASS |
| `pnpm migrate --list` shows 000-noop | `pnpm --filter blakepetersen.io migrate --list` | "000-noop\tNo-op placeholder..." | PASS |
| `pnpm migrate --dry-run 000-noop` exits 0 | `pnpm --filter blakepetersen.io migrate --dry-run 000-noop` | Exit 0, "[dry-run] filesChanged: 0" | PASS |
| Velite exits 0 on real content | `pnpm --filter blakepetersen.io velite` | Exit 0 in 3272ms | PASS |
| Consecutive velite runs byte-identical | Two consecutive velite runs + `git diff .artifact-versions.json` | FAIL — husky-lint-staged and prettier-config swap positions on every run | FAIL |

---

## Anti-Patterns

| File | Pattern | Severity | Impact |
|---|---|---|---|
| `velite.config.ts` | `updatedVersionManifest` populated in insertion order with no sort before writeFileSync | Blocker for D-06 contract | Every pnpm velite run produces a dirty working tree; affects committers and CI diff checks |
| `packages/blink-registry/package.json` | Missing `"type": "module"` causing Node ESM reparse warning on every velite run | Warning (pre-existing, deferred) | No correctness impact; cosmetic noise in build output |

---

## REQUIREMENTS.md Traceability Drift — Documentation Defect

The REQUIREMENTS.md traceability table has a systematic drift from the upper requirement checkboxes:

| Requirement | Upper checkbox | Traceability table | Correct status |
|---|---|---|---|
| SCHEMA-01 | `[x]` (complete) | Pending | Should be Complete |
| SCHEMA-02 | `[x]` (complete) | Pending | Should be Complete |
| SCHEMA-03 | `[x]` (complete) | Complete | Correct |
| SCHEMA-04 | `[x]` (complete) | Pending | Should be Complete |
| SCHEMA-05 | `[x]` (complete) | Pending | Should be Complete |
| SCHEMA-06 | `[x]` (complete) | Pending | Should be Complete |
| SCHEMA-07 | `[x]` (complete) | Complete | Correct |
| SCHEMA-08 | `[x]` (complete) | Pending | Should be Partial (implementation gap) |

The pattern suggests the plan summaries for 27-01, 27-02, 27-04, 27-05, 27-06 updated the upper checkboxes but not the lower traceability table. This is a documentation defect, not a SCHEMA-* requirement failure.

Additionally, two minor wording errors in REQUIREMENTS.md (not requirement failures):
- SCHEMA-04: says "every `requires:` cross-reference" but the validated fields are `dependencies` and `related` (no `requires:` field exists in dxFields — per D-01, this was an early planning-time name that was corrected in CONTEXT.md)
- SCHEMA-05: says `@blink-dx/registry` but the actual package name is `blink-registry`

---

## Gap Closure Recommendation

### SCHEMA-08: Manifest key-ordering fix (3 LOC + 1 test)

**Root cause:** `updatedVersionManifest` object keys are written in insertion order (singles before multis, each in Velite's materialization order). Velite's materialization order of singleArtifacts vs multiArtifacts is not guaranteed stable across builds.

**Recommended fix (from deferred-items.md, confirmed correct):**

In `apps/blakepetersen.io/velite.config.ts`, before the `fs.writeFileSync(versionManifestPath, ...)` call:

```typescript
// Sort manifest keys alphabetically for stable git diffs (D-06)
const sortedManifest = Object.fromEntries(
  Object.entries(updatedVersionManifest).sort(([a], [b]) => a.localeCompare(b))
)
fs.writeFileSync(
  versionManifestPath,
  JSON.stringify(sortedManifest, null, 2) + '\n',
)
```

**Recommended test addition** in `tests/phase27-manifest-shape.test.ts`:

Add a consecutive-run determinism test: run `pnpm velite` (via spawnSync), capture manifest bytes from `content/.artifact-versions.json`, run `pnpm velite` again, assert bytes are identical. This automates the VALIDATION.md manual check that was listed as a manual-only verification.

**Effort estimate:** ~15 minutes. No new dependencies, no new files, no scope creep.

**This gap is a clear follow-up to plan 27-05's territory** and can be addressed as a gap-closure plan targeting the single deferred item in deferred-items.md.

---

## Deferred Items (Informational)

| Item | Addressed In | Evidence |
|---|---|---|
| `packages/blink-registry/package.json` `"type": "module"` to eliminate Node ESM reparse warning | Future cleanup (no phase assigned) | Logged in 27-04 deferred-items section of SUMMARY; correctness unaffected |
| dry-run contract for Migration #001 | Phase 28+ | 27-06 SUMMARY documents follow-up contract for whoever lands migration #001; skeleton behavior is correct for Phase 27 scope |

---

## Post-verification gap closure (2026-04-28)

Inline patch landed against the SCHEMA-08 PARTIAL gap and the REQUIREMENTS.md
traceability drift flagged in this report.

**SCHEMA-08 closure (commit `1874213`):**
- `velite.config.ts` — sort top-level keys with stable ASCII comparator before
  `JSON.stringify` of the version manifest. 6 LOC delta.
- `tests/phase27-manifest-shape.test.ts` — added a determinism assertion
  ("emits keys in lexicographic order"). Suite is now 4/4 (was 3/3).
- Live verification: two consecutive `pnpm velite` runs produce byte-identical
  `content/.artifact-versions.json`. D-06 "diffable in PRs" contract restored.
- VALIDATION.md consecutive-run idempotency requirement now satisfied.

**Traceability drift closure (commit `98283f1`):**
- `.planning/REQUIREMENTS.md` — flipped 6 rows (SCHEMA-01, -02, -04, -05, -06,
  -08) from "Pending" to "Complete" in the lower traceability table. SCHEMA-03
  and SCHEMA-07 were already correct from earlier plan summaries.

**Updated verdict:** 8/8 PASS. Phase 27 ready for ship.

_Verified: 2026-04-26_
_Verifier: Claude (gsd-verifier)_
_Gap closure: 2026-04-28_
