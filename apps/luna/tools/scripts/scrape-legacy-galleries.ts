// ABOUTME: Script to scrape portfolio galleries from legacy ashleypetersenphoto.com site
// ABOUTME: Imports galleries with images into new database

import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const LEGACY_BASE_URL = 'https://www.ashleypetersenphoto.com'
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'galleries')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Map of legacy gallery URLs to metadata
const GALLERIES = [
  { path: '/animals', title: 'Animals', featured: true },
  { path: '/boudoir', title: 'Boudoir', featured: true },
  { path: '/lifestylebranding', title: 'Branding', featured: true },
  { path: '/headshots', title: 'Headshots', featured: true },
  { path: '/fantasy', title: 'Fantasy', featured: false },
  {
    path: '/lifestyle-portraiture',
    title: 'Portraits',
    featured: true,
  },
  { path: '/travel', title: 'Travel', featured: false },
  { path: '/yogadance', title: 'Yoga and Dance', featured: false },
  { path: '/underwater', title: 'Underwater', featured: true },
  { path: '/rescuetales', title: 'Rescue Tales', featured: false },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function downloadAndProcessImage(
  imageUrl: string,
  gallerySlug: string,
  index: number
): Promise<{ url: string; width: number; height: number } | null> {
  try {
    // Squarespace uses query params for image sizing, we want the original
    // Remove query params and get the full-size image
    const cleanUrl = imageUrl.split('?')[0]

    // Make URL absolute
    const absoluteUrl = cleanUrl.startsWith('http')
      ? cleanUrl
      : `${LEGACY_BASE_URL}${cleanUrl}`

    console.log(`  Downloading image ${index + 1}: ${absoluteUrl}`)

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
      .webp({ quality: 90 })
      .toBuffer()

    // Get metadata
    const metadata = await sharp(processed).metadata()

    // Save to uploads directory
    const filename = `${gallerySlug}-${index}.webp`
    const filepath = path.join(UPLOADS_DIR, filename)
    fs.writeFileSync(filepath, processed)

    return {
      url: `/uploads/galleries/${filename}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  } catch (error) {
    console.error(`  Failed to download image ${imageUrl}:`, error)
    return null
  }
}

async function scrapeGallery(
  galleryConfig: (typeof GALLERIES)[0],
  sortOrder: number
) {
  const { path: galleryPath, title, featured } = galleryConfig
  const galleryUrl = `${LEGACY_BASE_URL}${galleryPath}`
  const slug = slugify(title)

  console.log(`\nScraping gallery: ${title}`)
  console.log(`  URL: ${galleryUrl}`)

  try {
    // Check if gallery already exists
    const existing = await prisma.gallery.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { images: true },
        },
      },
    })

    if (existing && existing._count.images > 0) {
      console.log(
        `  ✓ Gallery already exists with ${existing._count.images} images, skipping`
      )
      return null
    }

    if (existing) {
      console.log(`  ⚠ Gallery exists but has no images, populating...`)
    }

    const response = await axios.get(galleryUrl, { timeout: 30000 })
    const $ = cheerio.load(response.data)

    // Extract all images from the gallery
    const images: string[] = []

    // Squarespace galleries typically use img tags with data-src or src
    $('img').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src')
      if (
        src &&
        !src.includes('data:image') &&
        !src.includes('logo') &&
        !src.includes('icon')
      ) {
        // Filter out tiny images (likely UI elements)
        const width = $(el).attr('width')
        const height = $(el).attr('height')
        if (!width || !height || parseInt(width) > 100) {
          images.push(src)
        }
      }
    })

    // Remove duplicates
    const uniqueImages = Array.from(new Set(images))
    console.log(`  Found ${uniqueImages.length} images`)

    if (uniqueImages.length === 0) {
      console.log(`  ⚠ No images found, skipping gallery`)
      return null
    }

    // Download and process images
    const processedImages = []
    for (let i = 0; i < uniqueImages.length; i++) {
      const processed = await downloadAndProcessImage(uniqueImages[i], slug, i)
      if (processed) {
        processedImages.push(processed)
      }
      // Delay to be respectful
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    if (processedImages.length === 0) {
      console.log(`  ⚠ No images successfully downloaded, skipping gallery`)
      return null
    }

    // Use first image as cover
    const coverImage = processedImages[0].url

    let gallery
    if (existing) {
      // Update existing gallery with images
      gallery = await prisma.gallery.update({
        where: { id: existing.id },
        data: {
          coverImage,
          images: {
            create: processedImages.map((img, idx) => ({
              url: img.url,
              width: img.width,
              height: img.height,
              sortOrder: idx,
            })),
          },
        },
      })
      console.log(
        `  ✓ Updated gallery: ${gallery.title} with ${processedImages.length} images`
      )
    } else {
      // Create new gallery with images
      gallery = await prisma.gallery.create({
        data: {
          title,
          slug,
          featured,
          sortOrder,
          coverImage,
          images: {
            create: processedImages.map((img, idx) => ({
              url: img.url,
              width: img.width,
              height: img.height,
              sortOrder: idx,
            })),
          },
        },
      })
      console.log(
        `  ✓ Created gallery: ${gallery.title} with ${processedImages.length} images`
      )
    }

    return gallery
  } catch (error) {
    console.error(`  ✗ Failed to scrape gallery:`, error)
    return null
  }
}

async function main() {
  console.log('Starting gallery scraping from ashleypetersenphoto.com')
  console.log('='.repeat(80))

  try {
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    let totalImages = 0

    for (let i = 0; i < GALLERIES.length; i++) {
      const result = await scrapeGallery(GALLERIES[i], i)

      if (result) {
        successCount++
        const imageCount = await prisma.image.count({
          where: { galleryId: result.id },
        })
        totalImages += imageCount
      } else if (result === null) {
        skipCount++
      } else {
        errorCount++
      }

      // Delay between galleries to be respectful
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    console.log('\n' + '='.repeat(80))
    console.log('Gallery scraping complete!')
    console.log(`✓ Successfully imported: ${successCount} galleries`)
    console.log(`⊘ Skipped (already exist): ${skipCount} galleries`)
    console.log(`✗ Errors: ${errorCount} galleries`)
    console.log(`📷 Total images imported: ${totalImages}`)

    // Show summary
    const galleries = await prisma.gallery.findMany({
      include: {
        _count: {
          select: { images: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    console.log('\nGalleries in database:')
    for (const gallery of galleries) {
      console.log(
        `  ${gallery.title}: ${gallery._count.images} images${gallery.featured ? ' (featured)' : ''}`
      )
    }

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
