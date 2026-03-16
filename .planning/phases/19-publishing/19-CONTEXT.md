# Phase 19: Publishing - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Publish blink-cli and blink-registry to npm so users can install and use the CLI from a clean `npm install -g`. Verify end-to-end functionality from the published package against the live registry. No new features — packaging and publishing only.

</domain>

<decisions>
## Implementation Decisions

### npm scope & naming
- Publish CLI as `@blink-dx/cli` (org scope: `blink-dx`, already registered)
- Binary name remains `blink` (via package.json `bin` field)
- Publish registry as `@blink-dx/registry` (separate package for third-party schema consumers)
- Fallback not needed — `blink-dx` scope is confirmed available

### Version strategy
- Both packages start at `0.1.0` for first publish
- Signals "early but usable" per semver convention
- Automated versioning (changesets) deferred to v2+ per REQUIREMENTS.md PKG-06

### Package presentation
- License: MIT
- Description: "Apply opinionated DX configs from the command line"
- Dedicated npm README in `packages/blink-cli/` (not repo root README) — focused on install, quick start, command reference
- blink-registry gets its own minimal README describing the schema package

### blink-registry disposition
- Published as `@blink-dx/registry` for third-party tooling consumers
- CLI continues to bundle registry via tsup (noExternal) — zero runtime deps, single-file binary
- Registry is independently useful for anyone building tools against artifact schemas
- Both packages remove `"private": true` for publishing

### Claude's Discretion
- npm keywords selection
- README content structure and wording
- Homepage/repository field URLs in package.json
- publishConfig settings (registry, access)
- Whether to add a LICENSE file to each package or rely on root

</decisions>

<specifics>
## Specific Ideas

- User confirmed `blink-dx` org scope is registered on npmjs.com
- User also owns `petersen` scope but preferred product-centric naming
- Both packages version-synced at 0.1.0 for consistency

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/blink-cli/tsup.config.ts`: Already configured for ESM single-file binary with `#!/usr/bin/env node` shebang
- `packages/blink-cli/package.json`: Has correct `bin` field (`"blink": "./dist/cli.mjs"`)
- `packages/blink-registry/`: Source-only exports (no build step), used as workspace dep

### Established Patterns
- tsup `noExternal` bundles all deps including blink-registry into CLI binary
- `splitting: false` maintains single-file output
- Workspace packages use `workspace:*` protocol for internal deps

### Integration Points
- `package.json` name field: `blink-cli` → `@blink-dx/cli`
- `package.json` name field: `blink-registry` → `@blink-dx/registry`
- Remove `"private": true` from both packages
- Turbo pipeline may need a publish task (or manual npm publish)
- Any internal imports referencing old package names need updating

</code_context>

<deferred>
## Deferred Ideas

- Changesets-based automated versioning and publishing via CI (REQUIREMENTS.md PKG-06, v2+)
- `npm pack` smoke test in CI (REQUIREMENTS.md PKG-07, v2+)

</deferred>

---

*Phase: 19-publishing*
*Context gathered: 2026-03-15*
