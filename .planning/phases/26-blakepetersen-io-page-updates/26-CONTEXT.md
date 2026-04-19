# Phase 26: blakepetersen.io Page Updates - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Five bp.io pages — Homepage, Skills Detail, About, Start Here, Collection Listing —
rewritten to match the approved Pencil designs (`bp.io.pen`), taking advantage of
the themed design system shipped in Phases 21–25. Rewrite is surgical: existing
routes, data fetching, and content-model wiring stay intact; only layout scaffolding
and component composition change.

**In scope:**
- Update the 5 named pages' `page.tsx` scaffolding to match their Pencil frames in both light and dark modes
- Extract missing Pencil primitives (Badge, AuthorNote, DecisionRationale, PrevNextNav, Modal) into `packages/artax-ui`
- Verify each updated page in light and dark modes before marking its plan complete
- Adapt Pencil layouts when Pencil frames conflict with live content-model data (e.g., dynamic counts, MDX block variety)

**Out of scope:**
- Redesigning or migrating the content model (collection registry schemas, MDX rendering pipeline) — design adapts to data per D-02, not the reverse
- New ThemeProvider / toggle work (shipped Phase 22 / 25)
- Pages not named in SITE-03..SITE-07 (changelog, posts index, contributors, dev, configs, hooks, guides, roadmap — all remain untouched unless a Pencil primitive sweeps them incidentally)
- Visual regression test harness (deferred from Phase 25)
- Artax reference app changes (different consumer)

</domain>

<decisions>
## Implementation Decisions

### Rewrite Strategy
- **D-01:** Surgical rewrite for all 5 pages. Keep each page's existing route, data fetching hooks (`getCollection`, `getAllCollections`, `[...slug]` resolution), and content-model wiring. Replace only layout scaffolding and component composition to match the Pencil frame. No scorched-earth rewrite on any page.

### Design vs Data Conflict Resolution
- **D-02:** Content wins — when a Pencil frame disagrees with live content-model data (e.g., Pencil shows 3 static cards but `getAllCollections()` returns 9 dynamic categories), adjust the design to fit the data (grid wrap, overflow/scroll, responsive stack). Escalate to Blake only when the conflict is structural (e.g., Pencil assumes a content shape that doesn't exist).

### Plan Granularity & Ordering
- **D-03:** Primitives-first, then pages.
  - **Plan 01:** Extract the missing Pencil primitives into `packages/artax-ui`
  - **Plans 02–06:** One per page, composing those primitives
  - Target ~6 plans; Claude may split or merge during planning if volume warrants

### Primitive Placement
- **D-04:** All new primitives land in `packages/artax-ui` (preserves Phase 21 intent of artax-ui as the single design-system lane). Applies to: Badge, AuthorNote, DecisionRationale, PrevNextNav, Modal. No bp.io-local primitive exceptions.
- **D-05:** *Editorial-voice escape hatch* — if during plan 01 a primitive surfaces as editorial-voice-specific rather than generic (e.g., AuthorNote with hardcoded first-person framing, DecisionRationale carrying bp.io-specific semantics), Claude flags the case to Blake before committing it to artax-ui. Naming and API surface must be generic enough that a second consumer could adopt without renaming. Default remains artax-ui per D-04.

### Pencil Fidelity Workflow
- **D-06:** Pencil-as-reference — use `mcp__pencil__get_screenshot` per frame and let Claude read visually + compose implementation by judgment. Tool-level escape: `batch_get` is available when a screenshot is ambiguous (notably for primitive API surface during plan 01) — Claude's discretion per occurrence, no upfront ritual.

### Verification Cadence
- **D-07:** Light/dark smoke check after each page plan completes — each page plan's VERIFICATION section includes "render in light mode", "render in dark mode", and "no visible artifacts on toggle". A plan is not complete until both modes render cleanly. Per-plan, not per-phase.

### Claude's Discretion
- **Exact plan count** (5 vs 6 vs 7 — primitives may split into 2 plans if volume warrants).
- **Component testing strategy per primitive** — `tdd_mode` is `false` in config, but Phase 24 shipped artax-ui primitives with unit tests. Claude decides per primitive in plan 01 based on behavior complexity (Modal's focus-trap warrants tests; Badge likely doesn't).
- **Per-page responsive breakpoints** — existing bp.io responsive conventions apply unless Pencil frame dictates otherwise.
- **Whether Skills Detail MDX renders inline `<DecisionRationale>` / `<AuthorNote>` blocks** — decide in plan 03/04 based on whether existing MDX content already uses those semantics or whether Pencil frame demands them.
- **Use of `batch_get`** — available tool-level escape for ambiguous primitive extraction (D-06).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pencil Design Source
- `/Users/blakepetersen/Monodex/Projects/blakepetersen/Designs/bp.io.pen` — canonical design file. Frames to consult: `Homepage`, `About Page`, `Start Here Page`, `Skills Detail Page`, `Collection Listing Page`. Component frames: `AuthorNote`, `DecisionRationale`, `CodeBlock`, `PrevNextNav`, `Modal`, `Badge`, plus existing `Header`, `Footer`, `ApplyActionBar`, `SidebarNavItem`, `SidebarNavItem/Active`. Access via `mcp__pencil__*` tools only — do NOT attempt to Read/Grep the binary `.pen` file.

### Design System (artax-ui)
- `packages/artax-ui/src/styles/globals.css` — semantic token surface (background, foreground, card, popover, muted, accent, primary, border, input, ring, destructive, success, info, warning), light + dark.
- `packages/artax-ui/src/styles/theme.css` — Tailwind v4 `@theme` blocks.
- `packages/artax-ui/src/components/` — existing primitive catalog. Verify before reinventing.
- `packages/artax-ui/src/index.ts` — public barrel; every new primitive adds an export entry (Phase 21-01 decision: direct file imports, no tier-level `index.ts`).

### Existing bp.io Surfaces
- `apps/blakepetersen.io/src/app/page.tsx` — Homepage (dynamic: `getCollection('posts')`, `getAllCollections()`, `stackTools` array).
- `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` — Skills Detail (MDX via collection registry).
- `apps/blakepetersen.io/src/app/about/` — About page.
- `apps/blakepetersen.io/src/app/start-here/` — Start Here page.
- `apps/blakepetersen.io/src/app/` — Collection Listing page(s) — confirm exact route during planning (likely one per collection slug).
- `apps/blakepetersen.io/src/components/` — existing components: header, footer, apply-action-bar, sidebar, sidebar-nav, sidebar-drawer, theme-toggle, category-card, breadcrumbs, mdx-content, post-layout, content-shell, dx-content-layout, etc.
- `apps/blakepetersen.io/src/lib/collection-registry.ts` (inferred) — collection metadata and getters.

### Prior Phase Decisions (relevant to this phase)
- `.planning/phases/21-artax-ui-restructure-theming/21-CONTEXT.md` — artax-ui as shared design-system lane; barrel via direct file imports (D-04 here depends on this stance).
- `.planning/phases/22-artax-reference-site-scaffold/22-CONTEXT.md` — `next-themes` as peerDependency; ThemeProvider wrapper; FOUT prevention already wired in bp.io `layout.tsx`.
- `.planning/phases/23-component-catalog-documentation/` — artax-ui catalog patterns; new primitives added here will appear in the catalog once registered.
- `.planning/phases/25-blakepetersen-io-theming/25-CONTEXT.md` — D-05 replacement map (bg-background / text-foreground / text-muted-foreground / bg-card / border-border / bg-input / text-primary / status colors) is the canonical token mapping for all Phase 26 work. Every new bp.io surface must conform.
- `.planning/phases/25-blakepetersen-io-theming/25-SUMMARY.md` (if exists) — theming audit outcome; flags any remaining theme-static annotations carried into Phase 26.

### Roadmap / Requirements Anchors
- `.planning/ROADMAP.md` §"Phase 26: blakepetersen.io Page Updates" — goal + 5 success criteria (one per page).
- `.planning/REQUIREMENTS.md` — SITE-03 (Homepage), SITE-04 (Skills Detail), SITE-05 (About), SITE-06 (Start Here), SITE-07 (Collection Listing).

### Codebase Intel
- `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/STACK.md` — consult before planning if primitive extraction raises structural questions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Token system (artax-ui):** Every surface token needed (card, popover, muted, accent, primary, border, input, ring, destructive, success, info, warning) already exists dual-mode. D-05 of Phase 25 locked the replacement map.
- **Themed plumbing (bp.io):** `layout.tsx` has `<ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>` + `suppressHydrationWarning`; `theme-toggle.tsx` uses `useSyncExternalStore` mounted-flag (SSR-safe). No new plumbing needed.
- **Existing bp.io components with Pencil analogs:** `header.tsx`, `footer.tsx`, `apply-action-bar.tsx`, `sidebar-nav.tsx`, `sidebar-drawer.tsx`, `category-card.tsx`, `mdx-content.tsx`. These are the "kept" components — new primitives wrap or replace compositions around them.

### Pencil Primitives — Extraction Targets (Plan 01)
Missing from artax-ui catalog (per Pencil component list):
- **Badge** — shadcn-standard primitive; almost certainly generic
- **Modal** — shadcn-standard primitive; focus-trap + portal, warrants tests
- **AuthorNote** — content-page primitive; inspect for editorial-voice specificity (D-05 gate)
- **DecisionRationale** — content-page primitive; inspect for editorial-voice specificity (D-05 gate)
- **PrevNextNav** — content-page primitive; generic navigation shape, probably safe

### Established Patterns
- **Per-phase commit cadence:** each plan is one atomic commit with `feat(26-0N):` or `refactor(26-0N):` prefix.
- **Artax-ui public API:** direct file imports in `packages/artax-ui/src/index.ts` (no tier-level barrels).
- **SSR-safe client components:** `useSyncExternalStore` for theme-aware readers; `useState + useEffect` mounted-flag for Radix subtrees (per Phase 24.1 D-09).
- **Content-driven pages:** Homepage and Skills Detail must preserve their runtime data contracts — no static substitution.

### Integration Points
- **Artax-ui barrel:** every new primitive adds one line to `packages/artax-ui/src/index.ts`.
- **bp.io `globals.css`:** already imports the artax-ui token bundle; no additional CSS setup needed per page.
- **MDX pipeline:** if Skills Detail renders `<DecisionRationale>` / `<AuthorNote>` inline, the MDX components map (bp.io `mdx-content.tsx` or adjacent) gets the new components wired in.
- **Component catalog (Phase 23):** new primitives automatically appear in the artax-ui catalog once exported from the barrel (no extra registration work).

### Anti-Patterns to Avoid
- **Do not** reintroduce hardcoded color literals — Phase 25 audit is canonical.
- **Do not** create bp.io-local copies of primitives that belong in artax-ui (violates D-04).
- **Do not** bend content data to fit Pencil frames (violates D-02).
- **Do not** extend `globals.css` in bp.io with new CSS custom properties; add them to `packages/artax-ui/src/styles/globals.css` if truly needed.

</code_context>

<specifics>
## Specific Ideas

- **Homepage** has a `stackTools` array and content-driven recent posts / category cards — preserve the data contract, only adjust the visual composition.
- **Skills Detail** renders MDX through the collection registry; any Pencil-demanded inline component (DecisionRationale inside an MDX block) gets registered in the MDX components map once its primitive lands in artax-ui.
- **Modal** is the highest-complexity primitive: focus-trap, portal, Esc-to-close, click-outside, SSR-safety. Plan 01 should allocate space for tests there even though `tdd_mode` is off.
- **Badge** is trivial by contrast — variants from the Pencil frame (default / info / success / warning / destructive probably) map cleanly to existing semantic tokens.
- **PrevNextNav** likely takes `{ prev?: {href,label}, next?: {href,label} }` — mirror Pencil frame's slot shape exactly.
- **Editorial-voice gate (D-05)** — if AuthorNote's Pencil frame shows "Blake's note:" hardcoded or DecisionRationale uses a decision framework specific to bp.io content, stop and discuss placement before committing to artax-ui.
- **Primitive unit tests** — Phase 24 precedent: artax-ui primitives ship with focused behavior tests. Apply to Modal (focus-trap, Esc, outside-click) at minimum.

</specifics>

<deferred>
## Deferred Ideas

- **Visual regression test suite** — Playwright screenshot diffs across both themes for every route. Carried from Phase 25 deferred list; Phase 26 verification is smoke-only per D-07.
- **Theme transition animation** — cross-fade on toggle. Carried from Phase 25.
- **SITE-08 verification for artax app** — FOUT prevention on `apps/artax`; different consumer, not Phase 26 scope.
- **Retrofit `useSyncExternalStore` across artax-ui** — carried from Phase 25; `SidebarDrawer` and future theme-aware components.
- **Retroactive tests for existing bp.io components** — scope-creep if opened during Phase 26.
- **Dark-mode syntax highlighting token retune** — shiki is already theme-aware; any retune is a content-polish phase.

</deferred>

---

*Phase: 26-blakepetersen-io-page-updates*
*Context gathered: 2026-04-19*
