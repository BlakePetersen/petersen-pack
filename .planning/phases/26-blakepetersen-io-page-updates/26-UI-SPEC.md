---
phase: 26
slug: blakepetersen-io-page-updates
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-19
---

# Phase 26 — UI Design Contract

> Visual and interaction contract for the bp.io page rewrite against approved Pencil designs. Pixel specs are read from Pencil at plan/execute time per D-06; this contract locks tokens, typography, primitive API surfaces, and per-page composition rules.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (shadcn-aligned tokens via `packages/artax-ui`; no shadcn CLI) |
| Preset | not applicable |
| Component library | Radix Primitives (via artax-ui organisms: Dialog, Dropdown, Accordion, Tooltip, Tabs) |
| Icon library | `lucide-react` (already used across bp.io; any new iconography must come from lucide unless Pencil frame dictates otherwise) |
| Font | `JetBrains Mono` (`--font-mono`, body/UI); `IBM Plex Mono` (`--font-mono-alt`, headings/editorial); `Inter` (`--font-sans`, reserved — body copy stays mono per current bp.io terminal aesthetic) |

Source of tokens: `packages/artax-ui/src/styles/globals.css` and `packages/artax-ui/src/styles/theme.css`. bp.io is a strict consumer — no token extensions at the bp.io level (D-04 + Phase 25 D-05).

---

## Spacing Scale

Declared values (canonical 4px-base set):

| Token | Value | Usage |
|-------|-------|-------|
| 1 | 4px | Icon-to-text gap, chip/pill vertical padding (`py-1`), tight inline spacing |
| 2 | 8px | Badge padding, compact flex gap, chip/pill horizontal padding (`px-2`), nav-item vertical rhythm (`py-2`) |
| 4 | 16px | Default card padding, paragraph rhythm, grid gap |
| 6 | 24px | Section internal padding, panel inset |
| 8 | 32px | Section vertical break |
| 12 | 48px | Major section break (hero → stack, collections → posts) |
| 16 | 64px | Page-level top/bottom padding at `md+` breakpoints |

**Container:** `max-w-[1600px] px-4 py-8` is the bp.io standard per `page.tsx` current state — carry forward verbatim unless a specific Pencil frame dictates a narrower reading column.

**Reading column width (Skills Detail, About, Start Here content bodies):** `max-w-[72ch]` to `max-w-prose` (pick per page based on Pencil frame).

Exceptions: none. All spacing conforms to the canonical set {4, 8, 16, 24, 32, 48, 64}.

---

## Typography

Terminal-aesthetic: body copy is monospace. Headings alternate between `font-mono` (JetBrains Mono, UI chrome) and `font-mono-alt` (IBM Plex Mono, editorial). Inter is defined on the body as a sans fallback but is **not** used for content surfaces in this phase.

Declared sizes (exactly 4 distinct tokens): `text-xs` (12), `text-base` (16), `text-lg` (18), `text-3xl` (30).

| Role | Size (Tailwind) | Px | Weight | Line Height | Font |
|------|-----------------|----|----|-------------|------|
| Caption / meta / chip / pill | `text-xs` | 12 | 400 | 1.5 (`leading-normal`) | `font-mono` |
| Heading (section label, `// section_name`) | `text-xs` | 12 | 400 | 1.5 | `font-mono` (muted) |
| Body / UI | `text-base` | 16 | 400 | 1.5 | `font-mono` |
| Heading H3 | `text-base` | 16 | 500 (`font-medium`) | 1.4 | `font-mono` |
| Lead / prose | `text-lg` | 18 | 400 | 1.6 (`leading-relaxed`) | `font-mono` |
| Heading H2 | `text-lg` | 18 | 500 | 1.3 | `font-mono-alt` |
| Heading H1 (display) | `text-3xl` | 30 | 500 | 1.2 (`leading-tight`) | `font-mono-alt` |

**Responsive modifier (does not constitute an additional size token):** H1 renders at `text-3xl` across breakpoints. On mobile, density may be tuned via `leading-tight` → `leading-none` and/or `tracking-tight` to preserve headline scan-ability inside narrower viewports. No swap to a smaller size token is permitted — the 4-size scale is a hard cap.

**Declared weights:** 400 (regular), 500 (medium). No 600/700/800 in this phase — terminal aesthetic stays flat.

**Line-height defaults:** body 1.5, headings 1.2–1.4 as tabulated. Do not override without Pencil-frame evidence.

**`// section_label` convention:** bp.io uses `// section_name` captions above sections as a structural motif (see current `page.tsx` lines 28, 44, 56, 81, 119). Preserve this motif across all 5 page rewrites; it is part of the brand identity, not optional chrome.

---

## Color

60/30/10 split expressed in semantic tokens (values per `globals.css`):

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Dominant (60%) | `bg-background` / `text-foreground` | `#F5F5F5` / `#171717` | `#0A0A0A` / `#FAFAFA` | Page background, body copy |
| Secondary (30%) | `bg-card` / `bg-secondary` / `border-border` | `#EBEBEB` / `#E5E5E5` / `#D4D4D4` | `#0F0F0F` / `#1F1F1F` / `#2A2A2A` | Card panels, nav chrome, separators, inset surfaces |
| Accent (10%) | `text-primary` / `bg-primary` / `ring-ring` | `#D97706` (amber-600) | `#F59E0B` (amber-500) | **Reserved elements** below |
| Muted | `text-muted-foreground` | `#737373` | `#6B7280` | Captions, meta, timestamps, section labels |
| Destructive | `text-destructive` / `bg-destructive` | `#DC2626` | `#EF4444` | Destructive actions + error states only |
| Status — success | `text-success` | `#059669` | `#10B981` | Positive status (e.g., "shipped", "verified") |
| Status — info | `text-info` | `#0891B2` | `#06B6D4` | Informational badges |
| Status — warning | `text-warning` | `#D97706` | `#F59E0B` | Caution, deferred, beta |

**Accent (`text-primary` / `bg-primary` / `ring-ring`) reserved for:**
1. Primary CTAs (`[skills]`, `[hooks]`, `[configs]`, `[guides]`, `$ report-problem`, `$ suggest-improvement`, etc. — terminal-style anchor links)
2. Hover state on interactive cards and list rows (`hover:border-primary`, `hover:text-primary`)
3. Focus rings (`focus-visible:ring-2 focus-visible:ring-ring`)
4. The single brand-accent stroke or dot in Badge / Callout `info` variants when Pencil explicitly shows amber
5. The active sidebar nav item (`SidebarNavItem/Active` per Pencil)

**Never use accent for:** body decoration, every interactive element, every heading, backgrounds of non-CTA surfaces.

**Hardcoded color literals are forbidden** (Phase 25 audit canonical). Any exception must be annotated `// theme-static: <reason>` per Phase 25 D-03.

---

## Interaction States

Apply uniformly across new primitives (Plan 01) and page recompositions (Plans 02–06):

| State | Treatment |
|-------|-----------|
| Hover (link / card) | `hover:text-primary` on link; `hover:border-primary` on card/row; no background shift unless Pencil shows one |
| Focus-visible | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` |
| Active (pressed) | `active:text-primary-foreground active:bg-primary` for buttons; no separate treatment for links |
| Disabled | `disabled:opacity-50 disabled:pointer-events-none` |
| Error (input) | `aria-invalid:border-destructive aria-invalid:ring-destructive` |
| Loading | Skeleton pattern: `bg-muted animate-pulse` rectangles matching final layout footprint |
| Selected (nav) | `text-primary` + left-edge 2px `bg-primary` bar (matches Pencil `SidebarNavItem/Active`) |

**Motion:** instant state transitions except `transition-colors` on hover (150ms default). No page-level or theme-toggle transitions in this phase (deferred per Phase 25).

---

## Copywriting Contract

Tone: terminal/editorial hybrid. Terminal chrome uses shell-command voice (`$ verb-noun`, `// section_label`, `[link]`). Editorial prose (About, Start Here, Skills Detail body) uses first-person ("I build", "my approach") consistent with bp.io's established voice.

| Element | Copy |
|---------|------|
| Homepage primary CTA block | `[skills]`, `[hooks]`, `[configs]`, `[guides]` — mono bracket convention (preserve from current `page.tsx`) |
| Homepage secondary CTA | `$ report-problem`, `$ suggest-improvement` — shell-command convention (preserve) |
| Section captions | `// section_name` (e.g., `// dx_workbench`, `// stack`, `// collections`, `// recent_posts`, `// contribute`) |
| Empty state heading (Collection Listing) | `// empty_collection` |
| Empty state body (Collection Listing) | `No entries yet. Check back, or contribute one → [link to contribute guide].` |
| Empty state heading (Skills Detail when MDX missing) | `// not_found` |
| Empty state body (Skills Detail) | `This skill hasn't been written yet. See the [skills index] for what's available.` |
| Error state (generic page-level) | `// error` heading; body: `Something broke. [Retry] or [report-problem].` |
| Destructive confirmation | None in scope — no destructive user actions exist on these 5 pages. Modal primitive supports destructive variant for future reuse. |
| Start Here CTA | `$ start-here` — landing-page ritual CTA |
| Skills Detail Prev/Next | `← prev: {title}` / `next: {title} →` (symmetric, mono, no extra chrome) |
| About page CTA (contact) | `$ email-blake` / `$ find-me-on-github` |

**Voice rules:**
- Chrome (nav, labels, captions, CTAs, metadata) is lowercase mono.
- Editorial prose (About narrative, Start Here walkthrough, Skills Detail MDX bodies) is sentence case and mixed case — not constrained to lowercase.
- No exclamation marks, no emoji in UI chrome.
- Date format: `MMM D, YYYY` via `toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })` — preserve current Homepage convention.

---

## Primitive API Contracts (Plan 01 Targets)

All five primitives land in `packages/artax-ui/src/components/{layer}/` and are exported from `packages/artax-ui/src/index.ts`. Atomic-Design layer noted per primitive. API surfaces are targets for Plan 01; a Pencil `batch_get` read per primitive at plan-time refines prop names/variants.

### Badge (atom)

Already exported from `packages/artax-ui/src/index.ts` line 7 (`Badge, badgeVariants`). **Verify** the Pencil `Badge` frame's variant set maps to the existing `badgeVariants` shape before adding variants. If Pencil introduces a new variant (e.g., `beta`, `deferred`), extend `badgeVariants` using existing semantic tokens — do not introduce new color literals.

- Props: `variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'info' | 'success' | 'warning'`, `className?`, `children`.
- Tokens: `bg-primary/text-primary-foreground` (default), `bg-secondary/text-secondary-foreground`, `bg-destructive/text-destructive-foreground`, `border-border text-foreground` (outline), `bg-surface-info text-info`, `bg-surface-success text-success`, `bg-surface-warning text-warning`.
- A11y: no role required (text is the affordance). If used as a link, wrap in `<Link>` — Badge itself stays non-interactive.
- Tests: not required for Plan 01 (Phase 24 precedent: trivial variants ship without tests).

### Modal (organism)

Highest-complexity primitive. Thin wrapper over existing artax-ui `Dialog` (already exported lines 61–72) that codifies the Pencil Modal frame's visual composition (padding, header/body/footer slots, sizing). If the Pencil frame is functionally identical to `Dialog`, **rename locally as `Modal` composition rather than re-build** — decide at plan-time via `batch_get` on the Modal frame.

- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `size?: 'sm' | 'md' | 'lg'` (maps to `max-w-sm/max-w-md/max-w-lg`), plus compound slots `<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>`.
- A11y: inherits Radix Dialog's focus trap, Esc-to-close, `aria-labelledby` via required `<Modal.Title>`, scrim click-through. Honor `prefers-reduced-motion`.
- SSR: use the mounted-flag pattern (`useState(false) + useEffect(() => setMounted(true), [])`) per Phase 24.1 D-09 — do NOT render Radix tree on server; emit inert placeholder if trigger is above-the-fold.
- Tests: **required** — focus trap, Esc-to-close, outside-click, `aria-labelledby` wiring, SSR string does not emit `radix-` IDs. Per Phase 24.1 pattern using `renderToString`.

### AuthorNote (molecule, pending D-05 gate)

- Props: `author?: { name: string; avatar?: string; href?: string }`, `date?: string`, `children`.
- Composition: left rule (`border-l-2 border-primary`) + inset padding (`pl-4`) + optional avatar/byline header + body content.
- Tokens: `bg-card text-card-foreground border-l-primary text-muted-foreground` (meta). Body inherits `text-foreground`.
- A11y: `<aside role="note">` with `aria-label="Author's note"`.
- **D-05 gate:** If the Pencil `AuthorNote` frame hardcodes "Blake's note:" or first-person copy, stop and discuss placement. Primitive API must be author-generic.
- Tests: not required — presentational molecule.

### DecisionRationale (molecule, pending D-05 gate)

- Props: `decision: string` (headline), `rationale: ReactNode` (body), `alternatives?: Array<{ name: string; reason: string }>`, `collapsed?: boolean`.
- Composition: `bg-card p-6 border-l-4 border-primary` with `// decision` caption, headline at `text-base font-medium`, body at body scale, optional alternatives list.
- A11y: `<details>`/`<summary>` when `collapsed` is set; else plain `<section>` with heading.
- **D-05 gate:** If the Pencil `DecisionRationale` frame embeds bp.io-specific decision-framework vocabulary (e.g., "Blake's call", references to specific projects), pause. Primitive must be content-model-agnostic.
- Tests: not required unless collapsed behavior needs coverage.

### PrevNextNav (molecule)

- Props: `prev?: { href: string; label: string }`, `next?: { href: string; label: string }`, `className?`.
- Composition: `flex justify-between border-t border-border pt-6 mt-12`. Prev left-anchored with `←`, Next right-anchored with `→`. Either side omitted collapses to empty spacer (keep justify split intact via `ml-auto` on next when prev absent).
- Tokens: `text-muted-foreground` for arrow + context, `text-primary hover:underline` for label on hover.
- A11y: `<nav aria-label="Article navigation">` wrapper, each link carries a human label via text content.
- Tests: not required — pure composition.

---

## Per-Page Composition Contract

Each page preserves its current route, data fetching hooks, and content-model wiring (D-01). Only layout scaffolding and component composition change. Per-page responsive breakpoints default to `md` (768px) and `lg` (1024px) unless a Pencil frame dictates otherwise.

### Homepage (`apps/blakepetersen.io/src/app/page.tsx`) — SITE-03

- **Data:** preserve `getCollection('posts')`, `getAllCollections()`, `stackTools` array.
- **Layout:** `max-w-[1600px] px-4 py-8` container carries forward.
- **Sections (preserve order, refine composition per Pencil):**
  1. `// dx_workbench` — hero block with bracketed terminal CTAs
  2. `// stack` — stack-tool chips (may become Badge primitive in light-outline variant)
  3. `// collections` — CategoryCard grid, 2 columns at `md+`, responsive wrap if `getAllCollections()` returns > 6 (per D-02 content wins)
  4. `// recent_posts` — vertical list, H3 heading (`text-base font-medium`), muted meta, `hover:border-primary` row hover
  5. `// contribute` — terminal `$ verb-noun` CTAs
- **Primitives introduced:** Badge (for stack chips), optionally Modal (if Pencil frame wires a subscribe or contact modal off `// contribute`).
- **Keep:** `CategoryCard` — do not recreate.
- **Empty state:** if `recentPosts.length === 0`, omit the section entirely (current behavior line 80).

### Skills Detail (`apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx`) — SITE-04

- **Data:** preserve MDX resolution via collection registry.
- **Layout:** sidebar nav (carry forward `SidebarNav`) + reading column (`max-w-[72ch]`).
- **Sections:**
  1. Breadcrumbs (carry forward `Breadcrumbs`)
  2. Skill metadata header (title, `applies_to`, date) — mono, H1 `text-3xl`, meta in `text-muted-foreground text-xs`
  3. MDX body via `MDXContent` — register `<AuthorNote>` and `<DecisionRationale>` in the MDX components map if the Pencil frame shows them inline (decide in plan 03/04 per D-06).
  4. `PrevNextNav` at the foot — prev/next siblings within the same skills collection, computed during render.
- **Primitives introduced:** PrevNextNav; conditionally AuthorNote / DecisionRationale in MDX.
- **Keep:** `SidebarNav`, `SidebarDrawer` (mobile), `Breadcrumbs`, `MDXContent`.
- **Empty state:** if slug resolution fails, Next.js 404 path — do not hand-roll.

### About (`apps/blakepetersen.io/src/app/about/`) — SITE-05

- **Data:** static content (likely MDX or inline TSX).
- **Layout:** single reading column (`max-w-prose`), centered (`mx-auto px-4 py-12`).
- **Sections (per Pencil, refine at plan-time):**
  1. `// about` header with name / role / location chip row (Badges)
  2. Biographical prose in `font-mono text-lg leading-relaxed`
  3. Skills / interests summary (Badge grid)
  4. Contact CTAs (`$ email-blake`, `$ find-me-on-github`) — terminal convention
- **Primitives introduced:** Badge (chips); optional AuthorNote if Pencil frame wraps a personal-voice section in the note motif.
- **Keep:** layout shell (Header/Footer wrap via root layout).

### Start Here (`apps/blakepetersen.io/src/app/start-here/`) — SITE-06

- **Data:** static MDX walkthrough.
- **Layout:** single reading column with intro + numbered steps.
- **Sections:**
  1. `// start_here` hero — headline, 1-sentence orientation, `$ start-here` CTA
  2. Numbered walkthrough (1 → N steps) — each step uses `bg-card p-6` block with step number in `text-primary font-mono text-lg`
  3. `// next` continuation block → link to homepage or skills index
- **Primitives introduced:** possibly DecisionRationale if any step includes a "why this stack" block.
- **Keep:** layout shell.
- **Empty state:** N/A (content is authored, not fetched).

### Collection Listing (`apps/blakepetersen.io/src/app/[collection]/page.tsx` or similar — **confirm exact route during planning**) — SITE-07

- **Data:** preserve collection getter (`getCollection(slug).getter()`).
- **Layout:** `max-w-[1600px] px-4 py-8`, sidebar + content or full-width grid (per Pencil frame).
- **Sections:**
  1. Breadcrumbs (or `SidebarNav` active state)
  2. Collection header — `// {collection_name}`, count badge, one-line description from registry
  3. Item list/grid — each item as a bordered row or card, `hover:border-primary`, title + description + meta
  4. Pagination or infinite list — default: render all items (current bp.io collections are small); add pagination only if a collection grows large enough to demand it (out of scope for this phase per D-02).
- **Primitives introduced:** Badge (for count, tags).
- **Keep:** `CategoryCard` pattern (may inform the listing-row pattern), `Breadcrumbs`.
- **Empty state:** `// empty_collection` heading + `No entries yet. Check back, or contribute one → [link]` body — when `items.length === 0`.

---

## Responsive Breakpoints

| Breakpoint | Token | Min width | Usage |
|------------|-------|-----------|-------|
| Mobile | (default) | 0 | Single column, stacked sections, body at `text-base` |
| Tablet | `md:` | 768px | 2-column grids, sidebar drawer transitions to inline sidebar where applicable |
| Desktop | `lg:` | 1024px | Max layout width takes effect (`max-w-[1600px]`), 3-column grids where Pencil shows them |

Mobile-first. All custom breakpoints must come from Tailwind defaults — no arbitrary `max-w-[XXpx]:` variants without Pencil-frame evidence.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none (shadcn CLI not used) | not applicable |
| artax-ui (first-party, this monorepo) | Badge, Modal, AuthorNote, DecisionRationale, PrevNextNav | not applicable — in-tree source, reviewed under standard PR flow |
| third-party | none | not applicable |

No external registries are declared. All new primitives are authored in-tree under `packages/artax-ui`. No vetting gate required.

---

## Verification Contract (per D-07)

Each page plan's VERIFICATION section must include:

- [ ] Render in **light mode**: no visible artifacts, accent-only-where-reserved, text contrast adequate.
- [ ] Render in **dark mode**: same check.
- [ ] Theme toggle with page open: no flicker, no hydration mismatch, no visible layout shift.
- [ ] Responsive spot-check at 375px, 768px, 1280px.
- [ ] Focus-visible reachable on every interactive element via keyboard.

Primitive plan (Plan 01) additionally verifies:

- [ ] Primitive exported from `packages/artax-ui/src/index.ts`.
- [ ] Modal SSR test: `renderToString` emits no `aria-controls="radix-"` strings when used behind a mounted-flag gate.
- [ ] Editorial-voice gate (D-05): AuthorNote and DecisionRationale prop surfaces are generic; any first-person copy lives in consumer call sites, not primitive source.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
