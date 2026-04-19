# Phase 26: blakepetersen.io Page Updates - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 26-blakepetersen-io-page-updates
**Areas discussed:** Rewrite strategy, Plan granularity, Primitive placement, Pencil fidelity

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite strategy | Scorched-earth vs surgical vs mixed | ✓ |
| Plan granularity | Plan slicing (per-page vs primitives-first vs grouped) | ✓ |
| New component placement | artax-ui vs bp.io-local for missing Pencil primitives | ✓ |
| Pencil fidelity + content reconciliation | Strict spec vs reference; who wins on data conflicts | ✓ |

**User's choice:** All four areas discussed.

---

## Rewrite Strategy

### Q1: How should we approach the page transformations — uniform policy or per-page judgment?

| Option | Description | Selected |
|--------|-------------|----------|
| Surgical per page (Recommended) | Keep routes, data fetching, content-model wiring for all 5 pages. Replace layout/composition to match Pencil. | ✓ |
| Scorched-earth rewrite | Rebuild each page.tsx from the Pencil frame; re-derive data needs. | |
| Mixed — scorched-earth for static, surgical for dynamic | Two policies in one phase. | |

**User's choice:** Surgical per page.
**Notes:** Uniform policy — dynamic pages (Home, Skills Detail) aren't penalized, static pages aren't over-engineered.

### Q2: When Pencil layout doesn't line up with current data — who wins?

| Option | Description | Selected |
|--------|-------------|----------|
| Content wins — adapt design (Recommended) | Pencil is visual reference; data contracts stay intact. Adjust design to fit data. | ✓ |
| Design wins — reshape content | Pencil is canonical; update content model to match. | |
| Flag each conflict to Blake during execution | No pre-baked policy; surface every conflict. | |

**User's choice:** Content wins — adapt design.
**Notes:** Escalate to Blake only when gap is structural.

---

## Plan Granularity

### Q1: How should plans be sliced?

| Option | Description | Selected |
|--------|-------------|----------|
| Primitives-first, then pages (Recommended) | Plan 01 extracts missing primitives; Plans 02–06 per page. | ✓ |
| One plan per page, build primitives inline | 5 plans; primitives born where first needed. | |
| Group by page-shape | Static pages together, Homepage + Skills Detail separate; ~3–4 chunky plans. | |

**User's choice:** Primitives-first, then pages.
**Notes:** Avoids "first page owns primitive API" refactor churn.

### Q2: Where do missing Pencil primitives live?

| Option | Description | Selected |
|--------|-------------|----------|
| Decide per component — artax-ui if reusable, bp.io-local if specific (Recommended) | Judgment call per primitive. | |
| All new primitives go to artax-ui | Default everything to the shared package. | ✓ |
| All new primitives stay bp.io-local | Build bp.io-local; retrofit later. | |

**User's choice:** All new primitives go to artax-ui.
**Notes:** Stronger architectural stance than recommended — honors Phase 21 without exception. Editorial-voice escape hatch (D-05) added to allow a Blake check before committing editorial primitives.

---

## Pencil Fidelity + Content Reconciliation

### Q1: How strictly do we lock to Pencil?

| Option | Description | Selected |
|--------|-------------|----------|
| Pencil-as-spec: batch_get every frame upfront (Recommended) | Extract nodes/layout/spacing/colors per frame into plan. | |
| Pencil-as-reference: screenshot + judgment | get_screenshot per frame; Claude reads visually. | ✓ |
| Hybrid: screenshot for overview, batch_get for primitives | Middle ground. | |

**User's choice:** Pencil-as-reference.
**Notes:** batch_get kept as tool-level escape for ambiguous primitive API extraction — no upfront ritual.

### Q2: Light-mode verification cadence?

| Option | Description | Selected |
|--------|-------------|----------|
| After each page plan completes (Recommended) | Plan-level smoke check in light + dark before plan done. | ✓ |
| Once at phase end | One sweep at the end. | |
| Only when I explicitly ask | No automatic gate. | |

**User's choice:** After each page plan completes.

---

## Wrap

**Question:** Anything else before CONTEXT.md?

| Option | Description | Selected |
|--------|-------------|----------|
| Ready for context | Remaining calls stay as Claude's Discretion. | ✓ |
| One more area — testing strategy | Explicitly lock test scope. | |
| One more area — Skills Detail scope | MDX-block-level scope clarification. | |

**User's choice:** Ready for context.

---

## Claude's Discretion

- Exact plan count (5 vs 6 vs 7) — Claude decides during planning.
- Component testing strategy per primitive — Phase 24 pattern applies where behavior warrants (Modal at minimum).
- Per-page responsive breakpoints — existing bp.io responsive conventions apply unless Pencil dictates otherwise.
- Whether Skills Detail MDX renders inline `<DecisionRationale>` / `<AuthorNote>` — decide in plan based on existing MDX usage or Pencil demand.
- Tool-level `batch_get` usage for ambiguous primitive extraction.

## Deferred Ideas

- Visual regression test suite (carried from Phase 25)
- Theme transition animation (carried from Phase 25)
- SITE-08 verification for artax app (different consumer, not this phase)
- Retrofit `useSyncExternalStore` across artax-ui (carried from Phase 25)
- Retroactive tests for existing bp.io components
- Dark-mode syntax highlighting token retune
