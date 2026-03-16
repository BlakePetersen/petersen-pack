<!-- ABOUTME: npm README for the @blink-dx/registry package. -->
<!-- ABOUTME: Documents the Zod schemas and types exported by the registry. -->

# @blink-dx/registry

Zod schemas and TypeScript types for the Blink DX registry. Used by `@blink-dx/cli` and consumers that need to validate or type-check registry data.

## Install

```sh
npm install @blink-dx/registry
```

## Usage

```ts
import { RegistryIndexSchema, RegistryArtifactSchema } from '@blink-dx/registry'

// Validate registry index
const index = RegistryIndexSchema.parse(data)

// Validate a single artifact
const artifact = RegistryArtifactSchema.parse(detail)
```

## Exported Schemas

- **Primitives** --- `ArtifactTypeSchema`, `SlugSchema`, `CalVerSchema`, `MergeStrategySchema`, `ScopeSchema`
- **Artifact** --- `ArtifactFileSchema`, `ArtifactMetadataSchema`
- **Manifest** --- `ManifestFileEntrySchema`, `ManifestEntrySchema`, `ManifestSchema`
- **Registry** --- `RegistryItemSchema`, `RegistryIndexSchema`, `RegistryArtifactSchema`
- **Errors** --- `BlinkErrorSchema`, `BlinkErrorCode`

All schemas export corresponding inferred TypeScript types (e.g., `RegistryIndex`, `ManifestEntry`).

## License

MIT
