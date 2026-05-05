// ABOUTME: Script to update categories and tags for existing blog posts
// ABOUTME: Scrapes taxonomy from legacy site and updates database records

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

async function updatePostCategoriesAndTags(postUrl: string) {
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
      include: {
        categories: true,
        tags: true,
      },
    })

    if (!existingPost) {
      console.log(`  ⊘ Post not found in database: "${title}"`)
      return null
    }

    // Extract categories
    const categories: string[] = []
    $('.categories a[rel="tag"]').each((_, el) => {
      const cat = $(el).text().trim()
      if (cat) categories.push(cat)
    })

    // Extract tags
    const tags: string[] = []
    $('.tags a[rel="tag"]').each((_, el) => {
      const tag = $(el).text().trim()
      if (tag) tags.push(tag)
    })

    if (categories.length === 0 && tags.length === 0) {
      console.log(`  ⊘ No categories or tags found for: "${title}"`)
      return null
    }

    // Create or find categories
    const categoryConnections = await Promise.all(
      categories.map(async (categoryName) => {
        const categorySlug = slugify(categoryName)
        const category = await prisma.blogCategory.upsert({
          where: { slug: categorySlug },
          update: {},
          create: {
            name: categoryName,
            slug: categorySlug,
          },
        })
        return { categoryId: category.id }
      })
    )

    // Create or find tags
    const tagConnections = await Promise.all(
      tags.map(async (tagName) => {
        const tagSlug = slugify(tagName)
        const tag = await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug,
          },
        })
        return { tagId: tag.id }
      })
    )

    // Delete existing relationships
    await prisma.blogPostCategory.deleteMany({
      where: { postId: existingPost.id },
    })
    await prisma.blogPostTag.deleteMany({
      where: { postId: existingPost.id },
    })

    // Create new relationships
    if (categoryConnections.length > 0) {
      await prisma.blogPostCategory.createMany({
        data: categoryConnections.map((c) => ({
          postId: existingPost.id,
          categoryId: c.categoryId,
        })),
      })
    }

    if (tagConnections.length > 0) {
      await prisma.blogPostTag.createMany({
        data: tagConnections.map((t) => ({
          postId: existingPost.id,
          tagId: t.tagId,
        })),
      })
    }

    console.log(
      `  ✓ Updated "${title}" → ${categories.length} categories, ${tags.length} tags`
    )
    return { title, categories: categories.length, tags: tags.length }
  } catch (error) {
    console.error(`  ✗ Failed to update taxonomy for ${postUrl}:`, error)
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
  console.log('Updating blog post categories and tags from ashleypetersenphoto.com/blog')
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

    console.log('\nPhase 2: Updating categories and tags...\n')

    let updatedCount = 0
    let skippedCount = 0

    for (const url of postUrls) {
      const result = await updatePostCategoriesAndTags(url)
      if (result) {
        updatedCount++
      } else {
        skippedCount++
      }

      // Delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log('\n' + '='.repeat(80))
    console.log('Category and tag update complete!')
    console.log(`✓ Updated: ${updatedCount} posts`)
    console.log(`⊘ Skipped: ${skippedCount} posts`)

    // Show summary
    const totalCategories = await prisma.blogCategory.count()
    const totalTags = await prisma.blogTag.count()

    console.log(`\nTotal categories: ${totalCategories}`)
    console.log(`Total tags: ${totalTags}`)

    if (totalCategories > 0) {
      const categories = await prisma.blogCategory.findMany({
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { name: 'asc' },
      })

      console.log('\nCategories:')
      categories.forEach((cat) => {
        console.log(`  • ${cat.name} (${cat._count.posts} posts)`)
      })
    }
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
