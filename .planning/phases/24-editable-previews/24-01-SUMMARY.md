---
phase: 24-editable-previews
plan: 1
status: complete
requirements: [ARTAX-08]
verdict: pass
---

# 24-01 Summary — react-live React 19 compat spike

## Verdict

**PASS.** react-live 4.1.8 renders artax-ui's `Button` under React 19 from both narrow (`{ Button }`) and wildcard (`{ ...artaxUI }`) scopes. Plan 24-06 (JSX editor integration) is unblocked.

## Evidence

**Open Question 1 (React 19 JSX-transform warning):**
- Dev: fires as `"Your app (or one of its dependencies) is using an outdated JSX transform"` from react-live's sucrase-eval path (`VM158:3` via `exports.createElement`). Once per LiveProvider on initial transpile.
- Prod (`pnpm --filter artax build`): **not emitted.** 22 static pages generated cleanly; only an unrelated Turbopack NFT trace warning on `next.config.ts` via `token-registry.ts`.
- Classification: dev-only warning, benign.

**Open Question 2 (artax-ui wildcard scope tree-shaking):**
- `Object.keys(artaxUI).length = 68` — wildcard spread pulls in 68 named exports.
- First Load JS measurement skipped: Next.js 16 Turbopack build does not emit per-route size table by default, and the export count alone is decisive for the recommendation.

## Scope strategy recommendation for 24-06

**Enumerate named exports per component.** Use `scope: { Button }` (per-component binding) rather than `scope: { ...artaxUI }`. 68 exports is too large a surface area to spread; enumerating preserves tree-shaking predictability and prevents future artax-ui additions from silently leaking into every Playground bundle.

## Warning handling guidance for 24-06

Tolerate the dev-only JSX-transform warning. Do not suppress via `transformCode` — a silent warning is worse than a visible one, and upstream react-live PR #406 is expected to modernize the transform. Monitor, don't patch.

## Incidental findings

A pre-existing hydration mismatch fires from `apps/artax/src/components/header.tsx:17` (Radix Dialog mobile-nav trigger) on every route in the app. **Not caused by the spike**, not a blocker, recommend filing as a separate bug.

## Key files

**Created (during spike, then deleted on PASS):**
- `apps/artax/src/app/spike-react-live-compat/page.tsx` — throwaway spike route (removed after verdict)

**Modified:**
- `apps/artax/package.json` — added `react-live: ^4.1.8` dependency (retained — downstream plans need it)
- `pnpm-lock.yaml` — lockfile update for react-live + sucrase sub-deps

**Written:**
- `.planning/phases/24-editable-previews/24-01-SPIKE-RESULT.md` — full verdict with evidence

**Updated:**
- `.planning/STATE.md` — react-live compat blocker marked resolved

## Recovery notes

This plan's Task 1 was initially executed in a `EnterWorktree` worktree that was created from `origin/main` (9 commits behind local `main`), producing an unmergeable tree that would have deleted all phase 23/24 planning work. Recovery: cherry-picked the three clean additions (`package.json`, `pnpm-lock.yaml`, spike route) onto main as commit `fd5ff48`, removed the broken worktree + 8 stale worktree-agent branches, and disabled `workflow.use_worktrees` for the project. See `feedback_worktrees_origin_divergence.md` in Claude's project memory for the root-cause analysis. Follow-up rename `_spike` → `spike-react-live-compat` (commit `26d2dd5`) was also needed because Next.js App Router treats `_`-prefixed folders as private and excludes them from routing.

## Self-Check

- [x] Both Buttons rendered visually
- [x] Console evidence captured for Open Question 1
- [x] `Object.keys(artaxUI).length` captured for Open Question 2
- [x] Prod build output captured
- [x] VERDICT recorded (PASS)
- [x] Spike route deleted after verdict
- [x] Typecheck passes post-deletion
- [x] STATE.md blocker updated
