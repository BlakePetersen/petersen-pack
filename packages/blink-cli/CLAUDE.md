# @blink/cli

`blink` — CLI to apply opinionated DX configs, skills, and hooks from a registry into a target repo. Built on `citty`, ships as a single-file ESM binary.

## Commands (from `packages/blink-cli/`)

- `pnpm build` — `tsup` → `dist/cli.mjs` (ESM, shebang, `noExternal: /.*/` so deps are bundled)
- `pnpm test` — Jest
- `pnpm typecheck` — `tsc --noEmit`

The published binary is invoked as `blink <subcommand>`.

## Subcommands

Defined as lazy imports in `src/cli.ts`:

- `init` — bootstrap a manifest in the target repo
- `apply` — fetch + write artifacts from the registry, recording them in the manifest
- `update` — re-fetch and re-apply tracked artifacts
- `diff` — show pending changes vs. the registry
- `status` — list installed artifacts and their state
- `list` — list available artifacts from the registry
- `eject` — stop tracking an artifact (leaves files on disk)
- `doctor` — health check on manifest + workspace
- `lint` — content lint for MDX entries (frontmatter schema, artifact-pair, voice primitives; `src/lint/`)
- `port` — port existing repo files into content entries
- `scaffold` — generate a new content entry from templates (`src/scaffold/`)

Each subcommand is its own file under `src/commands/`. Manifest readers
(`update`/`status`/`diff`/`eject`/`doctor`) take `--global` to operate on the
home-directory manifest that `apply --global` writes to.

## Architecture (the deep module here is the pipeline)

`src/pipeline.ts` is the spine: `resolve → prepare → execute → record`. Subcommands compose it with their own flags. Supporting modules:

- `registry.ts` — `fetchIndex` / `fetchArtifact` (the registry adapter)
- `manifest.ts` — read/write/checksum the local `.blink/manifest.json` (tracked artifacts live under a `.blink/` directory in the target repo)
- `writer.ts` — `atomicWrite` (write-temp + rename)
- `markers.ts` — managed-section markers; `injectMarkers` and `findManagedSections` for partial-file merges
- `scope.ts` — `resolveDestination` / `resolveManifestRoot` (project vs. global scope)
- `deps.ts` — `findMissingDeps` against the target's `package.json`
- `gitignore.ts` — `addToGitignore` for tracked outputs
- `pm.ts` — package-manager detection (npm/pnpm/yarn/bun)
- `output.ts` — consola-based UX helpers
- `modules/prompt.ts` — interactive prompts

Types come from `blink-registry` (`Manifest`, `ManifestEntry`, `MergeStrategy`, `RegistryArtifact`) — this is the **only runtime consumer** of the registry's Zod schemas in the monorepo.

## Gotchas

- **Single-file bundled binary** — `tsup` inlines all deps (`noExternal: /.*/`). Don't add deps assuming they'll be resolved at runtime in the target repo; everything ships in `dist/cli.mjs`.
- **Path alias `@/*`** — used throughout (e.g. `import { ... } from '@/registry'`); set up in `tsconfig.json`. Build (tsup) and Jest (`ts-jest`) both honor it.
- **Atomic writes only** — never write directly via `fs.writeFile` from a command; go through `writer.ts` so failures don't leave partial files in user repos.
- **Marker conflicts** are surfaced in `FilePlan.markerConflict` and must block apply — don't silently overwrite managed sections.
- **`engines.node >= 20`** — uses Node 20+ APIs.
