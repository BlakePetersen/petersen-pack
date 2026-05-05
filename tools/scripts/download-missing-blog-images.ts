// ABOUTME: Script to download missing blog gallery images from legacy site
// ABOUTME: Re-downloads images that exist in DB but are missing from filesystem

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
  const filename = `${postSlug}-${index}.webp`
  const filepath = path.join(UPLOADS_DIR, filename)

  // Skip if already exists
  if (fs.existsSync(filepath)) {
    console.log(`    ✓ Already exists: ${filename}`)
    return null
  }

  try {
    // Make URL absolute
    const absoluteUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${LEGACY_BASE_URL}${imageUrl}`

    console.log(`    Downloading: ${absoluteUrl}`)

    const response = await axios.get(absoluteUrl, {
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
      `    ✗ Failed: ${imageUrl}`,
      error instanceof Error ? error.message : error
    )
    return null
  }
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

async function main() {
  console.log('Downloading missing blog gallery images')
  console.log('='.repeat(80))

  // Get all blog posts
  const posts = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      images: {
        select: { url: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  console.log(`\nFound ${posts.length} blog posts`)

  let totalDownloaded = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const post of posts) {
    console.log(`\n${post.title}`)

    // Check which images are missing from disk
    const existingFiles = new Set(fs.readdirSync(UPLOADS_DIR))
    const expectedFiles = Array.from(
      { length: 20 },
      (_, i) => `${post.slug}-${i}.webp`
    )
    const missingIndexes = expectedFiles
      .filter((f) => !existingFiles.has(f))
      .map((f) => {
        const match = f.match(/-(\d+)\.webp$/)
        return match ? parseInt(match[1], 10) : -1
      })
      .filter((i) => i >= 0)

    // Check if cover image exists
    const hasCover = existingFiles.has(`${post.slug}-0.webp`)
    if (!hasCover) {
      console.log(
        `  Missing cover and gallery images, fetching from legacy site...`
      )
    } else if (missingIndexes.length > 0) {
      console.log(`  Missing gallery images: ${missingIndexes.join(', ')}`)
    } else {
      console.log(`  ✓ All images present`)
      continue
    }

    // Fetch images from legacy site
    const legacyUrl = `${LEGACY_BASE_URL}/blog/${post.slug.replace(/-/g, '-')}`
    // Try to find by title instead
    const searchUrl = `${LEGACY_BASE_URL}/?s=${encodeURIComponent(post.title.split('//')[0].trim())}`

    // First try direct URL construction based on known patterns
    const possibleUrls = [
      `${LEGACY_BASE_URL}/${post.slug}/`,
      `${LEGACY_BASE_URL}/blog/${post.slug}/`,
    ]

    let imageUrls: string[] = []
    for (const url of possibleUrls) {
      imageUrls = await scrapeImagesFromPost(url)
      if (imageUrls.length > 0) {
        console.log(`  Found ${imageUrls.length} images at ${url}`)
        break
      }
    }

    if (imageUrls.length === 0) {
      console.log(`  ⚠ No images found on legacy site`)
      continue
    }

    // Download missing images
    for (let i = 0; i < imageUrls.length; i++) {
      const result = await downloadAndProcessImage(imageUrls[i], post.slug, i)
      if (result) {
        totalDownloaded++

        // Update database if this is a gallery image (not cover)
        if (i > 0) {
          const existingImage = await prisma.blogPostImage.findFirst({
            where: {
              postId: post.id,
              url: result.url,
            },
          })

          if (!existingImage) {
            await prisma.blogPostImage.create({
              data: {
                postId: post.id,
                url: result.url,
                width: result.width,
                height: result.height,
                sortOrder: i - 1,
              },
            })
          }
        }
      } else if (
        fs.existsSync(path.join(UPLOADS_DIR, `${post.slug}-${i}.webp`))
      ) {
        totalSkipped++
      } else {
        totalFailed++
      }

      // Delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('Download complete!')
  console.log(`✓ Downloaded: ${totalDownloaded}`)
  console.log(`⊘ Skipped (exist): ${totalSkipped}`)
  console.log(`✗ Failed: ${totalFailed}`)

  // Show final stats
  const files = fs.readdirSync(UPLOADS_DIR)
  const totalSize = files.reduce((acc, file) => {
    const stats = fs.statSync(path.join(UPLOADS_DIR, file))
    return acc + stats.size
  }, 0)

  console.log(`\nBlog images folder:`)
  console.log(`  Files: ${files.length}`)
  console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
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
