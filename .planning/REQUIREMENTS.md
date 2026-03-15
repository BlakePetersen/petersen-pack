# Requirements: Blink CLI & DX Registry

**Defined:** 2026-03-14
**Core Value:** Developers can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source — both on the web and programmatically via CLI.

## v1.2 Requirements

Requirements for the Blink CLI, registry API, artifact system, and starter content.

### CLI Core (CORE)

- [ ] **CORE-01**: User can run `blink apply <slug>` to fetch and apply a config/skill/hook from the registry
- [ ] **CORE-02**: User can run `blink list` to browse all available items in the registry
- [ ] **CORE-03**: User can run `blink status` to see installed items, versions, and update availability
- [ ] **CORE-04**: User can run `blink update [slug]` to update managed items with diff preview
- [ ] **CORE-05**: User can run `blink eject <slug>` to stop managing an item and transfer full ownership
- [ ] **CORE-06**: User can run `blink diff <slug>` to preview upstream changes without applying
- [ ] **CORE-07**: User can run `blink init` to initialize blink tracking in a project
- [ ] **CORE-08**: User can run `blink doctor` to check for broken markers, orphaned manifests, and issues
- [ ] **CORE-09**: User can pass `--dry-run` to any state-changing command to preview operations
- [ ] **CORE-10**: User can pass `--yes` or run in non-TTY to skip interactive prompts
- [ ] **CORE-11**: CLI detects package manager (pnpm/npm/yarn) from lockfile and uses correct install command
- [ ] **CORE-12**: CLI resolves artifact dependencies and prompts to apply missing deps in topological order

### Scope & Lifecycle (SCOPE)

- [ ] **SCOPE-01**: User can apply items with `--global` flag targeting `~/.claude/` and global configs
- [ ] **SCOPE-02**: User can apply items with `--project` flag (default) targeting project root and `.claude/`
- [ ] **SCOPE-03**: Applied items are tracked in `.blink/manifest.json` with state, version, and checksums
- [ ] **SCOPE-04**: Managed items use section markers (`<!-- blink:managed -->`) to delimit managed regions
- [ ] **SCOPE-05**: User content outside managed markers is preserved during `blink update`
- [ ] **SCOPE-06**: `blink eject` strips markers and removes item from manifest without deleting files
- [ ] **SCOPE-07**: CLI detects local modifications to managed sections and prompts before overwriting
- [ ] **SCOPE-08**: Atomic file writes (temp file + rename) prevent corruption on interrupted operations

### Registry & Distribution (REG)

- [ ] **REG-01**: Static JSON registry files generated at Velite build time from artifact metadata
- [ ] **REG-02**: Registry index at `/r/index.json` lists all available items with metadata
- [ ] **REG-03**: Individual artifact data served at `/r/<type>/<slug>.json` with file contents
- [ ] **REG-04**: Registry includes CalVer version (from git commit date) per artifact
- [ ] **REG-05**: CLI fetches from registry API with actionable error messages on failure

### Artifact System (ART)

- [ ] **ART-01**: Each distributable content item has a companion `.artifact.md` or `.artifact/` directory
- [ ] **ART-02**: Multi-file artifacts include a `manifest.json` specifying files, destinations, and merge strategy
- [ ] **ART-03**: Artifact metadata integrated into Velite pipeline via prepare step
- [ ] **ART-04**: Single-file artifacts (skills) infer destination from content type
- [x] **ART-05**: Artifacts can declare npm devDependencies that the CLI prompts to install

### Starter Content (CONT)

- [ ] **CONT-01**: ESLint flat config artifact with section markers and TypeScript strict rules
- [ ] **CONT-02**: Prettier config artifact with opinionated formatting rules
- [ ] **CONT-03**: TypeScript strict config artifact with rationale for each compiler option
- [ ] **CONT-04**: Husky + lint-staged hook artifact with pre-commit setup
- [ ] **CONT-05**: Global CLAUDE.md template artifact with best practices for `~/.claude/CLAUDE.md`
- [ ] **CONT-06**: Project CLAUDE.md template artifact with best practices for project-level CLAUDE.md
- [ ] **CONT-07**: Writing custom skills artifact (companion to existing MDX)

### Documentation Content (DOCS)

- [ ] **DOCS-01**: Guide: CLAUDE.md hierarchy — global vs project, what goes where, precedence rules
- [ ] **DOCS-02**: Guide: Blink system overview — architecture, files in play, benefits and risks
- [ ] **DOCS-03**: Each starter content artifact has companion MDX with complementary tools, competitors, and best practices
- [ ] **DOCS-04**: Content cross-references via `dependencies` and `related` frontmatter fields

### Package Infrastructure (PKG)

- [x] **PKG-01**: `packages/blink-registry` workspace package with shared Zod schemas and TypeScript types
- [x] **PKG-02**: `packages/blink-cli` workspace package with tsup build producing single-file ESM binary
- [ ] **PKG-03**: CLI published as `@blink/cli` to npm with `blink` binary name
- [x] **PKG-04**: Turbo pipeline updated with build/test/typecheck tasks for new packages
- [ ] **PKG-05**: ApplyActionBar component updated to show `blink apply <slug>` instead of `claude skill apply`

## Future Requirements (v2+)

### Enhanced CLI

- **CORE-13**: Offline fallback using bundled registry snapshot in npm package
- **CORE-14**: `blink sync` batch command to check and update all tracked items
- **CORE-15**: Periodic update notice (7-day check) on any `blink` command

### Extended Content

- **CONT-08**: Additional config artifacts (Jest, Vitest, commitlint, etc.)
- **CONT-09**: Framework-specific starter kits (Next.js, Vite, etc.)

### Publishing

- **PKG-06**: Changesets-based version management and automated npm publishing via CI
- **PKG-07**: `npm pack` smoke test in CI before publishing

## Out of Scope

| Feature | Reason |
|---------|--------|
| Template variable interpolation | Complexity trap — chezmoi's most-hated feature. Configs should work as-is. |
| Plugin system | mrm and hygen prove this leads to dead ecosystems. One maintainer, one registry. |
| Three-way merge | chezmoi's worst UX. Section markers are simpler and more predictable. |
| Auto-update (background) | Disrespects user agency. Explicit `blink update` only. |
| GUI / web dashboard | CLI-first. The site IS the dashboard. |
| Git integration (auto-commit) | Users manage their own git workflow. |
| Undo / rollback | Complexity not justified. Users have git for rollback. |
| Private registries | No auth system. All content is public. |
| Dynamic API routes | Breaks static export. Static JSON is sufficient. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PKG-01 | Phase 12 | Complete |
| PKG-02 | Phase 12 | Complete |
| PKG-04 | Phase 12 | Complete |
| ART-01 | Phase 13 | Pending |
| ART-02 | Phase 13 | Pending |
| ART-03 | Phase 13 | Pending |
| ART-04 | Phase 13 | Pending |
| ART-05 | Phase 13 | Complete |
| REG-01 | Phase 13 | Pending |
| REG-02 | Phase 14 | Pending |
| REG-03 | Phase 14 | Pending |
| REG-04 | Phase 14 | Pending |
| REG-05 | Phase 14 | Pending |
| PKG-05 | Phase 14 | Pending |
| CORE-01 | Phase 15 | Pending |
| CORE-02 | Phase 15 | Pending |
| CORE-03 | Phase 15 | Pending |
| CORE-07 | Phase 15 | Pending |
| CORE-09 | Phase 15 | Pending |
| CORE-10 | Phase 15 | Pending |
| CORE-11 | Phase 15 | Pending |
| SCOPE-02 | Phase 15 | Pending |
| SCOPE-03 | Phase 15 | Pending |
| CORE-04 | Phase 16 | Pending |
| CORE-05 | Phase 16 | Pending |
| CORE-06 | Phase 16 | Pending |
| CORE-08 | Phase 16 | Pending |
| CORE-12 | Phase 16 | Pending |
| SCOPE-01 | Phase 16 | Pending |
| SCOPE-04 | Phase 16 | Pending |
| SCOPE-05 | Phase 16 | Pending |
| SCOPE-06 | Phase 16 | Pending |
| SCOPE-07 | Phase 16 | Pending |
| SCOPE-08 | Phase 16 | Pending |
| CONT-01 | Phase 17 | Pending |
| CONT-02 | Phase 17 | Pending |
| CONT-03 | Phase 17 | Pending |
| CONT-04 | Phase 17 | Pending |
| CONT-05 | Phase 17 | Pending |
| CONT-06 | Phase 17 | Pending |
| CONT-07 | Phase 17 | Pending |
| DOCS-01 | Phase 18 | Pending |
| DOCS-02 | Phase 18 | Pending |
| DOCS-03 | Phase 18 | Pending |
| DOCS-04 | Phase 18 | Pending |
| PKG-03 | Phase 19 | Pending |

**Coverage:**
- v1.2 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation*
