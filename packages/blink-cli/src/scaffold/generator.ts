// ABOUTME: Scaffold file generation logic for blink scaffold command.
// ABOUTME: Derives frontmatter defaults from DxFrontmatterSchema and writes via atomicWrite.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { SlugSchema } from 'blink-registry'
import { atomicWrite } from '../writer'
import { getBodyTemplate, getArtifactTemplate } from './templates'

/** Singular → plural collection name mapping. */
const COLLECTION_PLURAL: Record<string, string> = {
  skill: 'skills',
  config: 'configs',
  hook: 'hooks',
  guide: 'guides'
}

const VALID_COLLECTIONS = Object.keys(COLLECTION_PLURAL)

export interface ScaffoldOptions {
  collection: string
  slug: string
  contentRoot: string
  dryRun: boolean
  force: boolean
  voice?: string[]
}

export interface ScaffoldResult {
  files: Array<{ path: string; written: boolean }>
}

/** Convert slug to title case (e.g., "my-skill" → "My Skill"). */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Generates scaffold files for a DX content entry.
 *
 * Per D-04: guides produce only .mdx; skills, configs, hooks produce
 * both .mdx and companion .artifact.md.
 */
export async function generateScaffold(
  options: ScaffoldOptions
): Promise<ScaffoldResult> {
  const { collection, slug, contentRoot, dryRun, force, voice } = options

  // Validate collection
  if (!VALID_COLLECTIONS.includes(collection)) {
    throw new Error(
      `Invalid collection "${collection}". Must be one of: ${VALID_COLLECTIONS.join(', ')}`
    )
  }

  // Validate slug against SlugSchema (T-28-01-01 threat mitigation)
  const slugResult = SlugSchema.safeParse(slug)
  if (!slugResult.success) {
    throw new Error(
      `Invalid slug "${slug}". Must match pattern: ^[a-z0-9]+(-[a-z0-9]+)*$`
    )
  }

  const plural = COLLECTION_PLURAL[collection]
  const mdxPath = join(contentRoot, plural, `${slug}.mdx`)
  const artifactPath = join(contentRoot, plural, `${slug}.artifact.md`)
  const hasArtifact = collection !== 'guide'

  // Check existing files unless --force
  if (!force && !dryRun) {
    const existing: string[] = []
    if (existsSync(mdxPath)) existing.push(mdxPath)
    if (hasArtifact && existsSync(artifactPath)) existing.push(artifactPath)
    if (existing.length > 0) {
      throw new Error(
        `Files already exist (use --force to overwrite): ${existing.join(', ')}`
      )
    }
  }

  // Build MDX content
  const title = slugToTitle(slug)
  const description = `TODO: Add description for ${title}`
  const body = getBodyTemplate(plural, voice)
  const mdxContent = `---
title: "${title}"
description: "${description}"
applies_to: []
draft: true
---

${body}`

  // Build artifact content (per D-04: not for guides)
  const artifactContent = hasArtifact
    ? getArtifactTemplate(title, description, collection)
    : null

  // Assemble file plans
  const files: Array<{ path: string; content: string }> = [
    { path: mdxPath, content: mdxContent }
  ]
  if (artifactContent) {
    files.push({ path: artifactPath, content: artifactContent })
  }

  // Execute writes or return dry-run plans
  const results: ScaffoldResult['files'] = []

  for (const file of files) {
    if (dryRun) {
      results.push({ path: file.path, written: false })
    } else {
      await atomicWrite(file.path, file.content)
      results.push({ path: file.path, written: true })
    }
  }

  return { files: results }
}
