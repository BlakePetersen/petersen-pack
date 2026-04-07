// ABOUTME: Typed pipeline stages for artifact apply/update workflows.
// ABOUTME: Separates resolve, prepare, execute, and record into composable stages.

import { stat } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { consola } from 'consola'
import { fetchIndex, fetchArtifact } from '@/registry'
import {
  readManifest,
  writeManifest,
  createEmptyManifest,
  addManifestEntry,
  checksum,
} from '@/manifest'
import { atomicWrite } from '@/writer'
import { injectMarkers, findManagedSections } from '@/markers'
import { resolveDestination, resolveManifestRoot } from '@/scope'
import { findMissingDeps } from '@/deps'
import { addToGitignore } from '@/gitignore'
import type { Manifest, ManifestEntry, ManifestFileEntry, MergeStrategy, RegistryArtifact } from 'blink-registry'

// --- Pipeline types ---

export type Scope = 'project' | 'global'

export interface ResolveResult {
  artifact: RegistryArtifact
  manifest: Manifest
  manifestRoot: string
  wasAutoInit: boolean
}

export interface FilePlan {
  path: string
  destPath: string
  content: string
  merge: MergeStrategy
  exists: boolean
  markerConflict: boolean
}

export interface DepPlan {
  missing: string[]
  devDeps: Record<string, string>
}

export interface PrepareResult {
  filePlans: FilePlan[]
  depPlan: DepPlan
}

export interface WriteResult {
  fileEntries: ManifestFileEntry[]
}

// --- Stage: Resolve ---

export async function resolve(
  slug: string,
  scope: Scope,
  cwd: string,
): Promise<ResolveResult> {
  const index = await fetchIndex()
  const item = index.items.find((i) => i.slug === slug)

  if (!item) {
    consola.error(`Artifact "${slug}" not found in registry.`)
    process.exit(1)
  }

  const artifact = await fetchArtifact(item.type, item.slug)
  const manifestRoot = resolveManifestRoot(scope, cwd)
  let manifest = await readManifest(manifestRoot)
  let wasAutoInit = false

  if (!manifest) {
    manifest = createEmptyManifest()
    wasAutoInit = true
  }

  return { artifact, manifest, manifestRoot, wasAutoInit }
}

// --- Stage: Prepare ---

export async function prepare(
  resolved: ResolveResult,
  scope: Scope,
  cwd: string,
): Promise<PrepareResult> {
  const { artifact, manifest } = resolved

  const filePlans: FilePlan[] = []

  for (const file of artifact.files) {
    const destPath = resolveDestination(file.path, scope, cwd)
    const exists = await fileExists(destPath)

    let content = file.content
    let markerConflict = false

    if (file.merge === 'section') {
      if (exists) {
        const currentContent = await readFile(destPath, 'utf-8')
        const sections = findManagedSections(currentContent, artifact.slug)
        if (sections.length > 0) {
          markerConflict = true
        }
      }
      content = injectMarkers(file.content, artifact.slug, file.path)
    }

    filePlans.push({
      path: file.path,
      destPath,
      content,
      merge: file.merge,
      exists,
      markerConflict,
    })
  }

  const installedSlugs = manifest.items.map((i) => i.slug)
  const missing = artifact.dependencies
    ? findMissingDeps(artifact.dependencies, installedSlugs)
    : []

  const depPlan: DepPlan = {
    missing,
    devDeps: artifact.devDependencies ?? {},
  }

  return { filePlans, depPlan }
}

// --- Stage: Execute (file writing) ---

export async function executeFileWrite(
  plan: FilePlan,
): Promise<ManifestFileEntry> {
  await atomicWrite(plan.destPath, plan.content)
  return {
    path: plan.path,
    checksum: checksum(plan.content),
    merge: plan.merge,
  }
}

export function buildFileEntry(plan: FilePlan): ManifestFileEntry {
  return {
    path: plan.path,
    checksum: checksum(plan.content),
    merge: plan.merge,
  }
}

// --- Stage: Record ---

export async function record(
  resolved: ResolveResult,
  fileEntries: ManifestFileEntry[],
  scope: Scope,
  cwd: string,
): Promise<void> {
  const { artifact, manifest, manifestRoot, wasAutoInit } = resolved

  if (wasAutoInit) {
    await addToGitignore(cwd)
  }

  const entry: ManifestEntry = {
    slug: artifact.slug,
    name: artifact.name,
    type: artifact.type,
    version: artifact.version,
    scope,
    installedAt: new Date().toISOString(),
    files: fileEntries,
  }

  const updatedManifest = addManifestEntry(manifest, entry)
  await writeManifest(manifestRoot, updatedManifest)
}

// --- Shared utilities ---

export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
