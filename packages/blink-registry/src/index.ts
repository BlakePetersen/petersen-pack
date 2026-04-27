// ABOUTME: Barrel re-export of all Zod schemas and inferred TypeScript types.
// ABOUTME: Single entry point for consuming packages to import from blink-registry.
export {
  ArtifactTypeSchema,
  SlugSchema,
  CalVerSchema,
  MergeStrategySchema,
  ScopeSchema,
  type ArtifactType,
  type Slug,
  type CalVer,
  type MergeStrategy,
  type Scope,
} from './schemas/primitives.ts'

export {
  ArtifactFileSchema,
  ArtifactMetadataSchema,
  type ArtifactFile,
  type ArtifactMetadata,
} from './schemas/artifact.ts'

export {
  ManifestFileEntrySchema,
  ManifestEntrySchema,
  ManifestSchema,
  type ManifestFileEntry,
  type ManifestEntry,
  type Manifest,
} from './schemas/manifest.ts'

export {
  RegistryItemSchema,
  RegistryIndexSchema,
  RegistryArtifactSchema,
  type RegistryItem,
  type RegistryIndex,
  type RegistryArtifact,
} from './schemas/registry.ts'

export {
  BlinkErrorCode,
  BlinkErrorSchema,
  type BlinkErrorCodeType,
  type BlinkError,
} from './schemas/errors.ts'
