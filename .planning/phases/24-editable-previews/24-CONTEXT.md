---
phase: 24-editable-previews
type: context
status: ready-for-planning
gathered: 2026-04-17
requirements: [ARTAX-08]
depends_on_phase: 23
---

# Phase 24: Editable Previews — Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Component pages in `apps/artax` gain a **Playground** experience where users can edit a preview's props (structured form) and optionally its JSX (free-text editor) and see the preview re-render. The phase outcome is gated on a react-live + React 19 compatibility spike, which is the first planned unit of work. If the spike fails, the phase ships the structured props-form only and defers the JSX editor (ARTAX-08) to ARTAX-F01.

**Out of scope (explicit, not oversights):**
- `@codesandbox/sandpack-react` — explicit React 19 support but heavier (in-iframe bundler). Deferred as an alternative-library option for ARTAX-F01 if react-live fails and editable-previews is revived later.
- `react-runner` — no React 19 support in peer deps; out.
- Shareable JSX edits via URL (only structured props are URL-encoded).
- localStorage-backed persistence.
- Playground for components that don't fit a single-render model (Dialog, Dropdown, Tooltip) — see Claude's Discretion.
- Accessibility audit reports (ARTAX-F02) and token history (ARTAX-F03).

</domain>

<decisions>
## Implementation Decisions

### Library & compat-check

- **Primary library:** `react-live@^4.1` — peer deps accept React 18+, nominally compatible with React 19.
- **Gate:** Phase begins with a 30-minute compatibility spike. Install `react-live` in `apps/artax`, render one existing registry component (Button with variants) through `<LiveProvider>/<LivePreview>`, and confirm:
  1. React 19 automatic-batching does not break `react-live`'s compile-and-render cycle.
  2. Stricter Suspense behavior does not throw inside `react-live` internals.
  3. HMR still works in dev and build still succeeds (no sucrase SSR bailouts).
- **Pass criteria for spike:** All three items green, no console errors, preview updates on keystroke.
- **Fail path:** If the spike fails, stop — do NOT pivot to sandpack in this phase. Ship the props-form-only outcome (see hybrid decision below), document the failure, and defer the JSX editor portion of ARTAX-08 to ARTAX-F01.
- **Precedent:** `@giscus/react` was skipped in v1.2 for the same class of React 19 compatibility unknown (see `.planning/PROJECT.md` → Key Decisions). Same caution applies.

### Editable surface shape — Hybrid

- **Default view:** Typed props-form. Read `ComponentDef.props: PropDef[]` from `apps/artax/src/lib/component-registry.ts`. Render one input per prop based on the `type` string:
  - `boolean` → toggle (artax-ui `Toggle`)
  - string literal union (e.g., `'sm' | 'md' | 'lg'`) → select (artax-ui `Dropdown` or a native select)
  - `string` → text input (artax-ui `Input`)
  - `number` → number input
  - anything else → freeform string input, coerced as `unknown`
- **Power view:** An "Edit JSX" toggle (artax-ui `Toggle`) reveals a `react-live` editor alongside the props form. Toggling off reverts to props-form control.
- **Graceful degradation:** Props-form works even if the compat spike fails — it does not depend on react-live. The "Edit JSX" toggle is the only surface gated on the spike passing. If spike fails, the toggle is removed; props-form ships alone and still closes ARTAX-08 in spirit (partial).

### Integration point

- **Location:** Third tab in the existing `TabsList` at `apps/artax/src/components/component-page-client.tsx`, next to Code and Props. Label: `Playground`.
- **Layout inside the tab:**
  - Top: live preview canvas (reuses the dot-grid container style from `ComponentPreview`).
  - Below: props-form (2-column grid on md+, stacked on mobile).
  - Below the form: "Edit JSX" toggle + conditional react-live editor.
- **Static preview strip (top of page) stays untouched** — the variant-only `ComponentPreview` continues to serve the docs-first reader. Visitors who don't open the Playground tab see no editing UI.

### State scope & shareability

- **Props state:** URL-encoded via Next.js App Router `searchParams`. Encoding: compact key=value pairs, e.g., `?p[variant]=outline&p[size]=sm`. Decode on mount via a `useSearchParams`/`useRouter` pair.
- **JSX state:** Ephemeral (React `useState`). Edits do NOT persist across reload, nav, or sharing. A "Reset to example" button reverts the editor to the registry's first code example.
- **SSR behavior:** On first render with `?p[*]=...` params present, the Playground tab hydrates with those values applied. No flash of default state.

### Claude's Discretion

- **Per-component opt-in:** Claude picks which of the 15 components get a working Playground tab during planning. Expected to exclude or stub components whose behavior is trigger-based or needs orchestration that the form can't easily express — likely **Dialog**, **Dropdown**, **Tooltip**, **Accordion**. For excluded components, the Playground tab is hidden (not rendered) and the existing Code/Props tabs remain. Document the exclusion list in the plan.
- **Imports scope for JSX editor:** Scope symbols to `artax-ui` exports plus standard React primitives (Fragment, useState if needed). No lucide-react or arbitrary third-party imports — keeps the sandbox predictable and matches the design-system scope.
- **Type coercion rules for props-form:** Best-effort from the `type` string. Booleans via Toggle, string-literal unions via select when parseable. No TS-compiler-level inference; if it's unclear, fall back to a freeform string input.
- **Broken-JSX UX:** react-live's default behavior — show a red error surface below the preview and keep the last good render visible. No custom error boundary beyond that.
- **Mobile behavior:** Playground tab remains visible below `md`; layout collapses to a single column. No separate hide-on-mobile rule — power-user friction is acceptable on narrow screens.

</decisions>

<canonical_refs>
## Canonical References

### Project-level
- `.planning/PROJECT.md` — "Giscus iframe over @giscus/react" key decision; same React-19 compat caution applies here.
- `.planning/REQUIREMENTS.md` — ARTAX-08 (active), ARTAX-F01 (future fallback target).
- `.planning/ROADMAP.md` — Phase 24 entry (line 119–124): compat-check is success criterion #1.

### Phase 23 artifacts (prior wave we build on)
- `.planning/phases/23-component-catalog-documentation/23-CONTEXT.md` — prior layout + routing decisions.
- `.planning/phases/23-component-catalog-documentation/23-01-SUMMARY.md` — display components and registry shape.
- `.planning/phases/23-component-catalog-documentation/23-02-SUMMARY.md` — 15-component registry populated, overview pages.

### Reusable code surfaces
- `apps/artax/src/components/component-preview.tsx` — dot-grid container and variant selector; style reference for Playground canvas.
- `apps/artax/src/components/component-page-client.tsx` — Tabs host; new `Playground` tab slots here.
- `apps/artax/src/components/code-examples.tsx` — current CodeBlock render; initial JSX value comes from `CodeExample[]`.
- `apps/artax/src/components/props-table.tsx` — typed PropDef rendering; shape of the input-producing logic for the props-form mirrors this.
- `apps/artax/src/lib/component-registry.ts` — `ComponentDef`, `PropDef`, `CodeExample` types; no schema changes required for props-form, but may need a new optional `playground?: { enabled: boolean; defaultExample?: string }` field to drive per-component opt-in.

### External docs (research-time)
- react-live GitHub: https://github.com/FormidableLabs/react-live — check Issues/PRs for React 19 reports before the spike.
- Next.js App Router searchParams: https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional — URL state API.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ComponentPreview` (dot-grid container) — style extraction target; Playground's preview canvas should reuse the background and border treatment.
- artax-ui `Toggle` — used for the "Edit JSX" switch.
- artax-ui `Tabs` family — already in `component-page-client.tsx`; just add a third `TabsTrigger` + `TabsContent`.
- artax-ui `CodeBlock` — wraps the JSX editor visually (the editor itself is a react-live `<LiveEditor>`).
- artax-ui `Input`, `Dropdown` — props-form controls.

### Established Patterns
- **Server/client split:** `ComponentPageClient` is `'use client'`. The Playground panel stays inside that client boundary. No function serialization across RSC.
- **Registry drives everything:** All component metadata (props, code examples, a11y, preview) lives in `component-registry.ts`. Playground reads the same entries — no parallel data source.
- **Variant strings for state:** Prior pattern uses a `variant?: string` arg to `preview()`. Playground generalizes this to a full props object; the existing variant selector stays untouched on the top-of-page preview.
- **Terminal aesthetic:** 0px border-radius, JetBrains Mono for code, dot-grid preview background, `// monospace` comment labels for section headings.

### Integration Points
- `apps/artax/src/app/components/[tier]/[slug]/page.tsx` — server component; passes `{tier, slug}` into `ComponentPageClient`. No change expected here.
- `apps/artax/src/components/component-page-client.tsx` — the only file that needs a structural edit: add Playground tab, import new `<ComponentPlayground>` client component.
- New file expected: `apps/artax/src/components/component-playground.tsx` — owns the Playground tab body (preview + props-form + JSX toggle).
- New file expected: `apps/artax/src/lib/playground-url-state.ts` — encode/decode helpers for searchParams.

</code_context>

<specifics>
## Specific Ideas

- Spike commits should be labeled `spike(24-01)` and land on `main` (or a throwaway branch) so the outcome is inspectable without polluting the phase's production plans.
- If the spike passes: keep `react-live` as a direct dep in `apps/artax` (not `artax-ui`) — the playground is an app concern, not a design-system primitive.
- "Reset to example" button matters — keeps the JSX editor from becoming a graveyard of broken experiments.
- The URL encoding should be shallow enough that Blake can hand-edit `?p[size]=sm` in the address bar for testing.

</specifics>

<deferred>
## Deferred Ideas

- **Sandpack-based playground (ARTAX-F01):** Use `@codesandbox/sandpack-react` if react-live spike fails and editable-previews gets revived later. Pros: explicit React 19 support, deterministic iframe sandbox. Cons: heavier bundle, bundler-in-iframe boot time.
- **JSX state in URL via base64:** Considered for shareable JSX edits. Deferred because (a) URLs get ugly fast, (b) base64 payloads invite clipboard truncation issues, (c) the common case is props-tweaking, not wholesale JSX rewrites.
- **localStorage per slug:** Considered for solo exploration across sessions. Deferred because the shareability story (URL) is more valuable than per-user persistence for a public docs site.
- **Per-component playground enablement across Dialog/Dropdown/Tooltip/Accordion:** These trigger-based or orchestration-heavy components don't fit a single props-form render model. Revisit when/if the Playground pattern stabilizes; might need component-specific playground templates.
- **Imports scope beyond artax-ui:** lucide-react, custom icons, arbitrary third-party components. Would require a whitelist and bundler strategy; out of scope for v1.3.
- **Accessibility audit of the Playground surface itself:** Keyboard navigation through props-form, focus management on JSX toggle, screen-reader announcements when preview updates. Deferred to ARTAX-F02 (component a11y audit).

</deferred>

---

*Phase: 24-editable-previews*
*Context gathered: 2026-04-17*
