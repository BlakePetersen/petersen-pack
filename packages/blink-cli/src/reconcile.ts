// ABOUTME: Per-file update reconciliation — decides write vs skip vs no-op
// ABOUTME: from upstream content, current disk content, and prior manifest entry.

import { consola } from 'consola'
import pc from 'picocolors'
import { confirmAction } from '@/modules/prompt'
import { findManagedSections, replaceManagedContent } from '@/markers'
import { formatColoredDiff } from '@/output'
import { checksum } from '@/manifest'
import type { ArtifactFile, ManifestFileEntry } from 'blink-registry'

export type WriteAction =
  | { kind: 'write'; destPath: string; content: string }
  | { kind: 'skip' }

export interface ReconcileResult {
  action: WriteAction
  entry: ManifestFileEntry
}

export interface ReconcileInput {
  file: ArtifactFile
  destPath: string
  currentContent: string | null
  manifestFileEntry: ManifestFileEntry | undefined
  slug: string
  skipPrompt: boolean
}

function writeFresh(input: ReconcileInput): ReconcileResult {
  return {
    action: {
      kind: 'write',
      destPath: input.destPath,
      content: input.file.content
    },
    entry: {
      path: input.file.path,
      checksum: checksum(input.file.content),
      merge: input.file.merge
    }
  }
}

function preserveExisting(input: ReconcileInput): ReconcileResult {
  const entry = input.manifestFileEntry ?? {
    path: input.file.path,
    checksum: checksum(input.currentContent ?? ''),
    merge: input.file.merge
  }
  return { action: { kind: 'skip' }, entry }
}

// section-merge: diff side is the section payload (file.content), but the
// write side is the full file with the managed region replaced.
// replace: diff side and write side are both file.content (whole file).
function materialize(
  file: ArtifactFile,
  currentContent: string,
  slug: string
):
  | { kind: 'no-section'; reason: string }
  | { kind: 'unchanged' }
  | { kind: 'changed'; writeContent: string; currentDiff: string } {
  if (file.merge === 'section') {
    const sections = findManagedSections(currentContent, slug)
    if (sections.length === 0) {
      return {
        kind: 'no-section',
        reason: `No managed section found for ${pc.bold(slug)} in ${file.path}.`
      }
    }
    const currentManaged = sections[0].content
    if (currentManaged === file.content) return { kind: 'unchanged' }
    return {
      kind: 'changed',
      writeContent: replaceManagedContent(currentContent, slug, file.content),
      currentDiff: currentManaged
    }
  }

  if (currentContent === file.content) return { kind: 'unchanged' }
  return {
    kind: 'changed',
    writeContent: file.content,
    currentDiff: currentContent
  }
}

export async function reconcileFile(
  input: ReconcileInput
): Promise<ReconcileResult> {
  if (input.currentContent === null) {
    return writeFresh(input)
  }

  const mat = materialize(input.file, input.currentContent, input.slug)

  if (mat.kind === 'no-section') {
    consola.warn(`${mat.reason} Skipping.`)
    return preserveExisting(input)
  }

  if (mat.kind === 'unchanged') {
    return preserveExisting(input)
  }

  if (
    input.manifestFileEntry &&
    input.manifestFileEntry.checksum !== checksum(input.currentContent)
  ) {
    const confirmed = await confirmAction(
      `Local changes detected in ${input.file.path}. Overwrite?`,
      input.skipPrompt
    )
    if (!confirmed) {
      return { action: { kind: 'skip' }, entry: input.manifestFileEntry }
    }
  }

  // Diff against the section payload (or full file for replace), not the
  // reconstructed full file — otherwise section-merge previews show all the
  // surrounding unchanged content as additions.
  consola.log(
    formatColoredDiff(mat.currentDiff, input.file.content, input.file.path)
  )

  return {
    action: {
      kind: 'write',
      destPath: input.destPath,
      content: mat.writeContent
    },
    entry: {
      path: input.file.path,
      checksum: checksum(mat.writeContent),
      merge: input.file.merge
    }
  }
}
