// ABOUTME: Script to optimize all images in the database
// ABOUTME: Re-processes images with better compression and modern formats

import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

const PUBLIC_DIR = path.join(process.cwd(), 'public')

async function optimizeImages() {
  console.log('Starting image optimization...\n')
  console.log('='.repeat(60))

  // Get all images from database
  const images = await prisma.image.findMany({
    include: {
      gallery: {
        select: {
          title: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  console.log(`\nFound ${images.length} images to optimize\n`)

  let optimized = 0
  let skipped = 0
  let failed = 0
  let totalSavings = 0

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const imagePath = path.join(PUBLIC_DIR, image.url)

    console.log(`[${i + 1}/${images.length}] Processing: ${path.basename(image.url)}`)
    console.log(`  Gallery: ${image.gallery?.title || 'Unknown'}`)

    if (!fs.existsSync(imagePath)) {
      console.log(`  ⚠️  File not found, skipping...`)
      skipped++
      continue
    }

    try {
      // Get original file size
      const originalStats = fs.statSync(imagePath)
      const originalSize = originalStats.size

      // Read and optimize the image
      const buffer = fs.readFileSync(imagePath)
      const metadata = await sharp(buffer).metadata()

      // Determine optimal size - keep originals under 2400px wide
      let width = metadata.width || 2400
      let height = metadata.height || 2400

      if (width > 2400 || height > 2400) {
        console.log(`  Resizing from ${width}x${height}`)
      }

      // Optimize with Sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(2400, 2400, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
          effort: 6 // Higher effort = better compression (0-6)
        })
        .toBuffer()

      // Get new metadata
      const newMetadata = await sharp(optimizedBuffer).metadata()

      // Create backup of original if it's not already a webp
      if (!imagePath.endsWith('.webp')) {
        const backupPath = imagePath + '.backup'
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(imagePath, backupPath)
        }
      }

      // Write optimized image
      fs.writeFileSync(imagePath, optimizedBuffer)

      // Get new file size
      const newStats = fs.statSync(imagePath)
      const newSize = newStats.size
      const savings = originalSize - newSize
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1)

      totalSavings += savings

      console.log(`  ✓ Optimized: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`  💾 Saved: ${(savings / 1024 / 1024).toFixed(2)}MB (${savingsPercent}%)`)
      console.log(`  📐 Dimensions: ${newMetadata.width}x${newMetadata.height}`)

      // Update database with new dimensions if changed
      if (newMetadata.width !== image.width || newMetadata.height !== image.height) {
        await prisma.image.update({
          where: { id: image.id },
          data: {
            width: newMetadata.width || image.width,
            height: newMetadata.height || image.height
          }
        })
      }

      optimized++
    } catch (error) {
      console.error(`  ✗ Failed:`, error instanceof Error ? error.message : error)
      failed++
    }

    console.log('')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Optimization complete!')
  console.log('='.repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`  ✓ Optimized: ${optimized} images`)
  console.log(`  ⚠️  Skipped: ${skipped} images`)
  console.log(`  ✗ Failed: ${failed} images`)
  console.log(`  💾 Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)}MB`)
  console.log('')
}

optimizeImages()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    return prisma.$disconnect().then(() => process.exit(1))
  })
