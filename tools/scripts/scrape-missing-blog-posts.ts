// ABOUTME: Scrapes blog posts from legacy site that don't exist in database
// ABOUTME: Creates new BlogPost records and downloads their gallery images
// @ts-nocheck

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

interface ScrapedPost {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  coverImageUrl: string | null
  galleryImageUrls: string[]
  publishedAt: Date
}

async function crawlBlogIndex(): Promise<LegacyPost[]> {
  const posts: LegacyPost[] = []
  let offset: string | null = null
  let pageNum = 0

  console.log('Crawling legacy blog index...')

  while (true) {
    pageNum++
    const url = offset
      ? `${LEGACY_BASE_URL}/blog?offset=${offset}`
      : `${LEGACY_BASE_URL}/blog`

    console.log(`  Page ${pageNum}: ${url}`)

    try {
      const response = await axios.get(url, { timeout: 30000 })
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

      // Also try summary blocks
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
          await new Promise((resolve) => setTimeout(resolve, 500))
          continue
        }
      }

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

async function scrapePostDetails(postUrl: string): Promise<ScrapedPost | null> {
  try {
    const response = await axios.get(postUrl, { timeout: 30000 })
    const $ = cheerio.load(response.data)

    // Extract title
    const title =
      $('h1.entry-title, h1.BlogItem-title, article h1')
        .first()
        .text()
        .trim() ||
      $('meta[property="og:title"]').attr('content') ||
      ''

    // Extract slug from URL
    const slug = postUrl
      .replace(`${LEGACY_BASE_URL}/blog/`, '')
      .replace(/\/$/, '')
      .replace(/\//g, '-')

    // Extract content
    const contentEl = $(
      '.entry-content, .BlogItem-body, article .sqs-block-content'
    )
    let content = ''
    contentEl.find('p').each((_, el) => {
      const text = $(el).text().trim()
      if (text && !text.includes('squarespace')) {
        content += text + '\n\n'
      }
    })
    content = content.trim() || 'Photography session gallery.'

    // Extract excerpt (first paragraph or meta description)
    const excerpt =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      content.split('\n')[0].substring(0, 200) ||
      'Photography session gallery.'

    // Extract category from title (e.g., "Family // Title" -> "Family")
    let category = 'Lifestyle'
    const categoryMatch = title.match(/^([^\/]+)\s*\/\//)
    if (categoryMatch) {
      category = categoryMatch[1].trim()
    }

    // Extract publish date
    const dateStr =
      $('time').attr('datetime') ||
      $('meta[property="article:published_time"]').attr('content')
    const publishedAt = dateStr ? new Date(dateStr) : new Date()

    // Extract images
    const images: string[] = []
    const seen = new Set<string>()

    $('img').each((_, el) => {
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

    return {
      title: title || slug,
      slug,
      content,
      excerpt,
      category,
      coverImageUrl: images[0] || null,
      galleryImageUrls: images.slice(1),
      publishedAt,
    }
  } catch (error) {
    console.error(
      `  Failed to scrape post: ${error instanceof Error ? error.message : error}`
    )
    return null
  }
}

async function downloadAndProcessImage(
  imageUrl: string,
  postSlug: string,
  index: number
): Promise<{ url: string; width: number; height: number } | null> {
  const filename = `${postSlug}-${index}.webp`
  const filepath = path.join(UPLOADS_DIR, filename)

  if (fs.existsSync(filepath)) {
    console.log(`    ✓ Already exists: ${filename}`)
    const metadata = await sharp(filepath).metadata()
    return {
      url: `/uploads/blog/${filename}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  }

  try {
    console.log(`    Downloading: ${imageUrl.substring(0, 80)}...`)

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    const buffer = Buffer.from(response.data)

    const processed = await sharp(buffer)
      .resize(1800, 1800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer()

    const metadata = await sharp(processed).metadata()

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
      `    ✗ Failed: ${error instanceof Error ? error.message : error}`
    )
    return null
  }
}

function normalizeTitle(title: string): string {
  const withoutPrefix = title.replace(/^[^\/]+\/\/\s*/, '')
  return withoutPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function main() {
  console.log('='.repeat(80))
  console.log('Scraping Missing Blog Posts')
  console.log('='.repeat(80))

  // Step 1: Crawl legacy blog
  const legacyPosts = await crawlBlogIndex()
  console.log(`\nFound ${legacyPosts.length} posts on legacy site`)

  // Step 2: Get existing database posts
  const dbPosts = await prisma.blogPost.findMany({
    select: { slug: true, title: true },
  })
  console.log(`Database has ${dbPosts.length} posts`)

  // Step 3: Find posts that don't exist in DB
  const missingPosts: LegacyPost[] = []

  for (const legacyPost of legacyPosts) {
    // Try exact slug match
    let found = dbPosts.find((db) => db.slug === legacyPost.slug)

    // Try normalized title match
    if (!found) {
      const normalizedLegacyTitle = normalizeTitle(legacyPost.title)
      found = dbPosts.find((db) => {
        const normalizedDbTitle = normalizeTitle(db.title)
        return (
          normalizedLegacyTitle === normalizedDbTitle ||
          normalizedLegacyTitle.includes(normalizedDbTitle) ||
          normalizedDbTitle.includes(normalizedLegacyTitle)
        )
      })
    }

    if (!found) {
      missingPosts.push(legacyPost)
    }
  }

  console.log(`\nMissing posts: ${missingPosts.length}`)
  for (const post of missingPosts) {
    console.log(`  - ${post.title} (${post.slug})`)
  }

  if (missingPosts.length === 0) {
    console.log('\nNo missing posts to scrape!')
    return
  }

  // Step 4: Scrape and create missing posts
  console.log('\n' + '='.repeat(80))
  console.log('Scraping missing posts...')
  console.log('='.repeat(80))

  let created = 0
  let failed = 0

  for (const legacyPost of missingPosts) {
    console.log(`\n${legacyPost.title}`)
    console.log(`  URL: ${legacyPost.url}`)

    const postDetails = await scrapePostDetails(legacyPost.url)
    if (!postDetails) {
      console.log(`  ✗ Failed to scrape`)
      failed++
      continue
    }

    console.log(`  Category: ${postDetails.category}`)
    console.log(
      `  Images: ${postDetails.galleryImageUrls.length + (postDetails.coverImageUrl ? 1 : 0)}`
    )

    // Download cover image
    let coverImageUrl = '/uploads/blog/default-cover.webp'
    if (postDetails.coverImageUrl) {
      const coverResult = await downloadAndProcessImage(
        postDetails.coverImageUrl,
        postDetails.slug,
        0
      )
      if (coverResult) {
        coverImageUrl = coverResult.url
      }
    }

    // Find or create category
    const categorySlug = postDetails.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
    let category = await prisma.blogCategory.findUnique({
      where: { slug: categorySlug },
    })
    if (!category) {
      category = await prisma.blogCategory.create({
        data: {
          name: postDetails.category,
          slug: categorySlug,
        },
      })
      console.log(`  Created category: ${postDetails.category}`)
    }

    // Create blog post with category relationship
    const newPost = await prisma.blogPost.create({
      data: {
        title: postDetails.title,
        slug: postDetails.slug,
        content: postDetails.content,
        excerpt: postDetails.excerpt,
        coverImage: coverImageUrl,
        published: true,
        publishedAt: postDetails.publishedAt,
        categories: {
          create: {
            categoryId: category.id,
          },
        },
      },
    })

    console.log(`  ✓ Created post: ${newPost.id}`)

    // Download and create gallery images
    for (let i = 0; i < postDetails.galleryImageUrls.length; i++) {
      const result = await downloadAndProcessImage(
        postDetails.galleryImageUrls[i],
        postDetails.slug,
        i + 1
      )

      if (result) {
        await prisma.blogPostImage.create({
          data: {
            postId: newPost.id,
            url: result.url,
            width: result.width,
            height: result.height,
            sortOrder: i,
          },
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    created++
  }

  console.log('\n' + '='.repeat(80))
  console.log('Summary')
  console.log('='.repeat(80))
  console.log(`Created: ${created}`)
  console.log(`Failed: ${failed}`)
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
