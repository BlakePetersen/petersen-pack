# Requirements: Petersen Group

**Defined:** 2026-04-25
**Core Value:** Developers can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source — both on the web and programmatically via CLI.

## v1.4 Requirements

Requirements for milestone v1.4 Content Density. Each maps to roadmap phases.

### Schema Foundations

Lock the data shape before any content authoring; field changes after sixteen entries land require codemods.

- [x] **SCHEMA-01
**: `voice` field added to Velite `dxFields` as `array(enum(['author-note', 'decision-rationale']))` with empty-array default; existing entries pass validation unchanged
- [x] **SCHEMA-02
**: `requires_artifact` field added to Velite `dxFields` as `boolean` with `false` default; existing entries pass validation unchanged
- [x] **SCHEMA-03
**: Velite collection `path` schema swapped to `slug('<collection>')` for skills, configs, hooks, guides — duplicate slugs across a collection fail the build
- [x] **SCHEMA-04
**: Velite `prepare` hook asserts every `requires:` cross-reference resolves to a real entry slug; broken references fail the build
- [x] **SCHEMA-05
**: v1.2 ESM workaround resolved — Velite imports artifact validation from `@blink-dx/registry` directly; inline duplication removed
- [x] **SCHEMA-06
**: `scripts/migrate-content.ts` codemod harness committed (skeleton only — not yet executed); future schema migrations have a documented entry point
- [x] **SCHEMA-07
**: Build-perf baseline captured (cold `pnpm build` + warm `next dev` startup) and stored in `.planning/intel/` for v1.4 regression comparison
- [x] **SCHEMA-08
**: `deriveCalVer` audited — if pure-date logic, content-hash gate added so prose-only edits don't bump artifact CalVer

### Scaffold CLI

Generators that produce schema-valid skeletons; templates derive from the canonical schema.

- [x] **SCAFFOLD-01**: `blink scaffold skill <slug>` generates an MDX file plus companion `.artifact.md` at the correct content path with valid frontmatter
- [x] **SCAFFOLD-02**: `blink scaffold config <slug>`, `blink scaffold hook <slug>`, and `blink scaffold guide <slug>` produce the equivalent skeleton for each remaining collection
- [x] **SCAFFOLD-03**: Scaffold templates derive from the live Velite Zod schema (no hand-maintained template/schema duplication) — depends on SCHEMA-05

- [x] **SCAFFOLD-04**: Scaffold pre-populates the artifact frontmatter (`name`, `description`, `type`, `version`) from the MDX frontmatter so authors edit one source of truth
- [x] **SCAFFOLD-05
**: Round-trip CI test runs `blink scaffold` for each collection, then runs Velite, and asserts the generated entries pass schema validation
- [x] **SCAFFOLD-06**: Scaffold respects `--dry-run` (prints the would-write paths and contents) and `--force` (overwrites an existing slug)

### Content Lint

Cross-file invariants that ESLint can't enforce, exposed via a `blink` subcommand.

- [x] **LINT-01**: `blink lint` subcommand validates frontmatter via `DxFrontmatterSchema.safeParse` (single source of truth) — *original JSON-Schema/Ajv mechanism superseded by Phase 31 (31-06), Blake sign-off 2026-07-12*
- [x] **LINT-02**: `blink lint` enforces artifact-pair sync — entries with `requires_artifact: true` must have a sibling `.artifact.md` (error); orphan `.artifact.md` files surface as warnings
- [x] **LINT-03**: `blink lint` enforces voice-primitive invariants — entries that declare a `voice` value must invoke the matching JSX component in the body; entries with rationale-shaped headings flag as advisory if `voice: ['decision-rationale']` is missing
- [x] **LINT-04
**: `pnpm lint:content` script runs `blink lint` across all collections; exits non-zero on any error
- [x] **LINT-05
**: `lint-staged` runs `blink lint` against staged MDX/artifact files only, completing under 2s for typical 1–3 file changesets
- [x] **LINT-06
**: Turbo `lint:content` task added; CI runs the full-tree lint
- [x] **LINT-07**: All voice-primitive rules ship as **advisory (warn)** in v1.4 — promotion to **error** is gated on the Phase 4 review (DEBT-04)

### Obsidian Port

Two-step pipeline that converts vault prose into reviewable, schema-valid MDX without polluting `content/` with half-clean drafts.

- [x] **PORT-01**: `blink port stage <input-dir>` runs `obsidian-export` (Rust, out-of-band) and applies project transformations (wikilink rewrite, callout → `<AuthorNote>`, frontmatter normalization, dataview block strip), writing output to `.obsidian-port-staging/`
- [x] **PORT-02
**: `.obsidian-port-staging/` is gitignored; staged output is reviewable as a normal diff against an empty baseline
- [x] **PORT-03**: `blink port commit <slug>` moves a single staged entry from `.obsidian-port-staging/` to its final `content/<collection>/` path, atomically including any companion `.artifact.md`
- [x] **PORT-04
**: Port pipeline round-trips one Blake-selected skill end-to-end before bulk content authoring begins (smoke test, not blocking)

### Content Density

Real entries shipped at the agreed floor.

- [x] **CONTENT-01
**: Five skill entries authored to production quality (frontmatter complete, body uses voice primitives where they fit, companion `.artifact.md` shipped)
- [x] **CONTENT-02
**: Five config entries authored to production quality (MDX + companion `.artifact.md`)
- [x] **CONTENT-03
**: Three hook entries authored to production quality (MDX + companion `.artifact.md`)
- [x] **CONTENT-04
**: Three guide entries authored to production quality (MDX only — guides do not have artifact companions)
- [x] **CONTENT-05
**: `<ArtifactBody slug>` MDX server component shipped — eliminates copy-paste of artifact body content into MDX docs
- [x] **CONTENT-06
**: First voice-primitive invocation across the catalog passes a "torture-test" pass — light/dark/mobile visual capture; any layout regression in `AuthorNote` or `DecisionRationale` is fixed in `artax-ui` before bulk authoring continues

### Editorial Debt Closure

Real prose where the v1.3 audit shipped placeholders, plus a human voice-review gate.

- [ ] **DEBT-01**: `/about` page rewritten with first-person specifics replacing the v1.3 placeholder; passes Blake's 24-hour re-read review before merge
- [ ] **DEBT-02**: `/start-here` page rewritten with canonical voice-primitive invocations (`AuthorNote` and `DecisionRationale` each used at least once); serves as the on-site reference for how to write entries
- [ ] **DEBT-03**: `AuthorNote` and `DecisionRationale` invocations added to pre-existing relevant MDX entries identified during the audit (any entry with rationale-shaped or aside-shaped content)
- [ ] **DEBT-04**: Skills Detail header typography polish landed (deferred from v1.3 Phase 26-03) — H1 size, max-width, and prose tightening
- [ ] **DEBT-05**: Voice-lint promotion review — for each voice rule, decide error/warn/off based on Phase 3 evidence (8-entry heuristic). Decisions logged in PROJECT.md Key Decisions
- [ ] **DEBT-06**: v1.4 milestone audit completed and archived per the v1.0–v1.3 pattern (`milestones/v1.4-MILESTONE-AUDIT.md`, `v1.4-REQUIREMENTS.md`, `v1.4-ROADMAP.md`)

## Future Requirements

Capabilities surfaced during research but deferred past v1.4.

- **PORT-F01**: Bidirectional Obsidian sync (last-write-wins) — explicit Deferred per PROJECT.md
- **CONTENT-F01**: `posts` collection authored — currently zero entries; v1.4 leaves the schema intact and the listing route empty
- **SCAFFOLD-F01**: Auto-derived `<DecisionRationale>` rendering from frontmatter `decisions: { choice, rationale }[]` — schema field exists today, no UI consumes it yet
- **LINT-F01**: Voice-primitive rules promoted from advisory to error for collections that pass the 8-entry threshold (any leftover advisory rules at the close of v1.4)
- **DEBT-F01**: `<AuthorNote>` and `<DecisionRationale>` visual variant audit (full Pencil sweep) — only triggered if DEBT-03 surfaces gaps that exceed Phase 3 torture-test scope

## Out of Scope

| Feature | Reason |
|---------|--------|
| Bidirectional Obsidian sync | Stays in Deferred — v1.4 ships one-shot port only; sync is a separate, much larger effort |
| AI chatbot / "ask the docs" | Already in PROJECT.md Out of Scope; reaffirmed by FEATURES research |
| Web CMS for content authoring | Friction-free CLI scaffold + lint is the chosen authoring surface; CMS is over-engineering for a single-author site |
| Template variable interpolation in scaffolds | Per PROJECT.md Out of Scope — configs should work as-is, no Mustache/Handlebars |
| Plugin system for `blink` | Per PROJECT.md Out of Scope — leads to dead ecosystems |
| Auto-generated TOC enforcement | Authors choose their own structure; lint ≠ style guide |
| Visual regression on every MDX entry | DEBT-04 + first-invocation torture test (CONTENT-06) is sufficient; full VRT is a v2+ investment |
| MDX content lint via `eslint-plugin-mdx` | Replaced by `blink lint` per Divergence #1 — cross-file invariants don't fit ESLint's per-file model |
| `plop` / `hygen` scaffolders | Replaced by `blink scaffold` — avoids second binary, reuses existing citty/consola |
| `obsidian-html` for port | Wrong tool — site generator, not a converter; FEATURES research rejects |

## Traceability

Which phases cover which requirements. Filled by the roadmapper.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHEMA-01 | Phase 27 | Complete |
| SCHEMA-02 | Phase 27 | Complete |
| SCHEMA-03 | Phase 27 | Complete |
| SCHEMA-04 | Phase 27 | Complete |
| SCHEMA-05 | Phase 27 | Complete |
| SCHEMA-06 | Phase 27 | Complete |
| SCHEMA-07 | Phase 27 | Complete |
| SCHEMA-08 | Phase 27 | Complete |
| SCAFFOLD-01 | Phase 28 | Complete |
| SCAFFOLD-02 | Phase 28 | Complete |
| SCAFFOLD-03 | Phase 28 | Complete |
| SCAFFOLD-04 | Phase 28 | Complete |
| SCAFFOLD-05 | Phase 28 | Complete |
| SCAFFOLD-06 | Phase 28 | Complete |
| LINT-01 | Phase 28 (mechanism superseded in Phase 31) | Complete |
| LINT-02 | Phase 28 | Complete |
| LINT-03 | Phase 28 | Complete |
| LINT-04 | Phase 28 | Complete |
| LINT-05 | Phase 28 | Complete |
| LINT-06 | Phase 28 | Complete |
| LINT-07 | Phase 28 | Complete |
| PORT-01 | Phase 28 | Complete |
| PORT-02 | Phase 28 | Complete |
| PORT-03 | Phase 28 | Complete |
| PORT-04 | Phase 28 | Complete |
| CONTENT-01 | Phase 29 | Complete |
| CONTENT-02 | Phase 29 | Complete |
| CONTENT-03 | Phase 29 | Complete |
| CONTENT-04 | Phase 29 | Complete |
| CONTENT-05 | Phase 28 | Complete |
| CONTENT-06 | Phase 29 | Complete |
| DEBT-01 | Phase 30 | Pending |
| DEBT-02 | Phase 30 | Pending |
| DEBT-03 | Phase 30 | Pending |
| DEBT-04 | Phase 30 | Pending |
| DEBT-05 | Phase 30 | Pending |
| DEBT-06 | Phase 30 | Pending |
