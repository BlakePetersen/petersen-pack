# Phase 26: blakepetersen.io Page Updates - Research

**Researched:** 2026-04-19
**Domain:** Surgical page rewrite (Next.js 16 App Router + React 19 + artax-ui + Radix primitives)
**Confidence:** HIGH (all claims verified against in-repo source)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 Surgical rewrite:** Keep routes, data fetching hooks (`getCollection`, `getAllCollections`, `[...slug]`), content-model wiring. Replace only layout scaffolding + component composition.
- **D-02 Content wins on conflict:** When Pencil disagrees with live data (e.g., 3 static cards vs 9 dynamic collections), adapt the design (grid wrap, overflow, responsive stack). Escalate only if structural.
- **D-03 Primitives-first:** Plan 01 = extract primitives to artax-ui. Plans 02-06 = one per page. Target ~6 plans; split/merge permitted during planning.
- **D-04 Primitives → artax-ui:** All new primitives (Badge, Modal, AuthorNote, DecisionRationale, PrevNextNav) land in `packages/artax-ui`. No bp.io-local exceptions.
- **D-05 Editorial-voice escape hatch:** If AuthorNote/DecisionRationale surface as bp.io-specific (hardcoded first-person copy, project-specific semantics), stop and discuss placement. API must be generic.
- **D-06 Pencil-as-reference:** `mcp__pencil__get_screenshot` per frame; compose by judgment. `batch_get` escape hatch for ambiguous primitive API.
- **D-07 Light/dark smoke check per page:** Each page-plan VERIFICATION section must include "render light", "render dark", "no artifacts on toggle". Not complete until both modes render cleanly.

### Claude's Discretion
- Exact plan count (5/6/7 — primitives may split).
- Per-primitive test strategy (`tdd_mode=false`, but Phase 24 precedent is tested artax-ui primitives; Modal warrants tests, Badge does not).
- Per-page responsive breakpoints (bp.io defaults unless Pencil dictates).
- Whether Skills Detail MDX renders inline `<DecisionRationale>` / `<AuthorNote>` (decide in plans 03/04 based on existing MDX + Pencil frame).
- Use of `batch_get` tool-level escape during plan 01.

### Deferred Ideas (OUT OF SCOPE)
- Visual regression test suite (Playwright screenshot diffs).
- Theme transition animation (cross-fade on toggle).
- SITE-08 verification for artax app.
- `useSyncExternalStore` retrofit across artax-ui.
- Retroactive tests for existing bp.io components.
- Dark-mode syntax highlighting retune.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-03 | Homepage matches Pencil design (light + dark) | Current `app/page.tsx` preserved structurally; Badge primitive replaces stack-chip spans; CategoryCard reused; new Modal only if Pencil wires contact/subscribe CTA |
| SITE-04 | Skills Detail matches Pencil design | MDX pipeline via `createCollectionDetailPage('skills')` + `MDXContent` + shiki preserved; PrevNextNav replaces existing `page-navigation.tsx`; AuthorNote/DecisionRationale registered in MDX components map if Pencil inlines them |
| SITE-05 | About matches Pencil design | Static page; Badge chips + CTA terminal anchors; optional AuthorNote wrapping personal-voice section |
| SITE-06 | Start Here matches Pencil design | Static numbered walkthrough over `resolveSteps()`; Card-style step blocks; optional DecisionRationale for "why this stack" |
| SITE-07 | Collection Listing matches Pencil design | Route is per-collection `app/{slug}/page.tsx` via `createCollectionIndexPage(slug)` — not a single `[collection]` dynamic route (Open Question resolved below) |
</phase_requirements>

## Summary

Phase 26 is a surgical visual rewrite of five bp.io pages against locked Pencil designs. The theming infrastructure (Phases 21-25), the artax-ui token surface, the content registry, and the MDX pipeline are all shipped and stable — this phase only touches layout scaffolding and component composition. The highest-risk work is Modal SSR hydration safety; the highest-risk *discovery* is the `AuthorNote` name collision (an `AuthorNote` MDX component already exists in `packages/artax-ui/src/mdx/components.tsx`, which must be reconciled with the new standalone primitive extraction during Plan 01).

**Primary recommendation:** Plan 01 must (a) reconcile the existing `mdxComponents.AuthorNote` implementation with the new standalone primitive extraction, (b) build `Modal` as a thin composition over the existing `Dialog` (not a new Radix wrapper) applying the proven Phase 24.1 mounted-flag SSR gate from `sidebar-drawer.tsx`, and (c) retire `apps/blakepetersen.io/src/components/page-navigation.tsx` by extracting its slot shape verbatim into `PrevNextNav` in artax-ui. The 5 page plans then compose over a stable primitive surface.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page routing, `generateStaticParams`, metadata | App Router (Server Component) | — | All 5 pages are SSG-friendly; routes already defined as server components per current code [VERIFIED: page.tsx, collection-pages.tsx] |
| Data fetching (`getCollection`, `getAllCollections`) | App Router (module scope / server) | — | Velite outputs static JSON; getters run at build time [VERIFIED: collection-registry.ts] |
| MDX render (shiki, heading anchors, `<AuthorNote>`) | Client Component (`MDXContent`) | — | `'use client'` required — MDX runtime evaluation is client-only [VERIFIED: mdx-content.tsx line 4] |
| Theme toggle / `data-theme` read | Client Component (theme-toggle.tsx) | — | `useSyncExternalStore` mounted-flag (Phase 25) — already shipped |
| Modal (new) | Client Component (artax-ui organism) | — | Radix Dialog requires client; mounted-flag for SSR safety per Phase 24.1 D-09 |
| Badge, AuthorNote, DecisionRationale, PrevNextNav | Pure render (server-compatible) | — | Presentational; no hooks; safe in server tree unless consumed inside a `'use client'` boundary |
| Sidebar drawer (mobile) | Client Component | — | Already mounted-flag gated [VERIFIED: sidebar-drawer.tsx] |

## Project Constraints (from CLAUDE.md)

From `/Users/blakepetersen/.claude/CLAUDE.md` (user's global — no project-local CLAUDE.md exists):
- **Smallest reasonable changes / YAGNI.** Plan 01 must not gold-plate primitives beyond what the 5 pages consume.
- **Never rewrite without explicit permission** — D-01 already grants surgical permission; deeper restructure requires Blake approval.
- **Never implement backward compatibility without approval** — Badge `variant` additions are allowed (D-02 content wins), but keeping legacy `border border-border px-2 py-1` stack-chip inline alongside Badge is not.
- **Match surrounding code style exactly** — kebab-case filenames in bp.io, nested test dirs in artax-ui, no semicolons, single quotes, `tabWidth: 2`.
- **Every code file starts with `// ABOUTME:` two-line comment** — already the norm in bp.io and artax-ui.
- **Never skip/disable pre-commit hooks.**
- **All test failures are your responsibility.** Modal tests must pass; do not delete pre-existing Dialog tests.
- **Never test mocked behavior.** Modal focus-trap/Esc/outside-click tests run against real Radix, not mocks.
- **TDD mandatory for features/bugfixes.** Although `tdd_mode: false` in `.planning/config.json`, Phase 24 established Modal-class primitives get unit tests (RED/GREEN) — follow that precedent for Modal.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.2` | App Router, SSG, image optimization | Already in bp.io [VERIFIED: apps/blakepetersen.io/package.json] |
| `react` / `react-dom` | `19.2.4` | UI runtime | Peer of artax-ui; SSR via `renderToString` required for Modal hydration test [VERIFIED] |
| `radix-ui` | `^1.4.3` (meta package) | Primitive unstyled + a11y behaviors | Already dep of artax-ui; Dialog re-exports `Dialog as RadixDialog` [VERIFIED: dialog.tsx line 4] |
| `class-variance-authority` | `^0.7.1` | `cva()` variants (Badge, Modal sizes) | Established in artax-ui Badge + Button [VERIFIED] |
| `tailwind-merge` / `clsx` via `cn()` | `^3.5.0` / `^2.1.1` | Class composition | Exported from `artax-ui/lib/utils` [VERIFIED: index.ts line 84] |
| `next-themes` | `0.4.6` | Theme persistence (consumed, not extended) | Already wired in bp.io layout [VERIFIED: Phase 22/25] |
| `@shikijs/rehype` | `^4.0.2` | MDX code-block highlighting | Dep of bp.io; Skills Detail preserves [VERIFIED: package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `^1.7.0` | Icon set | Modal close icon; PrevNextNav arrows (falls back to `←` / `→` glyphs per UI-SPEC) |
| `velite` | `^0.3.1` | Content compilation | Do not touch; MDX JSON outputs feed `getCollection` [VERIFIED] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Thin `Modal` over existing `Dialog` | Parallel Radix Dialog wrapper | Doubles Radix surface; Dialog already styles card/border/shadow. **Use composition, not a second wrapper.** |
| Retire `page-navigation.tsx` | Keep it as bp.io-local; add thin `PrevNextNav` atom wrapping same shape | Violates D-04 (primitive placement) and leaves duplicate shapes. **Extract, retire.** |
| Replace existing `mdxComponents.AuthorNote` | Keep the MDX-only implementation and add a separate UI-facing primitive | Creates two `AuthorNote` components with divergent styling — high-confusion. **Extract the shared primitive; have `mdxComponents.AuthorNote` re-use it.** |

**Installation:** *No new package installs required.* Every dependency needed for Plans 01-06 is already resolved in `apps/blakepetersen.io/package.json` or `packages/artax-ui/package.json`.

**Version verification:** Skipped — this phase introduces no new packages. Existing versions confirmed against `package.json` in-repo (the registry is moot; lockfile is authoritative).

## Architecture Patterns

### System Architecture Diagram

```
                          ┌───────────────────────┐
                          │ Pencil Design File    │   (reference only, not
                          │ bp.io.pen             │    built into output)
                          │ mcp__pencil__*        │
                          └──────────┬────────────┘
                                     │ screenshots guide composition
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Phase 26 Plan 01: artax-ui                      │
│                                                                  │
│   Badge (exists)  Modal (new, ← Dialog)   AuthorNote (reconcile) │
│   DecisionRationale (new)   PrevNextNav (new, ← page-navigation) │
│                                                                  │
│   index.ts barrel adds 3-4 exports                               │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ consumed by
               ▼
┌─────────────────────────────────────────────────────────────────┐
│           Phase 26 Plans 02-06: bp.io pages                      │
│                                                                  │
│  Homepage (page.tsx)      ◂── Badge, Modal? (contact CTA)        │
│  Skills Detail ([...slug]) ◂── PrevNextNav, AuthorNote/          │
│     (via createCollection-       DecisionRationale in MDX        │
│      DetailPage('skills'))       components map                  │
│  About (about/page.tsx)   ◂── Badge chips, optional AuthorNote   │
│  Start Here (start-here/) ◂── Card step blocks, opt. DecisionRat │
│  Collection Listing (per-  ◂── Badge, listing-row composition    │
│     collection page.tsx    (configs, hooks, guides, skills,      │
│     via createCollection-   posts — 5 index routes)              │
│     IndexPage)                                                   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ rendered via
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│   Next.js 16 App Router — SSG pipeline                           │
│                                                                  │
│   layout.tsx → ThemeProvider (next-themes) → Header → {page}     │
│                                                                  │
│   • Radix primitives (Dialog/Modal) gate on mounted flag         │
│   • ThemeToggle uses useSyncExternalStore mounted pattern        │
│   • Server components render static markup; client islands wire  │
│     interactivity post-hydration                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
packages/artax-ui/src/
├── components/
│   ├── atoms/
│   │   ├── badge/           (exists — extend variants if Pencil requires)
│   │   └── ...
│   ├── molecules/
│   │   ├── author-note/     (NEW — D-05 gate)
│   │   ├── decision-rationale/ (NEW — D-05 gate)
│   │   ├── prev-next-nav/   (NEW)
│   │   └── ...
│   └── organisms/
│       ├── dialog/          (exists — Modal composes over this)
│       └── modal/           (NEW — thin wrapper OR re-export composition)
├── mdx/
│   └── components.tsx       (RECONCILE AuthorNote with new molecule)
└── index.ts                 (add exports)

apps/blakepetersen.io/src/
├── app/
│   ├── page.tsx             (Homepage rewrite — Plan 02)
│   ├── about/page.tsx       (Plan 04)
│   ├── start-here/page.tsx  (Plan 05)
│   ├── skills/[...slug]/page.tsx    (Plan 03 — via factory)
│   ├── configs/page.tsx     (Plan 06 — via factory)
│   ├── hooks/page.tsx       (Plan 06 — via factory)
│   ├── guides/page.tsx      (Plan 06 — via factory)
│   ├── skills/page.tsx      (Plan 06 — via factory)
│   └── posts/page.tsx       (Plan 06 — via factory)
├── lib/
│   ├── collection-pages.tsx (MODIFY — listing-row shape for Plan 06)
│   └── collection-registry.ts (preserve)
└── components/
    ├── mdx-content.tsx      (MODIFY — inject AuthorNote/DecisionRationale if Skills needs them inline)
    └── page-navigation.tsx  (DELETE after PrevNextNav swap-in)
```

### Pattern 1: Mounted-Flag SSR Gate for Radix Primitives

**What:** Any Radix primitive rendered in initial viewport that uses `@radix-ui/react-id` (Dialog, Tooltip, Popover, DropdownMenu) emits `radix-<counter>` IDs that don't round-trip SSR → CSR cleanly under React 19 + Next 16.
**When to use:** Above-the-fold Radix subtrees. Below-the-fold usage (rendered on user action) does not need this.
**Example:**

```tsx
// Source: apps/blakepetersen.io/src/components/sidebar-drawer.tsx
// Pattern established Phase 24.1 D-09; reuse verbatim for Modal.
'use client'
import { useState, useEffect } from 'react'
import { Dialog } from 'radix-ui'

export function Modal({ trigger, children, ...props }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <>{trigger}</>    // SSR: emit plain trigger element
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>{children}</Dialog.Portal>
    </Dialog.Root>
  )
}
```
[VERIFIED: apps/blakepetersen.io/src/components/sidebar-drawer.tsx lines 6-44, Phase 24.1-03 SUMMARY]

### Pattern 2: Collection Index Page via Factory

**What:** Each collection (skills, hooks, configs, guides, posts) has its own `app/{slug}/page.tsx` that delegates to `createCollectionIndexPage(slug)`. There is **no `app/[collection]/page.tsx` dynamic route.**
**When to use:** Plan 06 modifies the factory body in `collection-pages.tsx` once; all 5 index routes inherit.
**Example:**

```tsx
// Source: apps/blakepetersen.io/src/app/configs/page.tsx
import { createCollectionIndexPage } from '../../lib/collection-pages'
export const revalidate = 3600
const { generateMetadata, Page } = createCollectionIndexPage('configs')
export { generateMetadata }
export default Page
```
[VERIFIED: 5 index routes all use this pattern — configs/page.tsx, hooks/page.tsx, guides/page.tsx, skills/page.tsx, posts/page.tsx]

### Pattern 3: Detail Page via Factory

**What:** Each detail route (`skills/[...slug]`, `configs/[...slug]`, etc.) delegates to `createCollectionDetailPage(slug)`. The factory switches between `PostLayout` and `DxContentLayout` based on `collection.layout`.
**When to use:** Plan 03 modifies `DxContentLayout` + possibly `MDXContent`'s components map. The factory itself likely doesn't need changes unless PrevNextNav slots into it (recommended).
**Example:** See `apps/blakepetersen.io/src/lib/collection-pages.tsx` lines 32-94.

### Pattern 4: MDX Components Map Injection

**What:** `MDXContent` component accepts an optional `components` prop merged over `mdxComponents + headingOverrides`.
**When to use:** If Skills Detail MDX uses `<DecisionRationale>` inline, register it in either (a) the shared `mdxComponents` (broadcasts to every MDX consumer) or (b) the Skills-specific `components` prop (scoped to Skills only). Prefer (a) for consistency unless a Pencil frame dictates scoping.
**Example:**

```tsx
// Extend packages/artax-ui/src/mdx/components.tsx
export const mdxComponents = {
  ...existing,
  AuthorNote: AuthorNoteMolecule,        // re-use the primitive
  DecisionRationale: DecisionRationaleMolecule,
}
```
[VERIFIED: mdx-content.tsx line 55 — `{ ...mdxComponents, ...headingOverrides, ...components }`]

### Anti-Patterns to Avoid

- **Don't build a parallel Modal with its own Radix imports.** The existing `Dialog` export chain already solves focus-trap, Esc, outside-click, portal, and aria wiring. Compose or re-export; do not duplicate.
- **Don't forget the AuthorNote name collision.** `mdxComponents.AuthorNote` exists today with specific styling (`border-l-2 border-info bg-[var(--surface-info)]`). The new primitive must either (a) replace this implementation or (b) be named something else. Do not ship two `AuthorNote`s.
- **Don't delete `page-navigation.tsx` until `PrevNextNav` is wired in `collection-pages.tsx` / `PostLayout` / `DxContentLayout`.** Git-blame-friendly swap: in one commit, introduce PrevNextNav + switch consumers; in a follow-up commit, delete the old file.
- **Don't extend `globals.css` in bp.io with new CSS custom properties.** Token additions go in `packages/artax-ui/src/styles/globals.css` (Phase 25 canonical).
- **Don't introduce `text-xl` / `text-2xl` / `text-4xl` — the typography scale is capped at 4 sizes** (`text-xs`, `text-base`, `text-lg`, `text-3xl`) per UI-SPEC.
- **Don't use `font-sans` for chrome or prose** — bp.io is mono-first. `font-sans` is declared but reserved.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trap in Modal | Custom `keydown` handler + tabbable query | Radix `Dialog.Content` | Radix handles Tab/Shift-Tab loop, restores focus on close, respects `inert` |
| Escape-to-close, outside-click | Custom event listeners | Radix `Dialog` defaults | Already wired; also handles `pointer-events: none` correctly |
| Portal targeting in App Router | Manual `createPortal(el, document.body)` | `Dialog.Portal` | Handles SSR (returns null server-side); integrates with Radix's own collision detection |
| `aria-labelledby` / `aria-describedby` wiring | Hand-written IDs | `Dialog.Title` / `Dialog.Description` | Auto-linked; satisfies a11y audits |
| Prev/next sibling resolution | Manual array search in every page | Existing `buildNavData` + `getPrevNext` in `lib/navigation.ts` | Already solved, covered by tests [VERIFIED: apps/blakepetersen.io/tests/navigation.test.ts] |
| Next.js 404 on missing slug | Hand-rolled "not found" UI | `notFound()` + `app/not-found.tsx` | Already wired in factory [VERIFIED: collection-pages.tsx line 62] |
| Theme-aware syntax highlighting | Custom `prism` integration | `@shikijs/rehype` with theme-aware token registration | Shipped Phase 22 |
| Hardcoded color literals for status | Inline `bg-amber-500`, `text-cyan-500` | Semantic tokens `text-info`, `text-success`, `text-warning`, `text-destructive` | Phase 25 audit canonical |

**Key insight:** The bp.io codebase has already solved nav resolution, MDX rendering, theme plumbing, SSR-safe Radix, static params generation, and metadata composition. Phase 26 should *consume* these primitives, not replicate them. The only genuinely new code is visual composition of the 5 page scaffolds and the 3-4 new primitives.

## Runtime State Inventory

*(This phase is not a rename/refactor/migration — section omitted per spec. No stored data, live service config, OS-registered state, secrets, or build artifacts embed names that change in Phase 26. New primitive names are additive to artax-ui's barrel.)*

One soft note: **`apps/blakepetersen.io/src/components/page-navigation.tsx`** is consumed somewhere (check `DxContentLayout`, `PostLayout`). After introducing `PrevNextNav`, update call-sites and then delete — grep during Plan 03 execution, do not assume.

## Common Pitfalls

### Pitfall 1: AuthorNote Name Collision

**What goes wrong:** Plan 01 extracts a new `AuthorNote` molecule to `packages/artax-ui/src/components/molecules/author-note/`, but `packages/artax-ui/src/mdx/components.tsx` already exports `AuthorNote` inside `mdxComponents` with a specific visual (`border-l-2 border-info` + `// author_note` caption). Two different `AuthorNote`s ship; MDX renders one, pages import the other.
**Why it happens:** The existing `AuthorNote` is internal to the MDX map, not in the public barrel — easy to miss.
**How to avoid:** During Plan 01, grep `mdxComponents` and `AuthorNote` across both packages. Reconcile: have `mdxComponents.AuthorNote` import from the new molecule. The molecule becomes the single source of truth; the MDX map wires it.
**Warning signs:** Test asserting `<aside class="border-l-2 border-info">` after render fails because the new primitive uses `border-l-primary` per UI-SPEC.

### Pitfall 2: Modal SSR Hydration Drift

**What goes wrong:** New Modal used above-the-fold (e.g., subscribe CTA on Homepage) emits `aria-controls="radix-1"` SSR and `aria-controls="radix-0"` client-side → hydration warning.
**Why it happens:** `@radix-ui/react-id` uses a module-scoped counter + `useLayoutEffect` that doesn't round-trip cleanly under React 19.
**How to avoid:** Apply the mounted-flag gate verbatim from `sidebar-drawer.tsx` (Phase 24.1-03 pattern). Test via `renderToString(<Modal …/>)` and assert `.not.toMatch(/aria-controls="radix-/)`.
**Warning signs:** `console.error` with "Hydration failed because the server rendered HTML didn't match the client."

### Pitfall 3: Client-Boundary Creep on Homepage

**What goes wrong:** Adding Modal to Homepage accidentally converts the whole page to `'use client'`, breaking SSG and losing `getCollection('posts')` at build time.
**Why it happens:** Top-level imports of client-only primitives force the entire file to be client if the file itself has interactive state.
**How to avoid:** Wrap Modal in a separate `'use client'` island component (e.g., `src/components/home-subscribe-modal.tsx`). Import the island into Homepage; the Homepage stays a server component. Pattern already used — see `SidebarDrawer` imported into server `Header`.
**Warning signs:** `page.tsx` gains `'use client'` directive; `getCollection` throws "cannot be used in client component" or Velite data fetch runs at request time instead of build.

### Pitfall 4: MDX Component Registration Scope

**What goes wrong:** `<DecisionRationale>` is registered in the global `mdxComponents` map but only Skills Detail MDX bodies actually use it. Posts/guides/hooks/configs MDX that happens to use the literal string `DecisionRationale` (unlikely, but possible in code blocks) now renders as the component.
**Why it happens:** MDX components map is global across the app.
**How to avoid:** Register globally unless a specific collision is observed. Monitor Plan 03 verification; if a collision surfaces, scope by passing the `components` prop only in the Skills detail path (easy downgrade — `MDXContent` already accepts per-invocation overrides [VERIFIED: mdx-content.tsx line 55]).
**Warning signs:** A random code block in a post renders as a rationale card.

### Pitfall 5: `badgeVariants` Drift

**What goes wrong:** Pencil's Badge frame uses `info`, `success`, `warning` variants (tokens available), but the existing `badgeVariants` cva only has `default`, `outline`, `secondary`. Plan 01 extends the variant set but existing Badge consumers (bp.io `collection-pages.tsx` `<Badge variant="secondary">`) rely on the old set.
**Why it happens:** Additive variant extensions are safe, but renaming isn't.
**How to avoid:** Additive only — extend `badgeVariants` with `info`, `success`, `warning`, `destructive`. Do not rename existing variants. Grep `<Badge` usage before publishing.
**Warning signs:** Tag pills on the listing page disappear or render default (primary amber) instead of muted secondary.

### Pitfall 6: Theme-Aware Color Literals Hidden in New Primitives

**What goes wrong:** `DecisionRationale` ships with `bg-amber-50` / `border-amber-500` (hardcoded tones) rather than `bg-[var(--surface-warning)]` / `border-warning`. Phase 25 audit passes today but regresses.
**How to avoid:** Plan 01 verification includes `grep -rE 'bg-(amber|cyan|emerald|red|zinc)-[0-9]'` in new primitive files — must return empty. Use semantic tokens only. Any exception carries `// theme-static: <reason>` per Phase 25 D-03.
**Warning signs:** Phase 25 theme-static grep count rises.

## Code Examples

### Modal as Composition over Dialog

```tsx
// packages/artax-ui/src/components/organisms/modal/modal.tsx
// ABOUTME: Modal — thin composition over artax-ui Dialog with header/body/footer slots.
// ABOUTME: Applies mounted-flag SSR gate per Phase 24.1 D-09 for above-the-fold usage.
'use client'
import { useState, useEffect, type ReactNode } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../dialog/dialog'
import { cn } from '../../../lib/utils'

type ModalProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  trigger?: ReactNode
  children: ReactNode
  className?: string
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const

export function Modal({ open, onOpenChange, size = 'md', trigger, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted && trigger) return <>{trigger}</>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn(sizeClass[size], className)}>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Slot re-exports so consumers write <Modal.Title>, <Modal.Description>
Modal.Title = DialogTitle
Modal.Description = DialogDescription
Modal.Close = DialogClose
```
[PATTERN: Radix Dialog docs + Phase 24.1 mounted-flag]

### PrevNextNav (Extracted from `page-navigation.tsx`)

```tsx
// packages/artax-ui/src/components/molecules/prev-next-nav/prev-next-nav.tsx
// ABOUTME: PrevNextNav — symmetric prev/next article navigation at the foot of content pages.
// ABOUTME: Mono terminal arrow style, consumers pass { href, label } for either side.
import Link from 'next/link'
import { cn } from '../../../lib/utils'

type NavSlot = { href: string; label: string }

type PrevNextNavProps = {
  prev?: NavSlot
  next?: NavSlot
  className?: string
}

export function PrevNextNav({ prev, next, className }: PrevNextNavProps) {
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Article navigation"
      className={cn('mt-12 flex justify-between border-t border-border pt-6 font-mono text-sm', className)}
    >
      <div>
        {prev && (
          <Link href={prev.href} className="text-muted-foreground hover:text-primary transition-colors">
            {'← prev: '}{prev.label}
          </Link>
        )}
      </div>
      <div className="ml-auto">
        {next && (
          <Link href={next.href} className="text-muted-foreground hover:text-primary transition-colors">
            {'next: '}{next.label}{' →'}
          </Link>
        )}
      </div>
    </nav>
  )
}
```
[SOURCE: derived from apps/blakepetersen.io/src/components/page-navigation.tsx + UI-SPEC Copywriting Contract]

**Caveat for Plan 01 writer:** `next/link` inside `packages/artax-ui` introduces a soft coupling to Next.js — currently artax-ui's Button/Link primitives don't depend on Next. Two options: (a) accept the dep (artax-ui is already consumed by Next apps only), (b) expose an `asChild` slot pattern so consumers pass `<Link>` themselves. **Recommend (a)** — simpler, matches bp.io consumption reality. If tests break because Next context isn't available in Jest jsdom for artax-ui, fall back to (b).

### Badge Variant Extension

```tsx
// Additive change to packages/artax-ui/src/components/atoms/badge/badge.tsx
const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 font-mono text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-border text-foreground',
        secondary: 'bg-muted text-secondary-foreground',
        // NEW — additive only
        info: 'bg-[var(--surface-info)] text-info',
        success: 'bg-[var(--surface-success)] text-success',
        warning: 'bg-[var(--surface-warning)] text-warning',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)
```

### Homepage Modal Client Island (if Pencil demands)

```tsx
// apps/blakepetersen.io/src/components/home-subscribe-modal.tsx
'use client'
// ABOUTME: Client island wrapping Modal for the contribute/subscribe CTA.
// ABOUTME: Keeps page.tsx as a server component so getCollection runs at build time.
import { useState } from 'react'
import { Modal } from 'artax-ui'

export function HomeSubscribeModal() {
  const [open, setOpen] = useState(false)
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={<button className="text-primary hover:underline">$ subscribe</button>}
    >
      <Modal.Title>subscribe</Modal.Title>
      {/* form body */}
    </Modal>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Radix Dialog full SSR render | Mounted-flag gate above fold | Phase 24.1 (2026-04-19) | Eliminates React 19 hydration warnings |
| Hardcoded color literals in components | Semantic tokens (`bg-primary`, `text-muted-foreground`, `text-info`) | Phase 25 | All bp.io surfaces now theme-aware |
| Per-page inline stack chips | `Badge` primitive | Phase 26 (this phase) | Unifies chip/tag/badge visual contract |
| `page-navigation.tsx` bp.io-local | `PrevNextNav` artax-ui molecule | Phase 26 (this phase) | Primitive reusable across consumers |
| `mdxComponents.AuthorNote` inline | `AuthorNote` molecule (MDX re-uses) | Phase 26 (this phase) | Single source of truth |

**Deprecated/outdated:**
- `apps/blakepetersen.io/src/components/page-navigation.tsx` — scheduled for deletion after `PrevNextNav` wired in.
- Inline Homepage stack-chip spans (`<span className="border border-border px-2 py-1 font-mono text-xs …">`) — replace with `<Badge variant="outline">`.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + @testing-library/react 16.3.2 + jest-environment-jsdom |
| Config file | `packages/artax-ui/jest.config.*` (existing) and `apps/blakepetersen.io/jest.config.*` (existing) |
| Quick run command | `pnpm --filter artax-ui test` or `pnpm --filter blakepetersen.io test` |
| Full suite command | `turbo run test` (runs all 5 packages: 914+ tests baseline per Phase 24.1) |
| Typecheck | `turbo run typecheck` |
| Build smoke | `turbo run build` (verify zero hydration warnings in stderr, per 24.1 pattern) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SITE-03 | Homepage renders with preserved data contract (recent posts, categories, stack) | integration (SSG snapshot) | `pnpm --filter blakepetersen.io test page` | ❌ Wave 0 — `apps/blakepetersen.io/tests/app/page.test.tsx` |
| SITE-03 | Homepage uses Badge primitive for stack chips | unit (DOM query) | same | ❌ Wave 0 |
| SITE-04 | Skills Detail renders MDX + PrevNextNav at foot | integration | `pnpm --filter blakepetersen.io test skills` | ❌ Wave 0 — `apps/blakepetersen.io/tests/app/skills-detail.test.tsx` |
| SITE-05 | About page renders with Badge chips + CTAs | unit | `pnpm --filter blakepetersen.io test about` | ❌ Wave 0 (optional — low risk, mostly static) |
| SITE-06 | Start Here resolves 4 steps against live content | integration | existing `tests/navigation.test.ts` covers `resolveSteps` behavior | ✅ Existing coverage — extend if needed |
| SITE-07 | Collection Listing: all 5 index routes render items via factory | integration | existing `tests/navigation.test.ts` + new listing test | ❌ Wave 0 — one listing test covers factory; no per-route file needed |
| Modal primitive | Focus trap, Esc closes, outside-click closes, aria-labelledby wired | unit (RTL) | `pnpm --filter artax-ui test modal` | ❌ Wave 0 — `packages/artax-ui/tests/components/modal.test.tsx` |
| Modal primitive | SSR emits no `aria-controls="radix-"` | unit (`renderToString`) | same | ❌ Wave 0 (pattern from `apps/artax/tests/header.test.tsx`) |
| Badge primitive | All 7 variants render with correct token classes | unit | `pnpm --filter artax-ui test badge` | ✅ Existing `badge.test.tsx` — extend |
| PrevNextNav | Prev-only, next-only, both, neither (returns null) cases | unit | `pnpm --filter artax-ui test prev-next-nav` | ❌ Wave 0 |
| AuthorNote | Renders aside with role="note"; D-05 gate — no hardcoded first-person copy in source | unit + grep | `pnpm --filter artax-ui test author-note` + Plan 01 grep step | ❌ Wave 0 |
| DecisionRationale | Collapsed/expanded, alternatives list, heading semantics | unit | `pnpm --filter artax-ui test decision-rationale` | ❌ Wave 0 |
| D-07 light/dark | Each page renders in both modes; theme toggle mid-page doesn't flicker | **manual gate per page plan** | manual smoke (Blake visual verification) | — (human-gated dimension, acceptable per Nyquist) |
| Hardcoded literal regression | No new `bg-(amber\|cyan\|emerald\|red\|zinc)-[0-9]+` in modified files | static (grep) | grep during verification | — (command in VERIFICATION) |
| Hydration clean | `turbo run build` stderr has zero hydration warnings | integration | `turbo run build` with stderr inspection | ✅ Existing pattern from Phase 24.1 |

### Sampling Rate

- **Per task commit:** `pnpm --filter <affected-package> test` — runs only the touched package (~30 seconds typical).
- **Per wave merge:** `turbo run test typecheck` — full pipeline (~2-3 min, 914+ tests).
- **Phase gate:** `turbo run test typecheck build` all green, plus per-page manual light/dark smoke per D-07 before marking phase complete.

### Wave 0 Gaps

Test scaffolding to create during Plan 01 / Plan 02 bootstrap:

- [ ] `packages/artax-ui/tests/components/modal.test.tsx` — focus trap, Esc, outside-click, SSR no-radix-id assertion (reuse pattern from `apps/artax/tests/header.test.tsx`)
- [ ] `packages/artax-ui/tests/components/prev-next-nav.test.tsx` — 4 slot combinations, aria-label wiring
- [ ] `packages/artax-ui/tests/components/author-note.test.tsx` — presence + D-05 gate (no hardcoded "Blake's note:" in output)
- [ ] `packages/artax-ui/tests/components/decision-rationale.test.tsx` — collapsed/expanded behavior, headings, alternatives
- [ ] `packages/artax-ui/tests/components/badge.test.tsx` — **extend** existing file with 4 new variants (info, success, warning, destructive)
- [ ] `apps/blakepetersen.io/tests/app/page.test.tsx` — Homepage snapshot + Badge usage assertion + link integrity
- [ ] `apps/blakepetersen.io/tests/app/skills-detail.test.tsx` — MDX render + PrevNextNav presence (or extension of existing MDX test if one exists)
- [ ] Hardcoded-literal regression grep integrated into a phase-level verification doc (not a separate test file)

Framework install: not needed. Jest + testing-library already present in both packages per `package.json`. Shared fixtures not customary — tests stand alone.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Phase 26 introduces no auth surface |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | All pages public |
| V5 Input Validation | partial | Modal may host a subscribe/contact form in the future — ship the primitive without form content; validation becomes the consumer's problem if/when added (deferred from scope) |
| V6 Cryptography | no | No crypto work |
| V14 Configuration | yes | No hardcoded secrets; no env-var exposure in client bundles |

### Known Threat Patterns for Next.js 16 + React 19 + MDX

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| MDX XSS via runtime code evaluation | Tampering / Elevation | Content is authored in-repo and compiled at build time by Velite — untrusted MDX input does not enter the pipeline. No runtime user-submitted MDX. [VERIFIED: mdx-content.tsx with Velite content.ts] |
| Open-redirect via `Link href` | Tampering | `next/link` internal-only by default; external links use `<a>` with explicit domains (e.g., GitHub URLs in `page.tsx`). Preserve this — do not accept arbitrary `href` into new Modal/PrevNextNav from user content. |
| Raw HTML injection (React's unsafe-inner-HTML API) | XSS / Tampering | Not used by any new primitive. Banned for Phase 26 — all primitives render via JSX children only. |
| Client-side secrets leaked in bundle | Information Disclosure | No new env var reads in any Phase 26 primitive or page. |

**No new attack surface introduced** — Phase 26 is a visual rewrite over existing, already-audited data flows.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Pencil `batch_get` is accessible to Claude at plan/execute time (Pencil desktop app must be running for MCP to connect) | Pencil MCP tool access | Plan 01 blocks on ambiguous primitive API; fall back to reading UI-SPEC-specified variants verbatim |
| A2 | Next.js 16.2.2 + React 19.2.4 + `@radix-ui/react-id` still exhibits the hydration divergence that Phase 24.1-03 documented. If a future Radix patch fixes upstream SSR, the mounted-flag gate remains harmless but unnecessary. | Pattern 1 (Mounted-flag SSR gate) | None — gate is safe to apply even if no longer strictly required |
| A3 | `next/link` imports inside `packages/artax-ui` don't break the package's Jest jsdom test environment. If they do, PrevNextNav falls back to `asChild` pattern. | PrevNextNav code example | Small Plan 01 rework; detected at test time |
| A4 | The existing `mdxComponents.AuthorNote` has no consumers outside the MDX map (i.e., no bp.io code directly imports it). Search needed during Plan 01 to confirm. | Pitfall 1 | If a direct consumer exists, reconciliation path is slightly different (re-export) |

## Open Questions (RESOLVED)

All three open questions have been resolved prior to execution. Preserved here for traceability.

### 1. Does the Pencil frame for Modal show a trigger-embedded pattern or a controlled (imperative) open/close?

- What we know: UI-SPEC line 168 specifies `open: boolean, onOpenChange: (open: boolean) => void` — controlled.
- What's unclear: Whether the `trigger` slot is expected (convenience for asChild usage) or whether consumers always manage open externally.
- **RESOLVED (2026-04-19):** Deferred to execution per D-06. Plan 01 Task 2 executor reads `mcp__pencil__get_screenshot` on the Modal frame at execute-time and chooses trigger-embedded vs controlled. Default: controlled (matches existing Dialog API). The primitive supports both shapes — `trigger` is optional; when provided, wraps in `DialogTrigger asChild`. No planning-time blocker.

### 2. Does Skills Detail MDX actually use `<AuthorNote>` / `<DecisionRationale>` today?

- What we know: `mdxComponents.AuthorNote` exists, so at least one MDX file somewhere in the content tree probably uses it. No grep run yet across `content/` directories.
- What's unclear: Whether Pencil's Skills Detail frame demands these blocks inline, or whether they're reserved for About/Start Here.
- **RESOLVED (2026-04-19):** Grep against `apps/blakepetersen.io/content/` for `<AuthorNote` and `<DecisionRationale` returned **zero matches** (verified by plan-checker). Neither primitive is currently used inline in MDX. Plan 03's conditional scoped-registration branch is therefore dead code and has been removed. The MDX pipeline stays untouched in Plan 03. Plan 01b still ships the AuthorNote re-export (`mdxComponents.AuthorNote: AuthorNoteMolecule`) as the canonical single-source-of-truth reconciliation per Pitfall 1 — that work is independent of current content usage.

### 3. Does the Homepage Pencil frame include a Modal?

- What we know: UI-SPEC line 214 says "Primitives introduced: Badge …, optionally Modal (if Pencil frame wires a subscribe or contact modal off `// contribute`)".
- What's unclear: Pencil's actual Homepage frame.
- **RESOLVED (2026-04-19):** Deferred to execution per D-06. Plan 02 executor reads `mcp__pencil__get_screenshot` on the Homepage frame. If a Modal is present, the executor creates `apps/blakepetersen.io/src/components/home-subscribe-modal.tsx` as a `'use client'` island (per Pitfall 3 client-boundary discipline). If absent, the executor skips the Modal-related sub-step entirely. Either way, the Modal primitive still ships in Plan 01 (other pages may consume it; the artax-ui catalog expects it).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js LTS | Next.js 16 build | ✓ (per `.tool-versions`) | lts | — |
| pnpm | Monorepo | ✓ | 9.0.0 (declared `packageManager`) | — |
| Pencil desktop app | `mcp__pencil__*` tool access | assumed ✓ (Blake's machine) | — | `batch_get` works only while app is running; if not, fall back to UI-SPEC-written contracts |
| Jest 30 + jsdom | Primitive + page tests | ✓ | 30.3.0 | — |
| Velite | MDX compilation | ✓ | 0.3.1 | — |
| Shiki | Code-block highlighting | ✓ | 4.0.2 | — |
| Turborepo | Pipeline runner | ✓ | 2.6.1 | — |
| `radix-ui` meta package | Modal (composes Dialog) | ✓ | 1.4.3 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** Pencil MCP tool — if desktop app isn't running, Claude composes from UI-SPEC contracts and screenshots gathered in advance. Acceptable per D-06.

## Sources

### Primary (HIGH confidence)

- `apps/blakepetersen.io/src/app/page.tsx` — Homepage current state (surgical rewrite target)
- `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` — Detail page factory consumer
- `apps/blakepetersen.io/src/app/{about,start-here}/page.tsx` — Static page structure
- `apps/blakepetersen.io/src/app/{configs,hooks,guides}/page.tsx` — Listing route shape (factory-based, per-collection)
- `apps/blakepetersen.io/src/lib/collection-pages.tsx` — Factory for detail + index pages
- `apps/blakepetersen.io/src/lib/collection-registry.ts` — Collection metadata (5 collections)
- `apps/blakepetersen.io/src/components/page-navigation.tsx` — Existing prev/next shape (to extract)
- `apps/blakepetersen.io/src/components/mdx-content.tsx` — MDX rendering with components prop
- `apps/blakepetersen.io/src/components/sidebar-drawer.tsx` — Mounted-flag SSR gate reference
- `apps/blakepetersen.io/src/components/header.tsx` — Server-component header pattern
- `packages/artax-ui/src/index.ts` — Barrel; existing Badge + Dialog exports
- `packages/artax-ui/src/components/atoms/badge/badge.tsx` — Badge with 3 variants (extend additively)
- `packages/artax-ui/src/components/organisms/dialog/dialog.tsx` — Dialog wraps Radix; Modal composes over this
- `packages/artax-ui/src/mdx/components.tsx` — MDX map with existing AuthorNote (name-collision source)
- `packages/artax-ui/src/styles/globals.css` — Token surface (light/dark parity)
- `packages/artax-ui/tests/components/dialog.test.tsx` — Test pattern reference
- `.planning/phases/24.1-editable-previews-polish/24.1-03-SUMMARY.md` — Mounted-flag pattern authoritative source
- `.planning/phases/26-blakepetersen-io-page-updates/26-CONTEXT.md` — Locked decisions D-01..D-07
- `.planning/phases/26-blakepetersen-io-page-updates/26-UI-SPEC.md` — Design contract
- `.planning/REQUIREMENTS.md` — SITE-03..SITE-07

### Secondary (MEDIUM confidence)

- Radix UI Dialog documentation (via Context7 / radix-ui.com) — patterns for focus trap, portal, aria wiring. Behavior verified against existing Dialog tests but full API surface not re-fetched this session (Phase 24/24.1 already exercised it).

### Tertiary (LOW confidence)

None — every claim above references in-repo source or a completed phase artifact.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages present in lockfile, no new installs
- Architecture: HIGH — factories, data flow, and SSR boundaries read directly from source
- Pitfalls: HIGH — AuthorNote collision, Modal hydration, client-boundary creep all verified in-code
- Primitive API: MEDIUM — surfaces refined by Pencil `batch_get` at plan-time per D-06

**Research date:** 2026-04-19
**Valid until:** 2026-05-19 (stable domain; re-verify if Next.js 16 → 17 or React 19 → 20 ship before execution)

---

*Phase: 26-blakepetersen-io-page-updates*
*Research complete: 2026-04-19*
