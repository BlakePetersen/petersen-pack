// ABOUTME: Barrel re-export of all Zod schemas and inferred TypeScript types.
// ABOUTME: Single entry point for consuming packages to import from blink-registry.
export {
  ArtifactTypeSchema,
  ARTIFACT_TYPES,
  SlugSchema,
  CalVerSchema,
  MergeStrategySchema,
  MERGE_STRATEGIES,
  ScopeSchema,
  Sha256HexSchema,
  type ArtifactType,
  type Slug,
  type CalVer,
  type MergeStrategy,
  type Scope,
  type Sha256Hex,
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

export {
  DX_COLLECTIONS,
  DxFrontmatterSchema,
  getDxJsonSchema,
  type DxFrontmatter,
} from './schemas/dx-frontmatter.ts'
