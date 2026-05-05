// ABOUTME: Scrapes all images from the legacy Ashley Petersen Photography website
// ABOUTME: Downloads images and creates corresponding galleries in Luna database

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

const prisma = new PrismaClient()

const BASE_URL = 'https://www.ashleypetersenphoto.com'

// Gallery sections from the legacy site
const GALLERIES = [
  { path: '/animals', title: 'Animals', slug: 'animals' },
  {
    path: '/animals-and-people',
    title: 'Animals and People',
    slug: 'animals-and-people',
  },
  { path: '/boudoir', title: 'Boudoir', slug: 'boudoir' },
  {
    path: '/lifestylebranding',
    title: 'Lifestyle Branding',
    slug: 'lifestyle-branding',
  },
  { path: '/headshots', title: 'Headshots', slug: 'headshots' },
  { path: '/fantasy', title: 'Fantasy', slug: 'fantasy' },
  {
    path: '/lifestyle-portraiture',
    title: 'Lifestyle Portraiture',
    slug: 'lifestyle-portraiture',
  },
  { path: '/travel', title: 'Travel', slug: 'travel' },
  { path: '/yogadance', title: 'Yoga and Dance', slug: 'yoga-dance' },
  { path: '/underwater', title: 'Underwater', slug: 'underwater' },
  { path: '/rescuetales', title: 'Rescue Tales', slug: 'rescue-tales' },
]

const DOWNLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'scraped')
const DELAY_MS = 1000 // Delay between requests to be respectful

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
}

// Helper: Delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper: Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

// Helper: Download image
async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    fs.writeFileSync(filepath, response.data)
    console.log(`  ✓ Downloaded: ${path.basename(filepath)}`)
  } catch (error) {
    console.error(
      `  ✗ Failed to download ${url}:`,
      error instanceof Error ? error.message : error
    )
    throw error
  }
}

// Helper: Process and optimize image with Sharp
async function processImage(
  inputPath: string,
  outputPath: string
): Promise<{ width: number; height: number }> {
  try {
    const buffer = fs.readFileSync(inputPath)
    const metadata = await sharp(buffer).metadata()

    const processed = await sharp(buffer)
      .resize(2400, 2400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer()

    fs.writeFileSync(outputPath, processed)

    const finalMetadata = await sharp(processed).metadata()

    return {
      width: finalMetadata.width || metadata.width || 0,
      height: finalMetadata.height || metadata.height || 0,
    }
  } catch (error) {
    console.error(
      `  ✗ Failed to process ${inputPath}:`,
      error instanceof Error ? error.message : error
    )
    throw error
  }
}

// Scrape images from a gallery page
async function scrapeGalleryImages(galleryPath: string): Promise<string[]> {
  const url = `${BASE_URL}${galleryPath}`
  console.log(`\nScraping: ${url}`)

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    const $ = cheerio.load(response.data)
    const imageUrls: string[] = []

    // Look for various image selectors commonly used in gallery sites
    const selectors = [
      'img[src*=".jpg"]',
      'img[src*=".jpeg"]',
      'img[src*=".png"]',
      'img[src*=".webp"]',
      'img[data-src]',
      'img[data-original]',
      'a[href*=".jpg"] img',
      'a[href*=".jpeg"] img',
      '.gallery img',
      '.portfolio img',
      '[class*="image"] img',
    ]

    selectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const $img = $(element)
        let src =
          $img.attr('src') ||
          $img.attr('data-src') ||
          $img.attr('data-original')

        if (src) {
          // Handle relative URLs
          if (src.startsWith('/')) {
            src = `${BASE_URL}${src}`
          } else if (!src.startsWith('http')) {
            src = `${BASE_URL}/${src}`
          }

          // Filter out tiny images (thumbnails, icons, etc.)
          const width = parseInt($img.attr('width') || '0')
          const height = parseInt($img.attr('height') || '0')

          // Skip if clearly a thumbnail or too small
          if ((width > 0 && width < 200) || (height > 0 && height < 200)) {
            return
          }

          // Skip if already in list
          if (!imageUrls.includes(src)) {
            imageUrls.push(src)
          }
        }
      })
    })

    // Also check for background images in srcset or data attributes
    $('[srcset], [data-srcset]').each((_, element) => {
      const srcset = $(element).attr('srcset') || $(element).attr('data-srcset')
      if (srcset) {
        // Parse srcset and get the largest image
        const sources = srcset.split(',').map((s) => s.trim().split(' ')[0])
        sources.forEach((src) => {
          if (src && !imageUrls.includes(src)) {
            if (src.startsWith('/')) {
              imageUrls.push(`${BASE_URL}${src}`)
            } else if (!src.startsWith('http')) {
              imageUrls.push(`${BASE_URL}/${src}`)
            } else {
              imageUrls.push(src)
            }
          }
        })
      }
    })

    console.log(`  Found ${imageUrls.length} images`)
    return imageUrls
  } catch (error) {
    console.error(
      `Failed to scrape ${url}:`,
      error instanceof Error ? error.message : error
    )
    return []
  }
}

// Main scraping function
async function scrapeAllGalleries() {
  console.log('Starting image scraping from legacy site...\n')
  console.log('='.repeat(60))

  for (const gallery of GALLERIES) {
    console.log(`\n\n📸 Gallery: ${gallery.title}`)
    console.log('─'.repeat(60))

    // Scrape image URLs
    const imageUrls = await scrapeGalleryImages(gallery.path)

    if (imageUrls.length === 0) {
      console.log('  ⚠️  No images found, skipping...')
      continue
    }

    // Create gallery in database
    console.log(`\n  Creating gallery in database...`)
    let dbGallery
    try {
      dbGallery = await prisma.gallery.create({
        data: {
          title: gallery.title,
          slug: gallery.slug,
          description: `Gallery imported from legacy site: ${gallery.title}`,
          featured: false,
          sortOrder: 0,
        },
      })
      console.log(`  ✓ Gallery created: ${dbGallery.id}`)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint')
      ) {
        console.log(`  ℹ️  Gallery already exists, fetching...`)
        dbGallery = await prisma.gallery.findUnique({
          where: { slug: gallery.slug },
        })
        if (!dbGallery) {
          console.error(`  ✗ Could not find or create gallery`)
          continue
        }
      } else {
        console.error(`  ✗ Failed to create gallery:`, error)
        continue
      }
    }

    // Download and process images
    console.log(`\n  Downloading and processing ${imageUrls.length} images...`)

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i]
      const urlParts = imageUrl.split('/')
      const originalFilename = urlParts[urlParts.length - 1].split('?')[0]

      // Create unique filename
      const timestamp = Date.now()
      const sanitized = sanitizeFilename(originalFilename)
      const tempFilename = `temp-${timestamp}-${i}-${sanitized}`
      const finalFilename = `${timestamp}-${i}-${gallery.slug}.webp`

      const tempPath = path.join(DOWNLOAD_DIR, tempFilename)
      const finalPath = path.join(DOWNLOAD_DIR, finalFilename)

      try {
        // Download original
        await downloadImage(imageUrl, tempPath)

        // Process with Sharp
        console.log(`    Processing...`)
        const { width, height } = await processImage(tempPath, finalPath)

        // Delete temp file
        fs.unlinkSync(tempPath)

        // Save to database
        const dbPath = `/uploads/scraped/${finalFilename}`
        await prisma.image.create({
          data: {
            url: dbPath,
            publicId: finalFilename,
            width,
            height,
            altText: `${gallery.title} - Image ${i + 1}`,
            sortOrder: i,
            galleryId: dbGallery.id,
          },
        })

        console.log(`    ✓ Processed and saved to database`)

        // Respectful delay
        await delay(DELAY_MS)
      } catch (error) {
        console.error(
          `    ✗ Failed to process image ${i + 1}:`,
          error instanceof Error ? error.message : error
        )
        // Clean up temp file if it exists
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath)
        }
        // Continue with next image
        continue
      }
    }

    console.log(`\n  ✅ Completed gallery: ${gallery.title}`)
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('✨ Scraping complete!')
  console.log('='.repeat(60))
}

// Run the scraper
scrapeAllGalleries()
  .then(() => {
    console.log('\nDisconnecting from database...')
    return prisma.$disconnect()
  })
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    return prisma.$disconnect().then(() => {
      process.exit(1)
    })
  })
