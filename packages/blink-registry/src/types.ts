// ABOUTME: Convenience re-export of all inferred TypeScript types from Zod schemas.
// ABOUTME: Allows consumers to import just types without pulling in schema runtime code.
export type {
  ArtifactType,
  Slug,
  CalVer,
  MergeStrategy,
  Scope,
} from './schemas/primitives'

export type {
  ArtifactFile,
  ArtifactMetadata,
} from './schemas/artifact'

export type {
  ManifestFileEntry,
  ManifestEntry,
  Manifest,
} from './schemas/manifest'

export type {
  RegistryItem,
  RegistryIndex,
  RegistryArtifact,
} from './schemas/registry'

export type {
  BlinkErrorCodeType,
  BlinkError,
} from './schemas/errors'
