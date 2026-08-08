// ABOUTME: Script to update publish dates for existing blog posts
// ABOUTME: Scrapes dates from legacy site and updates database records

import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '@/lib/prisma'

const LEGACY_BASE_URL = 'https://www.ashleypetersenphoto.com'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function updatePostDate(postUrl: string) {
  try {
    const response = await axios.get(postUrl, { timeout: 30000 })
    const $ = cheerio.load(response.data)

    // Extract post title to find matching post
    const title = $('h1.entry-title').first().text().trim()
    if (!title) {
      console.log(`  ⚠ No title found at ${postUrl}`)
      return null
    }

    const slug = slugify(title)

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (!existingPost) {
      console.log(`  ⊘ Post not found in database: "${title}"`)
      return null
    }

    // Extract date
    const dateText = $('time.published').first().attr('datetime') || ''
    if (!dateText) {
      console.log(`  ⚠ No date found for: "${title}"`)
      return null
    }

    const publishedAt = new Date(dateText)

    // Update the post
    await prisma.blogPost.update({
      where: { slug },
      data: {
        publishedAt,
        createdAt: publishedAt,
        updatedAt: publishedAt,
      },
    })

    console.log(`  ✓ Updated "${title}" → ${publishedAt.toLocaleDateString()}`)
    return { title, publishedAt }
  } catch (error) {
    console.error(`  ✗ Failed to update date for ${postUrl}:`, error)
    return null
  }
}

async function scrapeBlogPage(
  url: string,
  allPostUrls: Set<string>
): Promise<string | null> {
  try {
    const response = await axios.get(url, { timeout: 30000 })
    const $ = cheerio.load(response.data)

    // Extract all post URLs from this page
    let postsFound = 0
    $('h2.entry-title a, h1.entry-title a').each((_, el) => {
      const href = $(el).attr('href')
      if (href) {
        const absoluteUrl = href.startsWith('http')
          ? href
          : `${LEGACY_BASE_URL}${href}`
        if (!allPostUrls.has(absoluteUrl)) {
          allPostUrls.add(absoluteUrl)
          postsFound++
        }
      }
    })

    console.log(`  Found ${postsFound} posts on this page`)

    // Check for pagination link (Older posts)
    const olderLink = $('a:contains("Older")').attr('href')
    if (olderLink) {
      const nextPageUrl = olderLink.startsWith('http')
        ? olderLink
        : `${LEGACY_BASE_URL}${olderLink}`
      return nextPageUrl
    }

    return null
  } catch (error) {
    console.error(`  Failed to fetch page:`, error)
    return null
  }
}

async function main() {
  console.log(
    'Updating blog post publish dates from ashleypetersenphoto.com/blog'
  )
  console.log('='.repeat(80))

  try {
    // First, get all post URLs by following pagination
    const allPostUrls = new Set<string>()
    let currentPageUrl: string | null = `${LEGACY_BASE_URL}/blog`
    let pageCount = 0

    console.log('\nPhase 1: Discovering all blog post URLs...\n')

    while (currentPageUrl && pageCount < 20) {
      pageCount++
      console.log(`Scraping page ${pageCount}: ${currentPageUrl}`)
      const nextPageUrl = await scrapeBlogPage(currentPageUrl, allPostUrls)

      if (nextPageUrl) {
        currentPageUrl = nextPageUrl
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } else {
        currentPageUrl = null
      }
    }

    const postUrls = Array.from(allPostUrls)
    console.log(`\n✓ Found ${postUrls.length} total blog posts`)

    console.log('\nPhase 2: Updating publish dates...\n')

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const url of postUrls) {
      const result = await updatePostDate(url)
      if (result) {
        updatedCount++
      } else {
        skippedCount++
      }

      // Delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log('\n' + '='.repeat(80))
    console.log('Date update complete!')
    console.log(`✓ Updated: ${updatedCount} posts`)
    console.log(`⊘ Skipped: ${skippedCount} posts`)

    // Show summary of updated posts
    const posts = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 10,
    })

    console.log('\nMost recent posts:')
    posts.forEach((post) => {
      console.log(
        `  • ${post.publishedAt?.toLocaleDateString()} - ${post.title}`
      )
    })
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log('\n✓ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error)
    process.exit(1)
  })
