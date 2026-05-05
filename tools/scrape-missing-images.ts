// ABOUTME: Scrapes missing images from legacy site galleries
// ABOUTME: Only downloads images that don't already exist in the database

import { prisma } from '../lib/prisma'
import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

const BASE_URL = 'https://www.ashleypetersenphoto.com'

const GALLERIES = [
  { path: '/animals', slug: 'animals' },
  { path: '/animals-and-people', slug: 'animals-and-people' },
  { path: '/boudoir', slug: 'boudoir' },
  { path: '/lifestylebranding', slug: 'lifestyle-branding' },
  { path: '/headshots', slug: 'headshots' },
  { path: '/fantasy', slug: 'fantasy' },
  { path: '/lifestyle-portraiture', slug: 'lifestyle-portraiture' },
  { path: '/travel', slug: 'travel' },
  { path: '/yogadance', slug: 'yoga-dance' },
  { path: '/underwater', slug: 'underwater' },
  { path: '/rescuetales', slug: 'rescue-tales' },
]

const DOWNLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'scraped')
const DELAY_MS = 1000

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/-+/g, '-').toLowerCase()
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  })
  fs.writeFileSync(filepath, response.data)
}

async function processImage(inputPath: string, outputPath: string): Promise<{ width: number; height: number }> {
  const buffer = fs.readFileSync(inputPath)
  const metadata = await sharp(buffer).metadata()

  const processed = await sharp(buffer)
    .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  fs.writeFileSync(outputPath, processed)

  const finalMetadata = await sharp(processed).metadata()

  return {
    width: finalMetadata.width || metadata.width || 0,
    height: finalMetadata.height || metadata.height || 0,
  }
}

async function scrapeGalleryImages(galleryPath: string): Promise<string[]> {
  const url = `${BASE_URL}${galleryPath}`
  console.log(`\nScraping: ${url}`)

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  })

  const $ = cheerio.load(response.data)
  const imageUrls: string[] = []

  // Squarespace lazy-loaded images use data-src attribute
  $('img[data-src]').each((_, element) => {
    const $img = $(element)
    let src = $img.attr('data-src')

    if (src) {
      // Convert to full URL
      if (src.startsWith('//')) {
        src = `https:${src}`
      } else if (src.startsWith('/')) {
        src = `${BASE_URL}${src}`
      }

      // Remove query parameters like ?format=1000w
      src = src.split('?')[0]

      // Skip duplicates
      if (!imageUrls.includes(src)) {
        imageUrls.push(src)
      }
    }
  })

  // Also check regular src attributes
  $('img[src]').each((_, element) => {
    const $img = $(element)
    let src = $img.attr('src')

    if (src && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp'))) {
      if (src.startsWith('//')) {
        src = `https:${src}`
      } else if (src.startsWith('/')) {
        src = `${BASE_URL}${src}`
      }

      src = src.split('?')[0]

      if (!imageUrls.includes(src)) {
        imageUrls.push(src)
      }
    }
  })

  console.log(`  Found ${imageUrls.length} images`)
  return imageUrls
}

async function scrapeMissingImages() {
  console.log('Scraping missing images from legacy site...\n')
  console.log('='.repeat(60))

  for (const gallery of GALLERIES) {
    console.log(`\n\n📸 Gallery: ${gallery.slug}`)
    console.log('─'.repeat(60))

    // Get existing gallery from database
    const dbGallery = await prisma.gallery.findUnique({
      where: { slug: gallery.slug },
      include: {
        images: {
          select: { url: true }
        },
        _count: {
          select: { images: true }
        }
      }
    })

    if (!dbGallery) {
      console.log('  ⚠️  Gallery not found in database, skipping...')
      continue
    }

    console.log(`  Current images in database: ${dbGallery._count.images}`)

    // Scrape image URLs from legacy site
    const imageUrls = await scrapeGalleryImages(gallery.path)

    if (imageUrls.length === 0) {
      console.log('  ⚠️  No images found on legacy site')
      continue
    }

    console.log(`  Images on legacy site: ${imageUrls.length}`)

    const existingCount = dbGallery.images.length
    const toDownload = imageUrls.length - existingCount

    if (toDownload <= 0) {
      console.log('  ✓ All images already downloaded')
      continue
    }

    console.log(`  Need to download: ${toDownload} images`)

    // Download missing images (skip the first N that we already have)
    const startIndex = existingCount

    for (let i = startIndex; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i]
      const urlParts = imageUrl.split('/')
      const originalFilename = urlParts[urlParts.length - 1].split('?')[0]

      const timestamp = Date.now()
      const sanitized = sanitizeFilename(originalFilename)
      const tempFilename = `temp-${timestamp}-${i}-${sanitized}`
      const finalFilename = `${timestamp}-${i}-${gallery.slug}.webp`

      const tempPath = path.join(DOWNLOAD_DIR, tempFilename)
      const finalPath = path.join(DOWNLOAD_DIR, finalFilename)

      try {
        console.log(`  [${i - startIndex + 1}/${toDownload}] Downloading...`)
        await downloadImage(imageUrl, tempPath)

        console.log(`    Processing...`)
        const { width, height } = await processImage(tempPath, finalPath)

        fs.unlinkSync(tempPath)

        const dbPath = `/uploads/scraped/${finalFilename}`
        await prisma.image.create({
          data: {
            url: dbPath,
            publicId: finalFilename,
            width,
            height,
            altText: `${dbGallery.title} - Image ${i + 1}`,
            sortOrder: i,
            galleryId: dbGallery.id,
          },
        })

        console.log(`    ✓ Saved to database`)

        await delay(DELAY_MS)
      } catch (error) {
        console.error(`    ✗ Failed:`, error instanceof Error ? error.message : error)
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath)
        }
        continue
      }
    }

    console.log(`\n  ✅ Completed: ${dbGallery.title}`)
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('✨ Scraping complete!')
  console.log('='.repeat(60))
}

scrapeMissingImages()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    return prisma.$disconnect().then(() => process.exit(1))
  })
