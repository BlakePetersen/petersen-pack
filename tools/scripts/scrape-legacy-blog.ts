// ABOUTME: Script to scrape blog posts from legacy ashleypetersenphoto.com site
// ABOUTME: Imports posts with content, images, categories, and tags into new database

import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const LEGACY_BASE_URL = 'https://www.ashleypetersenphoto.com'
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'blog')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function downloadAndProcessImage(
  imageUrl: string,
  postSlug: string,
  index: number
): Promise<{ url: string; width: number; height: number } | null> {
  try {
    // Make URL absolute
    const absoluteUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${LEGACY_BASE_URL}${imageUrl}`

    console.log(`  Downloading image: ${absoluteUrl}`)

    const response = await axios.get(absoluteUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    const buffer = Buffer.from(response.data)

    // Process with Sharp
    const processed = await sharp(buffer)
      .resize(2400, 2400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer()

    // Get metadata
    const metadata = await sharp(processed).metadata()

    // Save to uploads directory
    const filename = `${postSlug}-${index}.webp`
    const filepath = path.join(UPLOADS_DIR, filename)
    fs.writeFileSync(filepath, processed)

    return {
      url: `/uploads/blog/${filename}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  } catch (error) {
    console.error(`  Failed to download image ${imageUrl}:`, error)
    return null
  }
}

async function scrapePost(postUrl: string) {
  console.log(`\nScraping post: ${postUrl}`)

  try {
    const response = await axios.get(postUrl, { timeout: 30000 })
    const $ = cheerio.load(response.data)

    // Extract post title
    const title = $('h1.entry-title').first().text().trim()
    if (!title) {
      console.log('  ⚠ No title found, skipping post')
      return null
    }

    console.log(`  Title: ${title}`)

    // Generate slug
    const slug = slugify(title)

    // Check if post already exists
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existing) {
      console.log(`  ✓ Post already exists, skipping`)
      return null
    }

    // Extract date
    const dateText = $('time.published').first().attr('datetime') || ''
    const publishedAt = dateText ? new Date(dateText) : new Date()
    console.log(`  Published: ${publishedAt.toLocaleDateString()}`)

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

    // Extract post content
    const contentEl = $('.entry-content').first()
    let content = ''
    let excerpt = ''

    // Get text content (paragraphs)
    contentEl.find('p').each((i, el) => {
      const text = $(el).text().trim()
      if (text) {
        content += text + '\n\n'
        if (i === 0) {
          excerpt = text
        }
      }
    })

    // Extract images from post
    const images: string[] = []
    contentEl.find('img').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !src.includes('data:image')) {
        images.push(src)
      }
    })

    console.log(`  Categories: ${categories.join(', ') || 'none'}`)
    console.log(`  Tags: ${tags.join(', ') || 'none'}`)
    console.log(`  Images: ${images.length}`)

    // Download and process images
    const processedImages = []
    for (let i = 0; i < images.length; i++) {
      const processed = await downloadAndProcessImage(images[i], slug, i)
      if (processed) {
        processedImages.push(processed)
      }
      // Delay to be respectful
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Use first image as cover if available
    const coverImage = processedImages.length > 0 ? processedImages[0].url : null

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

    // Create blog post
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt.substring(0, 300),
        content: content || 'Content from legacy site',
        coverImage,
        published: true,
        publishedAt,
        createdAt: publishedAt,
        updatedAt: publishedAt,
        categories: {
          create: categoryConnections,
        },
        tags: {
          create: tagConnections,
        },
        images: {
          create: processedImages.slice(1).map((img, idx) => ({
            url: img.url,
            width: img.width,
            height: img.height,
            sortOrder: idx,
          })),
        },
      },
    })

    console.log(`  ✓ Created post: ${post.title}`)
    return post
  } catch (error) {
    console.error(`  ✗ Failed to scrape post:`, error)
    return null
  }
}

async function scrapeBlogPage(url: string, allPostUrls: Set<string>): Promise<string | null> {
  console.log(`\nFetching blog page: ${url}`)

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

    console.log(`  Found ${postsFound} new posts on this page`)

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
  console.log('Starting blog post scraping from ashleypetersenphoto.com/blog')
  console.log('Following pagination to scrape all posts...')
  console.log('='.repeat(80))

  try {
    // Scrape all pages by following pagination
    const allPostUrls = new Set<string>()
    let currentPageUrl: string | null = `${LEGACY_BASE_URL}/blog`
    let pageCount = 0

    while (currentPageUrl && pageCount < 20) { // Safety limit of 20 pages
      pageCount++
      const nextPageUrl = await scrapeBlogPage(currentPageUrl, allPostUrls)

      if (nextPageUrl) {
        currentPageUrl = nextPageUrl
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Delay between pages
      } else {
        currentPageUrl = null
      }
    }

    const postUrls = Array.from(allPostUrls)
    console.log(`\nScraped ${pageCount} pages`)
    console.log(`Found ${postUrls.length} total blog posts to import\n`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const url of postUrls) {
      const result = await scrapePost(url)
      if (result) {
        successCount++
      } else if (result === null) {
        skipCount++
      } else {
        errorCount++
      }

      // Delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    console.log('\n' + '='.repeat(80))
    console.log('Blog scraping complete!')
    console.log(`✓ Successfully imported: ${successCount} posts`)
    console.log(`⊘ Skipped (already exist): ${skipCount} posts`)
    console.log(`✗ Errors: ${errorCount} posts`)

    // Show summary
    const totalPosts = await prisma.blogPost.count()
    const totalCategories = await prisma.blogCategory.count()
    const totalTags = await prisma.blogTag.count()
    const totalImages = await prisma.blogPostImage.count()

    console.log('\nDatabase summary:')
    console.log(`  Blog posts: ${totalPosts}`)
    console.log(`  Categories: ${totalCategories}`)
    console.log(`  Tags: ${totalTags}`)
    console.log(`  Blog images: ${totalImages}`)

    // Show file system stats
    const files = fs.readdirSync(UPLOADS_DIR)
    const totalSize = files.reduce((acc, file) => {
      const stats = fs.statSync(path.join(UPLOADS_DIR, file))
      return acc + stats.size
    }, 0)

    console.log(`\nUploaded files:`)
    console.log(`  Count: ${files.length}`)
    console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
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
