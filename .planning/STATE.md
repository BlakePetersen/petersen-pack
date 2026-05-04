---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Content Density
status: verifying
stopped_at: Completed 28-06-PLAN.md (Phase 28 complete)
last_updated: "2026-05-04T20:54:55.991Z"
last_activity: 2026-05-04
progress:
  total_phases: 7
  completed_phases: 2
  total_plans: 14
  completed_plans: 14
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-24)

**Core value:** Developers can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source
**Current focus:** Phase 28 — authoring-scaffolds-lint-port

## Current Position

Phase: 28 (authoring-scaffolds-lint-port) — EXECUTING
Plan: 6 of 6
Status: Phase complete — ready for verification
Last activity: 2026-05-04

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- v1.0: 20 plans in ~3 days
- v1.1: 9 plans in ~3 days
- v1.2: 23 plans in ~4 days
- v1.3: 27 plans in ~34 days
- Cumulative: 79 plans across 4 milestones, 26 phases shipped

## Accumulated Context

### Decisions

- **21-01:** Direct file imports in barrel (no tier-level index.ts files)
- **21-01:** import-x/no-cycle scoped to artax-ui only with maxDepth 3
- **21-02:** Legacy --color-terminal-* tokens kept in @theme until Plan 03 migration
- **21-02:** ThemeProvider uses useState + useEffect for simplicity (superseded by 22-01)
- **22-01:** next-themes as peerDependency since it requires Next.js runtime context
- **22-01:** ThemeProvider wrapper pre-configures attribute="data-theme" to prevent misconfiguration
- **22-02:** ThemeProvider imported from artax-ui (dogfooding the wrapper) rather than next-themes directly
- **22-02:** Component counts derived dynamically by parsing artax-ui barrel file comment markers
- **22-02:** Hidden sidebar placeholder in layout reserves space for Phase 23
- **21-03:** @theme inline used for semantic status color utility aliases
- **21-03:** Popover tokens for tooltip/dropdown, card tokens for dialog/callout
- **23-01:** Server/client split for component page to avoid function serialization across boundary
- **23-01:** Key-based remount pattern for drawer auto-close (lint-safe alternative to setState-in-effect)
- **23-01:** Placeholder registry with 2 components for testing; Plan 02 populates all 15
- **23-02:** Radix-backed previews (e.g., Tooltip) pass `children` inside props object to satisfy typed required-children signatures
- **23-03:** Scope-label drift — token-registry/tokens/page/swatch/specimen were delivered under `feat(23-01)` commits on 2026-03-28; reconciled in 23-03-SUMMARY.md rather than re-implemented
- **24-CONTEXT:** Library lane is `react-live@^4.1` behind a 30-min compat spike (24-01); fail path is **fix-forward**, not deferral (Blake, 2026-04-17 — research evidence supports confidence the spike will pass)
- **24-CONTEXT:** Hybrid surface — props-form (24-04/24-05) ships unconditionally; JSX editor (24-06) is gated on spike pass
- **24-CONTEXT:** URL state via `window.history.pushState` (NOT `router.replace`) to avoid RSC re-fetches per RESEARCH.md
- **24-PATTERNS:** Native `<select>` for string-literal-union props inside the Playground — avoids Radix portal conflicts
- **24-05:** Real-time prop→preview wiring deferred — requires extending `ComponentDef.preview(props)` signature; criterion #2 satisfaction routed through 24-06's JSX editor
- [Phase 24]: 24-02: Pure-module TDD pattern — test RED commit → feat GREEN commit; no refactor when initial impl already extracts named constants
- [Phase 24]: 24-02: URL state ownership is scoped to p[*] namespace; callers merge any non-playground query params themselves
- [Phase 24]: 24-02: Data-driven coercion test carries explicit EXPECTED_KIND_BY_TYPE table — new registry prop.type shapes fail loudly in review
- [Phase 24]: 24-03: Playground exclusion encoded by field omission (not enabled:false) — minimal data surface for the 4 excluded components; partition test catches drift
- [Phase 24]: 24-03: defaultExampleIndex intentionally unpopulated on all 11 enabled entries — index 0 is sensible default; YAGNI until 24-05 proves otherwise
- [Phase 24]: 24-04: corrected plan text setupFilesAfterEach -> Jest's actual option setupFilesAfterEnv (not a config key)
- [Phase 24]: 24-04: Radix Toggle tests use getByText instead of getByRole name (label wrap does not give button accessible name)
- [Phase 24]: 24-04: boolean prop values serialized to 'true'/'false' strings so Record<string,string> stays flat for URL encoding
- [Phase 24]: 24-05: Body-split gate pattern — outer component returns null on disabled, inner body owns all hooks (keeps rules-of-hooks clean)
- [Phase 24]: 24-05: Hand-rolled setTimeout-ref debounce (300ms) for URL pushes — single call site, no use-debounce dep
- [Phase 24]: 24-05: useSearchParams readonly bridged via new URLSearchParams(searchParams.toString()) for Next 16 typing
- [Phase 24]: 24-06: Scope enumeration (22 artax-ui names + React) — NOT wildcard spread — preserves tree-shaking per 24-01 spike Open Question 2
- [Phase 24]: 24-06: React-19 JSX-transform warning tolerated (not suppressed via transformCode) — dev-only, absent from prod build per 24-01 spike
- [Phase 24]: 24-06: JSX editor reset uses key={resetCounter} remount — LiveEditor owns its contenteditable buffer and ignores seed-prop changes post-mount
- [Phase 24]: 24-06: PrismThemeEntry does not accept fontFamily/fontSize — font applied via font-mono text-sm Tailwind classes on the editor wrapper instead
- [Phase 24]: Route tests .tsx not .ts (JSX under ts-jest requires .tsx); locality-of-intent partition duplication for drift detection
- [Phase 24 gap-closure]: preview(values) signature lets playground edits drive preview in real time — closes ARTAX-08 criterion #2 gap from 24-VERIFICATION. ComponentDef.preview signature widened from `(variant?: string)` to `(values?: Record<string, string>)`; 11 enabled components destructure from bag with `as` casts for literal unions and `=== 'true'` for booleans; 4 excluded components unchanged (structural subtyping). Supersedes the 24-05 deferral note above.
- [Phase 24.1]: 24.1-02: Radix-backed button primitives (Toggle) must not be `<label>` children — aria-label carries accessible name. Boolean branch of PlaygroundPropsForm switched from `<label><Toggle>` to `<div><Toggle aria-label={prop.name}>`; select/number/text branches untouched (real form controls, native label semantics are correct).
- [Phase 24.1]: 24.1-03: Mounted-flag gate on Radix primitives above the fold. SidebarDrawer wraps the Radix Dialog tree behind `useState(false) + useEffect(() => setMounted(true), [])`; SSR returns `{children}` verbatim so aria-controls (derived from @radix-ui/react-id useId) is absent from server output. Header remains a server component. Reusable pattern for any Radix primitive rendered in initial viewport (Tooltip, Popover, DropdownMenu) in Phase 25+.
- [Phase 24.1]: 24.1-03: Hydration-safety regression test pattern — `renderToString(<Component />)` + `.not.toMatch(/aria-controls="radix-/)` asserts the SSR contract invariant rather than chasing console.error patterns (RTL jsdom cannot replay SSR, so warning-spy tests are insufficient).
- [Phase 26]: 26-01: Modal is a composition over artax-ui Dialog (not a parallel Radix wrapper); mounted-flag SSR gate applied at the primitive boundary so every consumer inherits the fix automatically. Slot re-exports (Modal.Title/Description/Close) pointing at Dialog's tagged titles keep the a11y contract intact.
- [Phase 26]: 26-01: SSR regression assertion colocated in `modal.test.tsx` (not a separate hydration test file) — single-file contract reduces drift between render and SSR tests.
- [Phase 26]: 26-01: `next/link` is reachable from artax-ui's jest-jsdom context via pnpm hoisting; PrevNextNav keeps the direct `<Link>` import (not the asChild fallback) to preserve client-side transitions for bp.io consumers.
- [Phase 26]: 26-01: Any new `*.tsx` under `packages/artax-ui/src/components` must be registered in `tests/boundaries.test.ts` (server-safe vs client) in the same commit as the file itself — enforced by a coverage assertion.
- [Phase 26]: 26-03: PrevNextNav slot derivation follows `findBySlug(slug) → itemsByCollection[collection] → getPrevNext(items, found.item.href) → { href, label }` — NavItem.href is pre-built by `collectionToItems()` so consumers never reconstruct URLs. Resolution logic lifted verbatim from retired `page-navigation.tsx` into `dx-content-layout.tsx` and `post-layout.tsx`.
- [Phase 26]: 26-03: Skills Detail header recompose (H1 `text-3xl`, `max-w-[72ch]`) DEFERRED — `dx-content-layout.tsx` is shared across skills/hooks/configs/guides; cross-collection typography change needs its own Pencil-driven plan. Logged in 26-03-SUMMARY.md Deviations #1.
- [Phase 26]: 26-04: About recompose (SITE-05) — Badge meta row + interests grid, max-w-prose column, Lead-role mono prose, `$ email-blake`/`$ find-me-on-github` shell CTAs. AuthorNote skipped (Pencil MCP unavailable; no discrete personal-aside in current prose). TODO scaffolding preserved per D-01. GitHub URL canonical-cased to `BlakePetersen` (matches homepage).
- [Phase 26]: 26-04: D-07 smoke check deferred to phase-end batch per Plan 02/03 precedent. `// interests` chip list (6 secondary-variant labels) is the only executor-authored stub — Blake can edit post-D-07.
- [Phase 26]: 26-05: Start Here recompose (SITE-06) — `// start_here` mono hero + `font-mono-alt text-3xl` H1 + `$ start-here` anchor to `#steps`, numbered `<ol>` of `bg-card p-6 border-border` step cards with zero-padded `text-primary font-mono text-lg` numbers, per-step `$ go-to-{collection}` CTAs (uses `collection` field not slug — slugs are path-qualified), `// next` footer with `[skills]` / `[home]` bracket links. Reading column tightened from `max-w-[80ch]` to `max-w-[72ch]` per UI-SPEC rule. Data contract preserved: `steps` array + `resolveSteps()` getter signature unchanged; resolved-shape type extended additively with `collection: Step['collection']`. DecisionRationale skipped (Pencil MCP unavailable; per-step `why` is orientation rationale not a "why this stack" decision block). Hero copy editorial-authored — Blake can edit post-D-07.
- [Phase 26]: 26-06: Collection Listing factory recompose (SITE-07) — single edit to `createCollectionIndexPage` in `apps/blakepetersen.io/src/lib/collection-pages.tsx` propagates to all 5 listing routes (/configs /hooks /guides /skills /posts). New header: `// {slug}` mono caption + `font-mono-alt text-3xl` label H1 + `<Badge variant="secondary">{count}</Badge>` + `indexDescription(count)` paragraph. UI-SPEC empty-state branch (`items.length === 0`): `// empty_collection` + label H1 + `No entries yet. Check back, or contribute one → [contribute]` → `/start-here`. Row typography unified: `text-base font-medium text-foreground` titles; `font-mono text-base text-muted-foreground` descriptions; tag-pill `variant="secondary"` consumers preserved (pre=2 → post=3, additive count Badge only — Pitfall 5 guard). Server-component contract preserved (no `'use client'`). Per-route `page.tsx` files untouched.
- [Phase 26]: 26-06: Empty-state verification via deterministic unit test (`apps/blakepetersen.io/tests/lib/collection-pages.test.tsx`, 4 cases) that mocks `getCollection` to return `[]` and asserts on `renderToStaticMarkup(Page())` — replaces the destructive "temporarily empty content" manual step. Test pattern adaptation (deviation Rule 3): `JSON.stringify(tree)` pattern from `roadmap.test.tsx` hits a circular-ref on React trees containing `<Link>`; switched to `renderToStaticMarkup` + `next/link` mock returning plain `<a>`, matching `packages/artax-ui/tests/components/modal.test.tsx` precedent.
- [Phase 26]: 26-06: D-07 visual smoke check across all 5 factory-driven listing routes (light/dark) deferred to phase-end batch with 26-02/03/04/05 — consistent handling across all execute plans in Phase 26.
- 27-00: Phase 27 fixture pattern — spread baseConfig, override root + output.data + clean; runner uses pnpm exec velite with cwd=fixtureDir
- 27-00: spawnSync runner uses argv array (no shell) and fixtureDir constructed from __dirname join — satisfies T-27-00-03 injection threat mitigation
- 27-01: Velite's strict config option does NOT control CLI exit codes — only the --strict CLI flag does. Phase 27 fixture runner must invoke velite directly with --strict to surface schema failures as non-zero exits.
- 27-01: voice + requires_artifact ship between tags and category in dxFields per RESEARCH Q7; defaults [] and false preserve all 11 existing DX entries with no frontmatter changes (SCHEMA-01, SCHEMA-02 field freeze).
- 27-02: Velite imports SlugSchema/CalVerSchema/ArtifactTypeSchema/MergeStrategySchema directly from blink-registry; v1.2 ESM workaround retired (SCHEMA-05/D-20 closed)
- 27-02 deviation (Blake-approved Option A): blink-registry barrel re-exports use explicit .ts extensions for Node ESM strict resolution; allowImportingTsExtensions+noEmit promoted to packages/tsconfig/base.json — workspace emits via tsup/Next, never tsc
- 27-03: Per-collection bare-slug uniqueness via custom superRefine on s.path() (helper + dxSchemaFor factory) — preserves path-shaped entry.slug; literal D-19 swap to s.slug('<collection>') would change entry.slug to bare and break .velite/<collection>.json consumers + dxSchema.transform category fallback
- 27-03: TDD ordering — test(...) RED commit before feat(...) GREEN commit overrides plan declaration order when tasks list impl before its regression test
- 27-04: Deviated from plan reference snippet — store path-shaped slugs in per-collection Sets and match ref strings directly, instead of pop()-ing the last segment, to avoid false-positive dangling errors on nested skill paths
- 27-05: Hash gate short-circuits BEFORE deriveCalVer (which is NOT pure — consults git history) so prose-only artifact frontmatter edits no longer bump CalVer
- 27-05: Hash scope = distributed payload only (D-05) — single-file = artifact.body bytes, multi-file = concatenated file.content in declared order. Frontmatter bytes (description, devDependencies, name) excluded
- 27-05: Manifest at content/.artifact-versions.json is git-tracked per D-06 — survives clean checkouts; T-27-05-01 commit-access tampering accepted (PR-diffable)
- 27-05: Single-process serial build assumption (Risk #3) — fs.writeFileSync of full JSON in one syscall; atomic write-temp-then-rename deferred to v2+
- 27-05: Plan-level TDD ordering — test(27-05) RED commit before feat(27-05) GREEN; same precedent as 27-03 / 27-04
- 27-06: Use ESM-native fileURLToPath(import.meta.url) instead of CJS-shim polyfill — tsx 4.x runs scripts as native ESM (plan-invited swap)
- 27-06: Codemod harness skeleton ships --dry-run as printf-only short-circuit; future migration #001 owns dry-run contract definition (T-27-06-02 deferred per skeleton scope)
- 27-06: Migration discovery contract = scripts/migrations/<NNN>-<name>.ts default-export { name, description, run(contentRoot) }; regex /^\d{3}-[a-z0-9-]+\.ts$/ filters discoverable files
- 27-07: tsx scripts in CJS host packages must wrap async work in main() — top-level await unsupported by esbuild's cjs output; use fileURLToPath(import.meta.url) for __dirname (matches migrate-content.ts ESM pattern)
- 27-07: v1.4 perf baseline (Node v24.14.0, content count 23) — fullBuildWallMs 12456.79, veliteWallMs 3509.55, webpackCompileMs 6300, nextDevReadyMs 181; committed at .planning/intel/build-perf-baseline.json as v1.5+ regression yardstick
- 28-01: z.toJSONSchema() native Zod 4 — no zod-to-json-schema dep needed; both spikes resolved by research (skip entirely)
- 28-01: CrossRefSchema defined locally in dx-frontmatter.ts (cannot reuse Velite's different Zod instance per Pitfall 1)
- 28-01: Scaffold slug-to-title via simple split-capitalize; content-root defaults to apps/blakepetersen.io/content from cwd
- 28-02: $schema field stripped from JSON Schema for Ajv 8 compatibility (draft-2020-12 meta-schema not needed for keyword validation)
- 28-02: useDefaults:true on check validator so Zod default() fields pass required check (JSON Schema lists them as required)
- 28-02: statSync used instead of readdirSync withFileTypes to avoid Node 24 Dirent<NonSharedBuffer> type incompatibility
- 28-02: checkOrphans is a separate method on artifactPairRule (not per-file check) because it scans directory-level
- 28-03: Callout regex matches one block at a time via body continuation pattern (not multiline greedy)
- 28-03: YAML serialization is manual (no stringify dep) for staging output — keeps bundle small
- 28-03: validateSlug rejects .., /, and leading dot for T-28-03-02 path traversal mitigation
- 28-04: ArtifactBody is 'use client' (renders inside MDXContent client component + Radix Tabs); data supplied via React context from server-side DxContentLayout
- 28-05: createRequire shim in tsup banner for gray-matter CJS require('fs') compatibility in ESM bundle — standard pattern for CJS interop in bundled ESM binaries
- 28-06: Schema-validation round-trip (DxFrontmatterSchema.safeParse) over full Velite fixture build — faster, more reliable, same source of truth

### v1.4 Roadmap Decisions (locked at planning time)

- **v1.4-PLAN-01:** All new CLI capability ships as `blink` subcommands (`scaffold`, `lint`, `port`) — no second binary, no parallel toolchain. Source: ARCHITECTURE.md Q1, Q2, Q5; STACK.md rejects `plop`, `hygen`.
- **v1.4-PLAN-02:** `voice` and `requires_artifact` fields land on `dxFields` in Phase 27 (SCHEMA-01, SCHEMA-02). Field freeze for Phases 28–30 — any rename or semantic shift requires a milestone-level decision.
- **v1.4-PLAN-03:** v1.2 ESM workaround (inline artifact validation in Velite prepare hook) is fixed in Phase 27 (SCHEMA-05). Unblocks SCAFFOLD-03 (templates derive from live Velite Zod) in Phase 28.
- **v1.4-PLAN-04:** `blink lint` is the sole MDX content lint home — NOT `eslint-plugin-mdx`. Cross-file invariants (artifact-pair sync, dependency slug existence) don't fit ESLint's per-file model. Source: ARCHITECTURE.md Q2; SUMMARY.md Divergence #1 resolution.
- **v1.4-PLAN-05:** `obsidian-export` (Rust, out-of-band) for Obsidian port — never npm. `.obsidian-port-staging/` gitignored intermediate dir.
- **v1.4-PLAN-06:** Voice-primitive lint ships **advisory (warn)** in v1.4. Promotion to error gated on Phase 29 evidence (8-entry organic-pass heuristic) reviewed in Phase 30 (DEBT-05). Source: PITFALLS.md #2; SUMMARY.md Divergence #2.
- **v1.4-PLAN-07:** Both differentiators (`blink port` AND scaffold-pre-pop-from-doc-frontmatter) ship in v1.4 — Blake confirmed scope creep accepted. Neither deferred.
- **v1.4-PLAN-08:** CONTENT-05 (`<ArtifactBody slug>` server component) belongs in Phase 28 (Scaffolds + Lint), not Phase 29 — it's drift-prevention infrastructure that must precede bulk authoring per PITFALLS.md #4.

### Roadmap Evolution

- Phase 24.1 inserted after Phase 24: Editable Previews Polish — close WR-01 (query-param wipe), WR-02 (Toggle/label), pre-existing Header hydration mismatch (URGENT — surfaced by 24-REVIEW.md and carried into Phase 24.1 rather than deferred)
- v1.4 roadmap (Phases 27-30) drafted 2026-04-24 from synthesizer's 4-phase recommendation in research/SUMMARY.md, with sequence dependencies enforced (SCHEMA → SCAFFOLD → LINT → CONTENT; PORT-04 round-trip before bulk authoring; DEBT-04/05 after Phase 29 evidence)

### Pending Todos

- Run CalVer behavior spike (~30min read of `apps/blakepetersen.io/src/lib/calver.ts` + 1h regression test) at Phase 27 start — SCHEMA-08 deliverable
- Run `remark-lint-frontmatter-schema@3.15.4` × unified 11 compat spike (~2h) at Phase 28 Day 1 — Plan B is custom Ajv plugin (~80 LOC)
- Run `zod-to-json-schema@3.25.2` × Zod 4.3.6 coverage spike (~1h) at Phase 28 Day 1 — Plan B is hand-author JSON Schemas

### Blockers/Concerns

- ~~**react-live React 19 compat (Phase 24):** Spike (24-01) runs first as Wave 1. Per Blake's directive, fail-path is fix-forward — investigate, fix, re-spike — not deferral.~~ **Resolved 2026-04-18: VERDICT PASS** — react-live 4.1.8 renders Button under React 19; warning is dev-only, absent from prod build. Recommendation: enumerate named scope (68 artax-ui exports too large to spread). See `24-01-SPIKE-RESULT.md`.
- **Pre-commit budget (v1.4 Phase 28):** Husky pre-commit currently runs commitlint + lint-staged Prettier (~sub-second). Adding `blink lint --files` for staged content must keep total under 2s typical (PITFALLS.md #10 — `--no-verify` rebellion risk). Distribute slower checks to pre-push or CI.
- **Velite prepare-hook perf at scale (v1.4 Phase 27):** Capture cold-build + warm-dev baseline (SCHEMA-07) before Phase 29 content scale-up. If HMR latency exceeds 2s for content edits during Phase 29, add caching to graph + git-history + registry rewrite (PITFALLS.md #1).
- **Editorial debt human gate (v1.4 Phase 30):** /about and /start-here copy doesn't satisfy v1.4 closure until Blake re-reads 24h after writing and confirms voice (PITFALLS.md #6). Cannot be automated.

## Session Continuity

Last session: 2026-05-04T20:54:55.988Z
Stopped at: Completed 28-06-PLAN.md (Phase 28 complete)
Resume file: .planning/phases/28-authoring-scaffolds-lint-port/28-06-SUMMARY.md

**Planned Phase:** 28 (authoring-scaffolds-lint-port) — 6 plans — 2026-05-03T06:51:23.263Z
