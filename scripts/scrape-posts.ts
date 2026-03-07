// ABOUTME: One-time script to fetch blog posts from Contentful and save as MDX files.
// ABOUTME: Saves posts to apps/blakepetersen.io/content/posts/ with frontmatter metadata.

import { createClient } from 'contentful'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const spaceId = process.env.CONTENTFUL_SPACE_ID
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN

if (!spaceId || !accessToken) {
  console.error('Missing required env vars: CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN')
  process.exit(1)
}

const client = createClient({
  space: spaceId,
  accessToken: accessToken,
})

function escapeYaml(value: string): string {
  if (/[:"'\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`
  }
  return `"${value}"`
}

async function scrape() {
  const entries = await client.getEntries({ content_type: 'blogPost' })

  console.log(`Found ${entries.items.length} blog posts`)

  const outDir = join(__dirname, '../apps/blakepetersen.io/content/posts')
  mkdirSync(outDir, { recursive: true })

  for (const entry of entries.items) {
    const fields = entry.fields as Record<string, unknown>
    const slug = fields.slug as string
    const title = fields.title as string
    const body = fields.body as string | undefined
    const publishDate = fields.publishDate as string | undefined
    const description = fields.description as string | undefined
    const tags = fields.tags as string[] | undefined

    const frontmatterLines = [
      '---',
      `title: ${escapeYaml(title)}`,
      `date: ${escapeYaml(publishDate || new Date().toISOString())}`,
      `description: ${escapeYaml(description || '')}`,
    ]

    if (tags && tags.length > 0) {
      frontmatterLines.push(`tags: [${tags.map(t => escapeYaml(t)).join(', ')}]`)
    }

    frontmatterLines.push('draft: true')
    frontmatterLines.push('---')

    const content = `${frontmatterLines.join('\n')}\n\n${body || ''}\n`
    writeFileSync(join(outDir, `${slug}.mdx`), content)
    console.log(`Saved: ${slug}.mdx`)
  }

  console.log(`\nDone. Scraped ${entries.items.length} posts to ${outDir}`)
}

scrape().catch((err) => {
  console.error('Scrape failed:', err)
  process.exit(1)
})
