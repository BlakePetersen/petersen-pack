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
} from './schemas/primitives'

export {
  ArtifactFileSchema,
  ArtifactMetadataSchema,
  type ArtifactFile,
  type ArtifactMetadata,
} from './schemas/artifact'

export {
  ManifestFileEntrySchema,
  ManifestEntrySchema,
  ManifestSchema,
  type ManifestFileEntry,
  type ManifestEntry,
  type Manifest,
} from './schemas/manifest'

export {
  RegistryItemSchema,
  RegistryIndexSchema,
  RegistryArtifactSchema,
  type RegistryItem,
  type RegistryIndex,
  type RegistryArtifact,
} from './schemas/registry'

export {
  BlinkErrorCode,
  BlinkErrorSchema,
  type BlinkErrorCodeType,
  type BlinkError,
} from './schemas/errors'
