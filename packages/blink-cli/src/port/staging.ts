// ABOUTME: Stage and commit workflow for the Obsidian port pipeline.
// ABOUTME: Stage applies transforms to .obsidian-port-staging/; commit moves to content/.

import { readFile, readdir, stat, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename, extname, resolve } from 'node:path'
import matter from 'gray-matter'
import { atomicWrite } from '@/writer'
import {
  transformCallouts,
  transformWikilinks,
  transformFrontmatter,
  transformDataviewBlocks
} from '@/port/transforms'

export const STAGING_DIR = '.obsidian-port-staging'

export interface StageOptions {
  inputDir: string
  slugFilter?: string
  contentRoot: string
  stagingDir?: string
}

export interface StageResult {
  staged: Array<{ slug: string; path: string }>
}

export interface CommitOptions {
  slug: string
  collection: string
  contentRoot: string
  stagingDir?: string
}

/**
 * Build a content slug map by walking all .mdx files under contentRoot.
 * Maps bare slug (filename without extension) to { title, href }.
 */
export async function buildContentSlugMap(
  contentRoot: string
): Promise<Map<string, { title: string; href: string }>> {
  const slugMap = new Map<string, { title: string; href: string }>()

  if (!existsSync(contentRoot)) {
    return slugMap
  }

  await walkMdxFiles(contentRoot, contentRoot, slugMap)
  return slugMap
}

async function walkMdxFiles(
  dir: string,
  contentRoot: string,
  slugMap: Map<string, { title: string; href: string }>
): Promise<void> {
  let entries: string[]
  try {
    entries = await readdir(dir)
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    try {
      const s = await stat(fullPath)
      if (s.isDirectory()) {
        await walkMdxFiles(fullPath, contentRoot, slugMap)
      } else if (s.isFile() && entry.endsWith('.mdx')) {
        try {
          const raw = await readFile(fullPath, 'utf-8')
          const { data } = matter(raw)
          const slug = basename(entry, '.mdx')
          const relativePath = fullPath
            .slice(contentRoot.length)
            .replace(/\.mdx$/, '')
          const href = relativePath.startsWith('/')
            ? relativePath
            : `/${relativePath}`
          const title =
            typeof data.title === 'string'
              ? data.title
              : slug
                  .split('-')
                  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
          slugMap.set(slug, { title, href })
        } catch {
          // Skip unreadable files
        }
      }
    } catch {
      continue
    }
  }
}

/**
 * Stage Obsidian markdown files: parse, transform, write to staging directory.
 */
export async function stageEntry(options: StageOptions): Promise<StageResult> {
  const { inputDir, slugFilter, contentRoot, stagingDir } = options
  const targetDir = stagingDir || STAGING_DIR

  // Build slug map for wikilink resolution
  const slugMap = await buildContentSlugMap(contentRoot)

  // Discover .md files in inputDir
  const files = await readdir(inputDir)
  const mdFiles = files.filter(f => f.endsWith('.md'))

  const staged: Array<{ slug: string; path: string }> = []

  for (const file of mdFiles) {
    const slug = basename(file, '.md')

    // Optional slug filter
    if (slugFilter && slug !== slugFilter) {
      continue
    }

    const inputPath = join(inputDir, file)
    const raw = await readFile(inputPath, 'utf-8')

    // Parse frontmatter
    const { data, content: body } = matter(raw)

    // Transform frontmatter
    const { mapped, unknownComment } = transformFrontmatter(
      data as Record<string, unknown>
    )

    // Transform body: callouts -> dataview strip -> wikilinks
    let transformedBody = transformCallouts(body)
    transformedBody = transformDataviewBlocks(transformedBody)
    transformedBody = transformWikilinks(transformedBody, slugMap)

    // Reconstruct as MDX with YAML frontmatter
    const yamlLines: string[] = []
    for (const [key, value] of Object.entries(mapped)) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          yamlLines.push(`${key}: []`)
        } else {
          yamlLines.push(`${key}:`)
          for (const item of value) {
            yamlLines.push(`  - ${item}`)
          }
        }
      } else if (typeof value === 'boolean') {
        yamlLines.push(`${key}: ${value}`)
      } else {
        yamlLines.push(`${key}: ${value}`)
      }
    }

    const frontmatterBlock = `---\n${yamlLines.join('\n')}\n---`

    // Compose final content
    const bodyParts: string[] = []
    if (unknownComment) {
      bodyParts.push(unknownComment)
    }
    bodyParts.push(transformedBody.trim())

    const finalContent = `${frontmatterBlock}\n\n${bodyParts.join('\n\n')}\n`

    // Write to staging
    const destPath = join(targetDir, `${slug}.mdx`)
    await atomicWrite(destPath, finalContent)

    staged.push({ slug, path: destPath })
  }

  return { staged }
}

/**
 * Validate a slug for path traversal attacks (T-28-03-02).
 */
function validateSlug(slug: string): void {
  if (slug.includes('..') || slug.includes('/') || slug.startsWith('.')) {
    throw new Error(
      `Invalid slug "${slug}": must not contain path separators or traversal patterns`
    )
  }
}

/**
 * Validate a collection name for path traversal attacks.
 */
function validateCollection(collection: string): void {
  if (
    collection.includes('..') ||
    collection.includes('/') ||
    collection.startsWith('.')
  ) {
    throw new Error(
      `Invalid collection "${collection}": must not contain path separators or traversal patterns`
    )
  }
}

/**
 * Commit a staged entry: move from staging to content/<collection>/<slug>.mdx.
 * Refuses to overwrite existing content (no --force in port commit).
 */
export async function commitEntry(options: CommitOptions): Promise<void> {
  const { slug, collection, contentRoot, stagingDir } = options
  const sourceDir = stagingDir || STAGING_DIR

  // Validate slug and collection for path traversal (T-28-03-02)
  validateSlug(slug)
  validateCollection(collection)

  const stagedPath = join(sourceDir, `${slug}.mdx`)

  if (!existsSync(stagedPath)) {
    throw new Error(
      `Slug "${slug}" not found in staging directory: ${sourceDir}`
    )
  }

  // Check target does NOT exist
  const targetPath = resolve(contentRoot, collection, `${slug}.mdx`)

  // Ensure target is actually under contentRoot (path traversal guard)
  const resolvedContentRoot = resolve(contentRoot)
  if (!targetPath.startsWith(resolvedContentRoot)) {
    throw new Error(
      `Target path "${targetPath}" escapes content root "${resolvedContentRoot}"`
    )
  }

  if (existsSync(targetPath)) {
    throw new Error(
      `Target already exists: ${targetPath}. Use --force to overwrite (not supported in port commit).`
    )
  }

  // Read staged content and write to target
  const content = await readFile(stagedPath, 'utf-8')
  await atomicWrite(targetPath, content)

  // Move companion .artifact.md if present
  const artifactStagedPath = join(sourceDir, `${slug}.artifact.md`)
  if (existsSync(artifactStagedPath)) {
    const artifactTargetPath = resolve(
      contentRoot,
      collection,
      `${slug}.artifact.md`
    )
    if (!artifactTargetPath.startsWith(resolvedContentRoot)) {
      throw new Error(
        `Artifact target path "${artifactTargetPath}" escapes content root "${resolvedContentRoot}"`
      )
    }
    const artifactContent = await readFile(artifactStagedPath, 'utf-8')
    await atomicWrite(artifactTargetPath, artifactContent)
    await unlink(artifactStagedPath)
  }

  // Remove staged .mdx after successful commit
  await unlink(stagedPath)
}
