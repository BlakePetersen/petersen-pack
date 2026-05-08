// ABOUTME: Query helpers for artifact data produced by the Velite prepare hook.
// ABOUTME: Reads artifacts.json and provides typed access to artifact metadata.

import fs from 'node:fs'
import path from 'node:path'
import type { ArtifactMetadata } from 'blink-registry'

export function readArtifactsJson(): ArtifactMetadata[] {
  const filePath = path.resolve(process.cwd(), '.velite/artifacts.json')
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as ArtifactMetadata[]
  } catch {
    return []
  }
}

export function getArtifactForContent(contentSlug: string): ArtifactMetadata | undefined {
  // Content slugs include directory prefix (e.g., "configs/eslint-flat-config")
  // Artifact slugs are just the filename part (e.g., "eslint-flat-config")
  // Match by checking if the content slug ends with the artifact slug
  return readArtifactsJson().find(
    (a) => contentSlug === a.slug || contentSlug.endsWith(`/${a.slug}`),
  )
}
