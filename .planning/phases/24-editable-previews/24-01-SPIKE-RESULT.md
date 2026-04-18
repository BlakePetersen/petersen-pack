# 24-01 Spike Result

**Date:** 2026-04-18
**react-live version:** 4.1.8 (resolved per package.json `^4.1.8`)
**React version:** 19.2.4

## VERDICT: PASS

react-live 4.1.8 renders `Button` under React 19 from both narrow and wildcard scopes. The only observable cost is a dev-only JSX-transform warning (documented in RESEARCH.md Pitfall 1). No runtime failure, no Sucrase parse error, no LiveError surface. Plan 24-06 (JSX editor integration) is unblocked.

## Open Question 1 — React 19 JSX transform warning

- **Dev console:** `Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform` — originates from `VM158:3` via `exports.createElement` (i.e., sucrase-transpiled user code inside react-live's `evalCode`). Fires once per LiveProvider on initial transpile. Not present in app code — only in the react-live evaluation path.
- **Next build output:** warning **absent** from `pnpm --filter artax build` stdout/stderr. The only build warning was an unrelated Turbopack NFT trace on `next.config.ts` via `token-registry.ts` (pre-existing, out of scope for this spike). `/spike-react-live-compat` built cleanly as a static prerendered route alongside 21 others.
- **Classification:** **dev-only warning** emitted by React's development build when `React.createElement` is called. Benign — react-live's bundled Sucrase transform produces classic-runtime output (PR #406 tracks a modernization). No functional impact.

## Open Question 2 — artax-ui wildcard scope tree-shaking

- **Object.keys(artaxUI).length:** **68**
- **/spike-react-live-compat First Load JS:** not captured — Next.js 16 Turbopack build output in this environment does not emit the per-route size table. Decision is anchored on the export count alone.
- **/components/atoms/button First Load JS:** not captured (same reason)
- **Assessment:** **switch to named scope.** 68 named exports is too large a surface area to spread into `LiveProvider.scope`. Even if the wildcard build happens to tree-shake well today, any future export added to `artax-ui/index.ts` would automatically leak into every Playground bundle. Enumerating named exports per component (e.g. `scope: { Button }`) preserves tree-shaking and keeps per-route bundle size predictable. Bundle size measurement is deferred to a follow-up instrumentation pass (bundle analyzer) if ever needed; it would not change this recommendation.

## Render behavior

- Narrow-scope Button rendered: **yes** (visually confirmed in dev browser)
- Wildcard-scope Button rendered: **yes** (visually confirmed in dev browser)
- Keystroke re-render tested: no (not required for this verdict; Pattern 1 validation happens in plan 24-06)
- `LiveProvider` transpile pipeline fired twice (one per provider) with no errors logged

## Incidental observation (pre-existing, out of scope)

A hydration mismatch error fires from `apps/artax/src/components/header.tsx:17` on the mobile navigation hamburger (Radix Dialog trigger, `aria-controls="radix-_R_..."`). The stack trace points to `RootLayout @ layout.tsx:45` → `Header` and reproduces on any route — it is **not caused by the spike**. Recommend filing as a separate bug. Not a blocker for this verdict.

## Recommendation

- **24-06 JSX editor integration: PROCEED**
- **Scope strategy: enumerate named exports** — use `scope: { Button }` (per-component) rather than `scope: { ...artaxUI }`. Defer any wildcard-style convenience API to ARTAX-F01+ if ever needed.
- **Warning handling: tolerate** in dev. Do not suppress via `transformCode` — a silent warning is worse than a visible one, and upstream react-live PR #406 will eventually modernize the transform. Monitor, don't patch.
