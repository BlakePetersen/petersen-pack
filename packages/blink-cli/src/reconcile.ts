// ABOUTME: Per-file update reconciliation — decides write vs skip vs no-op
// ABOUTME: from upstream content, current disk content, and prior manifest entry.

import { consola } from 'consola'
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
  hasChanges: boolean
}

export interface ReconcileInput {
  file: ArtifactFile
  destPath: string
  currentContent: string | null
  manifestFileEntry: ManifestFileEntry | undefined
  slug: string
  skipPrompt: boolean
}

// File missing on disk: write fresh, no prompt, no diff.
function writeFresh(input: ReconcileInput): ReconcileResult {
  return {
    action: { kind: 'write', destPath: input.destPath, content: input.file.content },
    entry: {
      path: input.file.path,
      checksum: checksum(input.file.content),
      merge: input.file.merge,
    },
    hasChanges: true,
  }
}

// Caller declined the overwrite prompt OR upstream matched current: leave
// the manifest entry as the prior tracked state (or rebuild from disk if
// this is a brand-new install of an already-existing file).
function preserveExisting(input: ReconcileInput): ReconcileResult {
  const entry =
    input.manifestFileEntry ??
    {
      path: input.file.path,
      checksum: checksum(input.currentContent ?? ''),
      merge: input.file.merge,
    }
  return { action: { kind: 'skip' }, entry, hasChanges: false }
}

// Section-merge resolves the "current" managed payload and the "new" full
// file content; replace operates on the file as a whole.
function materialize(
  file: ArtifactFile,
  currentContent: string,
  slug: string,
):
  | { kind: 'no-section'; reason: string }
  | { kind: 'unchanged' }
  | { kind: 'changed'; newFullContent: string; currentManaged: string } {
  if (file.merge === 'section') {
    const sections = findManagedSections(currentContent, slug)
    if (sections.length === 0) {
      return { kind: 'no-section', reason: `No managed section found for ${slug} in ${file.path}.` }
    }
    const currentManaged = sections[0].content
    if (currentManaged === file.content) return { kind: 'unchanged' }
    return {
      kind: 'changed',
      newFullContent: replaceManagedContent(currentContent, slug, file.content),
      currentManaged,
    }
  }

  // replace
  if (currentContent === file.content) return { kind: 'unchanged' }
  return { kind: 'changed', newFullContent: file.content, currentManaged: currentContent }
}

export async function reconcileFile(input: ReconcileInput): Promise<ReconcileResult> {
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

  // Local-modification check — if the file has drifted from what we last
  // wrote, ask before overwriting.
  if (
    input.manifestFileEntry &&
    input.manifestFileEntry.checksum !== checksum(input.currentContent)
  ) {
    const confirmed = await confirmAction(
      `Local changes detected in ${input.file.path}. Overwrite?`,
      input.skipPrompt,
    )
    if (!confirmed) {
      return {
        action: { kind: 'skip' },
        entry: input.manifestFileEntry,
        hasChanges: false,
      }
    }
  }

  consola.log(formatColoredDiff(mat.currentManaged, mat.newFullContent, input.file.path))

  return {
    action: { kind: 'write', destPath: input.destPath, content: mat.newFullContent },
    entry: {
      path: input.file.path,
      checksum: checksum(mat.newFullContent),
      merge: input.file.merge,
    },
    hasChanges: true,
  }
}
