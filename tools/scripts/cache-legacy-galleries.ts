// ABOUTME: Scrapes gallery metadata from legacy site and caches to JSON
// ABOUTME: Run once to capture legacy data, then seed from cache instead of re-scraping

import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

const BASE_URL = 'https://www.ashleypetersenphoto.com'
const CACHE_DIR = path.join(process.cwd(), 'prisma', 'seed-data')
const IMAGES_CACHE_DIR = path.join(CACHE_DIR, 'images')

const GALLERIES = [
  {
    path: '/animals',
    title: 'Animals',
    slug: 'animals',
    description:
      'Professional animal photography capturing the personality and spirit of your pets',
  },
  {
    path: '/boudoir',
    title: 'Boudoir',
    slug: 'boudoir',
    description: 'Elegant and empowering boudoir photography',
  },
  {
    path: '/lifestylebranding',
    title: 'Branding',
    slug: 'branding',
    description:
      'Professional branding and lifestyle photography for businesses',
  },
  {
    path: '/headshots',
    title: 'Headshots',
    slug: 'headshots',
    description:
      'Professional headshots for actors, corporate professionals, and LinkedIn profiles',
  },
  {
    path: '/fantasy',
    title: 'Fantasy',
    slug: 'fantasy',
    description:
      'Creative and fantastical photography bringing imagination to life',
  },
  {
    path: '/lifestyle-portraiture',
    title: 'Portraits',
    slug: 'lifestyle-portraiture',
    description:
      'Natural, authentic lifestyle portraits and family photography',
  },
  {
    path: '/travel',
    title: 'Travel',
    slug: 'travel',
    description: 'Travel photography capturing destinations and adventures',
  },
  {
    path: '/yogadance',
    title: 'Yoga & Dance',
    slug: 'yoga-dance',
    description: 'Dynamic photography of yoga practice and dance movement',
  },
  {
    path: '/underwater',
    title: 'Underwater',
    slug: 'underwater',
    description: 'Unique underwater photography sessions',
  },
  {
    path: '/rescuetales',
    title: 'Rescue Tales',
    slug: 'rescue-tales',
    description: 'Special project featuring rescue animals and their stories',
  },
]

const DELAY_MS = 1000

// Ensure cache directories exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}
if (!fs.existsSync(IMAGES_CACHE_DIR)) {
  fs.mkdirSync(IMAGES_CACHE_DIR, { recursive: true })
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

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
  } catch (error) {
    console.error(
      `      ✗ Failed to download ${url}:`,
      error instanceof Error ? error.message : error
    )
    throw error
  }
}

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
      `      ✗ Failed to process ${inputPath}:`,
      error instanceof Error ? error.message : error
    )
    throw error
  }
}

interface ImageData {
  url: string
  altText: string
  width: number
  height: number
  cachedFilename: string
}

interface GalleryData {
  title: string
  slug: string
  description: string
  featured: boolean
  images: ImageData[]
  scrapedAt: string
}

async function scrapeGalleryImages(galleryPath: string): Promise<string[]> {
  const url = `${BASE_URL}${galleryPath}`
  console.log(`\nScraping: ${url}`)

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 30000,
    })

    const $ = cheerio.load(response.data)
    const imageUrls: string[] = []

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

          if ((width > 0 && width < 200) || (height > 0 && height < 200)) {
            return
          }

          if (!imageUrls.includes(src)) {
            imageUrls.push(src)
          }
        }
      })
    })

    // Check srcset
    $('[srcset], [data-srcset]').each((_, element) => {
      const srcset = $(element).attr('srcset') || $(element).attr('data-srcset')
      if (srcset) {
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

async function cacheAllGalleries() {
  console.log('Starting cache of legacy gallery data...\n')
  console.log('='.repeat(60))

  const allData: Record<string, GalleryData> = {}

  for (const gallery of GALLERIES) {
    console.log(`\n📸 Gallery: ${gallery.title}`)
    console.log('─'.repeat(60))

    const imageUrls = await scrapeGalleryImages(gallery.path)

    if (imageUrls.length === 0) {
      console.log('  ⚠️  No images found, skipping...')
      continue
    }

    // Download and process images
    console.log(`\n  Downloading and processing ${imageUrls.length} images...`)
    const images: ImageData[] = []

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i]
      const urlParts = imageUrl.split('/')
      const originalFilename = urlParts[urlParts.length - 1].split('?')[0]

      const timestamp = Date.now()
      const sanitized = sanitizeFilename(originalFilename)
      const tempFilename = `temp-${timestamp}-${i}-${sanitized}`
      const cachedFilename = `${gallery.slug}-${i}.webp`

      const tempPath = path.join(IMAGES_CACHE_DIR, tempFilename)
      const cachedPath = path.join(IMAGES_CACHE_DIR, cachedFilename)

      try {
        console.log(`    [${i + 1}/${imageUrls.length}] ${originalFilename}`)

        // Download
        await downloadImage(imageUrl, tempPath)

        // Process to WebP
        const { width, height } = await processImage(tempPath, cachedPath)

        // Delete temp file
        fs.unlinkSync(tempPath)

        images.push({
          url: imageUrl,
          altText: `${gallery.title} - Image ${i + 1}`,
          width,
          height,
          cachedFilename,
        })

        console.log(`      ✓ Cached: ${cachedFilename}`)

        await delay(DELAY_MS)
      } catch (error) {
        console.error(
          `      ✗ Failed: ${error instanceof Error ? error.message : error}`
        )
        // Clean up temp file if it exists
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath)
        }
        continue
      }
    }

    const galleryData: GalleryData = {
      title: gallery.title,
      slug: gallery.slug,
      description: gallery.description,
      featured: false,
      images,
      scrapedAt: new Date().toISOString(),
    }

    allData[gallery.slug] = galleryData

    // Save individual gallery file
    const galleryFile = path.join(CACHE_DIR, `${gallery.slug}.json`)
    fs.writeFileSync(galleryFile, JSON.stringify(galleryData, null, 2))
    console.log(`\n  ✓ Cached ${images.length} images to: ${gallery.slug}.json`)
  }

  // Save combined index file
  const indexFile = path.join(CACHE_DIR, 'galleries-index.json')
  fs.writeFileSync(
    indexFile,
    JSON.stringify(
      {
        galleries: Object.keys(allData),
        cachedAt: new Date().toISOString(),
        totalGalleries: Object.keys(allData).length,
        totalImages: Object.values(allData).reduce(
          (sum, g) => sum + g.images.length,
          0
        ),
      },
      null,
      2
    )
  )

  console.log('\n\n' + '='.repeat(60))
  console.log('✨ Caching complete!')
  console.log(`   Cached ${Object.keys(allData).length} galleries`)
  console.log(
    `   Total images: ${Object.values(allData).reduce((sum, g) => sum + g.images.length, 0)}`
  )
  console.log(`   Location: ${CACHE_DIR}`)
  console.log('='.repeat(60))
}

cacheAllGalleries()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
