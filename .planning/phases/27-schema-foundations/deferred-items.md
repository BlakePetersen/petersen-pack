# Phase 27 — Deferred Items

Issues discovered during execution that are out of scope for the current plan.

## From 27-07 (perf-baseline)

### Manifest key ordering non-determinism

**Discovered:** 2026-04-28 (during 27-07 baseline build)

**Symptom:** Re-running `pnpm build` reorders entries in `apps/blakepetersen.io/content/.artifact-versions.json` (e.g., `prettier-config` and `husky-lint-staged` swapped positions) without any hash or version change. Pure ordering churn.

**Source plan:** 27-05 (`calver-hash-gate`) — the manifest writer at the end of the velite `prepare` hook iterates over a Map/object and writes entries in insertion order; insertion order depends on the order Velite materializes singles vs multis between runs.

**Why deferred:** Out of scope for 27-07 (perf baseline). Not a correctness bug — diffs are clean modulo ordering. Belongs as a small follow-up to plan 27-05's territory: sort manifest keys alphabetically before `JSON.stringify` to make the file diff-stable.

**Suggested fix (~3 LOC):**
```ts
// In velite.config.ts prepare hook, before fs.writeFileSync:
const sorted = Object.fromEntries(
  Object.entries(updatedManifest).sort(([a], [b]) => a.localeCompare(b))
)
fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + '\n')
```

**Severity:** Cosmetic. PR diffs of `.artifact-versions.json` may show false-positive reorder churn, which adds noise but doesn't affect builds, registry output, or v1.5+ regression checks.
