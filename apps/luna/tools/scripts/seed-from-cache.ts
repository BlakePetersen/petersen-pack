// ABOUTME: Seeds database with gallery images from cached data
// ABOUTME: Copies pre-processed images from cache instead of re-downloading

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const CACHE_DIR = path.join(process.cwd(), 'prisma', 'seed-data')
const IMAGES_CACHE_DIR = path.join(CACHE_DIR, 'images')
const DOWNLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'scraped')
const DELAY_MS = 50 // Much faster now since we're just copying files

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

async function seedGalleryFromCache(gallerySlug: string, sortOrder: number) {
  const cacheFile = path.join(CACHE_DIR, `${gallerySlug}.json`)

  if (!fs.existsSync(cacheFile)) {
    console.log(`  ⚠️  No cache file found: ${gallerySlug}.json`)
    return
  }

  const galleryData: GalleryData = JSON.parse(
    fs.readFileSync(cacheFile, 'utf-8')
  )

  console.log(`\n📸 Gallery: ${galleryData.title}`)
  console.log('─'.repeat(60))
  console.log(`   Cached: ${new Date(galleryData.scrapedAt).toLocaleString()}`)
  console.log(`   Images: ${galleryData.images.length}`)

  // Create or find gallery in database
  let dbGallery
  try {
    dbGallery = await prisma.gallery.upsert({
      where: { slug: galleryData.slug },
      update: {
        title: galleryData.title,
        description: galleryData.description,
        featured: galleryData.featured,
        sortOrder,
      },
      create: {
        title: galleryData.title,
        slug: galleryData.slug,
        description: galleryData.description,
        featured: galleryData.featured,
        sortOrder,
      },
    })
    console.log(`   ✓ Gallery ready: ${dbGallery.id}`)
  } catch (error) {
    console.error(`   ✗ Failed to create gallery:`, error)
    return
  }

  // Check how many images already exist
  const existingImages = await prisma.image.count({
    where: { galleryId: dbGallery.id },
  })

  if (existingImages > 0) {
    console.log(
      `   ℹ️  Gallery already has ${existingImages} images, skipping download...`
    )
    return
  }

  // Copy images from cache
  console.log(`\n   Copying ${galleryData.images.length} images from cache...`)

  for (let i = 0; i < galleryData.images.length; i++) {
    const imageData = galleryData.images[i]
    const cachedPath = path.join(IMAGES_CACHE_DIR, imageData.cachedFilename)
    const finalFilename = `${Date.now()}-${i}-${galleryData.slug}.webp`
    const finalPath = path.join(DOWNLOAD_DIR, finalFilename)

    try {
      // Check if cached file exists
      if (!fs.existsSync(cachedPath)) {
        console.error(
          `      ✗ Cached file not found: ${imageData.cachedFilename}`
        )
        continue
      }

      // Copy from cache to uploads directory
      fs.copyFileSync(cachedPath, finalPath)

      // Save to database
      const dbPath = `/uploads/scraped/${finalFilename}`
      await prisma.image.create({
        data: {
          url: dbPath,
          publicId: finalFilename,
          width: imageData.width,
          height: imageData.height,
          altText: imageData.altText,
          sortOrder: i,
          galleryId: dbGallery.id,
        },
      })

      if ((i + 1) % 10 === 0 || i === galleryData.images.length - 1) {
        console.log(
          `      ✓ Copied ${i + 1}/${galleryData.images.length} images`
        )
      }

      await delay(DELAY_MS)
    } catch (error) {
      console.error(
        `      ✗ Failed to copy image ${i + 1}:`,
        error instanceof Error ? error.message : error
      )
      continue
    }
  }

  console.log(`\n   ✅ Completed gallery: ${galleryData.title}`)
}

async function seedAllFromCache() {
  console.log('Seeding database from cached gallery data...\n')
  console.log('='.repeat(60))

  // Check if index exists
  const indexFile = path.join(CACHE_DIR, 'galleries-index.json')
  if (!fs.existsSync(indexFile)) {
    console.error(
      '\n❌ No cache index found. Run cache-legacy-galleries.ts first!'
    )
    console.error(`   Expected: ${indexFile}`)
    process.exit(1)
  }

  const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'))
  console.log(`Found cache with ${index.totalGalleries} galleries`)
  console.log(`Cache created: ${new Date(index.cachedAt).toLocaleString()}`)
  console.log(`Total images in cache: ${index.totalImages}\n`)

  // Seed each gallery
  for (let i = 0; i < index.galleries.length; i++) {
    const gallerySlug = index.galleries[i]
    await seedGalleryFromCache(gallerySlug, i)
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('✨ Seeding complete!')
  console.log('='.repeat(60))
}

seedAllFromCache()
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
