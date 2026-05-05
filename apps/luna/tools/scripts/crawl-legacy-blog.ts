// ABOUTME: Crawls the legacy Squarespace blog to find all post URLs
// ABOUTME: Maps legacy URLs to database records and downloads gallery images

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

interface LegacyPost {
  url: string
  title: string
  slug: string
}

async function crawlBlogIndex(): Promise<LegacyPost[]> {
  const posts: LegacyPost[] = []
  let offset: string | null = null
  let pageNum = 0

  console.log('Crawling legacy blog index...')

  while (true) {
    pageNum++
    const pageUrl: string = offset
      ? `${LEGACY_BASE_URL}/blog?offset=${offset}`
      : `${LEGACY_BASE_URL}/blog`

    console.log(`  Page ${pageNum}: ${pageUrl}`)

    try {
      const response = await axios.get(pageUrl, { timeout: 30000 })
      const $ = cheerio.load(response.data)

      // Find all blog post links
      let foundPosts = 0
      $(
        'article a[href^="/blog/"], .blog-item a[href^="/blog/"], h1 a[href^="/blog/"], .entry-title a[href^="/blog/"]'
      ).each((_, el) => {
        const href = $(el).attr('href')
        const title = $(el).text().trim()

        if (href && href !== '/blog' && !href.includes('?offset=')) {
          const slug = href.replace('/blog/', '').replace(/\/$/, '')

          // Avoid duplicates
          if (!posts.find((p) => p.slug === slug)) {
            posts.push({
              url: `${LEGACY_BASE_URL}${href}`,
              title: title || slug,
              slug,
            })
            foundPosts++
          }
        }
      })

      // Also try to find posts in summary blocks
      $('a.summary-title-link, a.blog-title').each((_, el) => {
        const href = $(el).attr('href')
        const title = $(el).text().trim()

        if (
          href &&
          href.startsWith('/blog/') &&
          href !== '/blog' &&
          !href.includes('?offset=')
        ) {
          const slug = href.replace('/blog/', '').replace(/\/$/, '')

          if (!posts.find((p) => p.slug === slug)) {
            posts.push({
              url: `${LEGACY_BASE_URL}${href}`,
              title: title || slug,
              slug,
            })
            foundPosts++
          }
        }
      })

      console.log(`    Found ${foundPosts} posts on this page`)

      // Find "Older" pagination link
      const olderLink = $('a[href*="?offset="]')
        .filter((_, el) => {
          const text = $(el).text().toLowerCase()
          return text.includes('older') || text.includes('→')
        })
        .first()

      const olderHref = olderLink.attr('href')
      if (olderHref) {
        const match = olderHref.match(/offset=(\d+)/)
        if (match && match[1] !== offset) {
          offset = match[1]
          // Small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 500))
          continue
        }
      }

      // No more pages
      break
    } catch (error) {
      console.error(
        `  Error fetching page: ${error instanceof Error ? error.message : error}`
      )
      break
    }
  }

  return posts
}

async function scrapeImagesFromPost(postUrl: string): Promise<string[]> {
  try {
    const response = await axios.get(postUrl, { timeout: 30000 })
    const $ = cheerio.load(response.data)

    const images: string[] = []
    const seen = new Set<string>()

    // Squarespace uses data-src for lazy-loaded images in galleries
    // Also check regular src attributes for Squarespace CDN images
    $('img').each((_, el) => {
      // Prefer data-src (higher resolution lazy-load source)
      const dataSrc = $(el).attr('data-src')
      const src = $(el).attr('src')
      const imageUrl = dataSrc || src

      if (
        imageUrl &&
        !imageUrl.includes('data:image') &&
        imageUrl.includes('squarespace-cdn.com') &&
        !seen.has(imageUrl)
      ) {
        seen.add(imageUrl)
        images.push(imageUrl)
      }
    })

    return images
  } catch (error) {
    console.error(
      `  ✗ Failed to fetch post:`,
      error instanceof Error ? error.message : error
    )
    return []
  }
}

async function downloadAndProcessImage(
  imageUrl: string,
  postSlug: string,
  index: number
): Promise<{ url: string; width: number; height: number } | null> {
  const filename = `${postSlug}-${index}.webp`
  const filepath = path.join(UPLOADS_DIR, filename)

  // Skip if already exists
  if (fs.existsSync(filepath)) {
    console.log(`    ✓ Already exists: ${filename}`)
    return null
  }

  try {
    console.log(`    Downloading: ${imageUrl.substring(0, 80)}...`)

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    const buffer = Buffer.from(response.data)

    // Process with Sharp - optimize for web
    const processed = await sharp(buffer)
      .resize(1800, 1800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Get metadata
    const metadata = await sharp(processed).metadata()

    // Save to uploads directory
    fs.writeFileSync(filepath, processed)

    console.log(
      `    ✓ Saved: ${filename} (${(processed.length / 1024).toFixed(0)}KB)`
    )

    return {
      url: `/uploads/blog/${filename}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  } catch (error) {
    console.error(
      `    ✗ Failed: ${imageUrl.substring(0, 60)}`,
      error instanceof Error ? error.message : error
    )
    return null
  }
}

function normalizeTitle(title: string): string {
  // Remove category prefix like "Family // " or "Wedding //"
  const withoutPrefix = title.replace(/^[^\/]+\/\/\s*/, '')
  // Normalize to lowercase and remove special chars
  return withoutPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function main() {
  console.log('='.repeat(80))
  console.log('Legacy Blog Crawler')
  console.log('='.repeat(80))

  // Step 1: Crawl legacy blog to get all post URLs
  const legacyPosts = await crawlBlogIndex()
  console.log(`\nFound ${legacyPosts.length} posts on legacy site`)

  // Step 2: Get all database posts
  const dbPosts = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      images: {
        select: { id: true },
      },
    },
  })
  console.log(`Database has ${dbPosts.length} posts`)

  // Step 3: Create mapping between legacy and DB posts
  const matches: Array<{
    dbPost: (typeof dbPosts)[0]
    legacyPost: LegacyPost
  }> = []

  for (const dbPost of dbPosts) {
    // Try exact slug match first
    let legacyMatch = legacyPosts.find((lp) => lp.slug === dbPost.slug)

    // Try normalized title match
    if (!legacyMatch) {
      const normalizedDbTitle = normalizeTitle(dbPost.title)
      legacyMatch = legacyPosts.find((lp) => {
        const normalizedLegacyTitle = normalizeTitle(lp.title)
        return (
          normalizedLegacyTitle === normalizedDbTitle ||
          normalizedLegacyTitle.includes(normalizedDbTitle) ||
          normalizedDbTitle.includes(normalizedLegacyTitle)
        )
      })
    }

    if (legacyMatch) {
      matches.push({ dbPost, legacyPost: legacyMatch })
    }
  }

  console.log(`\nMatched ${matches.length} posts between DB and legacy site`)

  // Step 4: Download images for matched posts that need them
  let totalDownloaded = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const match of matches) {
    const { dbPost, legacyPost } = match

    // Check if post already has gallery images
    if (dbPost.images.length > 0) {
      console.log(
        `\n✓ ${dbPost.title} - already has ${dbPost.images.length} images`
      )
      continue
    }

    console.log(`\n${dbPost.title}`)
    console.log(`  DB slug: ${dbPost.slug}`)
    console.log(`  Legacy URL: ${legacyPost.url}`)

    // Scrape images from legacy post
    const imageUrls = await scrapeImagesFromPost(legacyPost.url)

    if (imageUrls.length === 0) {
      console.log(`  ⚠ No images found`)
      continue
    }

    console.log(`  Found ${imageUrls.length} images`)

    // Download and save images
    for (let i = 0; i < imageUrls.length; i++) {
      const result = await downloadAndProcessImage(imageUrls[i], dbPost.slug, i)

      if (result) {
        totalDownloaded++

        // Save to database (skip cover image at index 0)
        if (i > 0) {
          const existingImage = await prisma.blogPostImage.findFirst({
            where: {
              postId: dbPost.id,
              url: result.url,
            },
          })

          if (!existingImage) {
            await prisma.blogPostImage.create({
              data: {
                postId: dbPost.id,
                url: result.url,
                width: result.width,
                height: result.height,
                sortOrder: i - 1,
              },
            })
            console.log(`    ✓ Saved to DB: image ${i}`)
          }
        }
      } else if (
        fs.existsSync(path.join(UPLOADS_DIR, `${dbPost.slug}-${i}.webp`))
      ) {
        totalSkipped++
      } else {
        totalFailed++
      }

      // Delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('Summary')
  console.log('='.repeat(80))
  console.log(`Legacy posts found: ${legacyPosts.length}`)
  console.log(`Database posts: ${dbPosts.length}`)
  console.log(`Matched: ${matches.length}`)
  console.log(`Downloaded: ${totalDownloaded}`)
  console.log(`Skipped (exist): ${totalSkipped}`)
  console.log(`Failed: ${totalFailed}`)

  // List unmatched posts
  const unmatchedDb = dbPosts.filter(
    (db) => !matches.find((m) => m.dbPost.id === db.id)
  )
  if (unmatchedDb.length > 0) {
    console.log(`\nUnmatched DB posts (${unmatchedDb.length}):`)
    for (const post of unmatchedDb.slice(0, 20)) {
      console.log(`  - ${post.title} (${post.slug})`)
    }
    if (unmatchedDb.length > 20) {
      console.log(`  ... and ${unmatchedDb.length - 20} more`)
    }
  }

  // List legacy posts
  console.log(`\nLegacy posts found:`)
  for (const post of legacyPosts) {
    console.log(`  - ${post.title} (${post.slug})`)
  }
}

main()
  .then(() => {
    console.log('\n✓ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error)
    process.exit(1)
  })
