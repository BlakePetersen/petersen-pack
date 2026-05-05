// ABOUTME: Analyzes all images in the database for size and format
// ABOUTME: Reports statistics without modifying any files

import { prisma } from '../../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

const PUBLIC_DIR = path.join(process.cwd(), 'public')

async function analyzeImages() {
  console.log('🔍 Analyzing images in database...\n')
  console.log('='.repeat(60))

  const images = await prisma.image.findMany({
    include: {
      gallery: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  console.log(`\nFound ${images.length} images to analyze\n`)

  let totalSize = 0
  let largeImages = 0
  let missingFiles = 0
  const formatCounts: Record<string, number> = {}
  const sizeBuckets = {
    tiny: 0, // < 100KB
    small: 0, // 100KB - 500KB
    medium: 0, // 500KB - 1MB
    large: 0, // 1MB - 3MB
    xlarge: 0, // > 3MB
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const imagePath = path.join(PUBLIC_DIR, image.url)

    if (!fs.existsSync(imagePath)) {
      missingFiles++
      continue
    }

    try {
      const stats = fs.statSync(imagePath)
      const sizeInMB = stats.size / 1024 / 1024
      totalSize += stats.size

      // Categorize by size
      if (stats.size < 100 * 1024) sizeBuckets.tiny++
      else if (stats.size < 500 * 1024) sizeBuckets.small++
      else if (stats.size < 1024 * 1024) sizeBuckets.medium++
      else if (stats.size < 3 * 1024 * 1024) sizeBuckets.large++
      else sizeBuckets.xlarge++

      // Check if image is larger than 2400px
      const buffer = fs.readFileSync(imagePath)
      const metadata = await sharp(buffer).metadata()

      if (
        (metadata.width && metadata.width > 2400) ||
        (metadata.height && metadata.height > 2400)
      ) {
        largeImages++
      }

      // Track formats
      const format = metadata.format || 'unknown'
      formatCounts[format] = (formatCounts[format] || 0) + 1

      // Log large images
      if (sizeInMB > 3) {
        console.log(`⚠️  Large image: ${path.basename(image.url)}`)
        console.log(`   Size: ${sizeInMB.toFixed(2)}MB`)
        console.log(`   Dimensions: ${metadata.width}x${metadata.height}`)
        console.log(`   Format: ${format}`)
        console.log(`   Gallery: ${image.gallery?.title || 'Unknown'}\n`)
      }
    } catch (error) {
      console.error(`Error analyzing ${image.url}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Image Analysis Summary')
  console.log('='.repeat(60))
  console.log(`\n📁 Total images: ${images.length}`)
  console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
  console.log(
    `📏 Average size: ${(totalSize / images.length / 1024).toFixed(2)}KB`
  )

  console.log(`\n📊 Size Distribution:`)
  console.log(`   < 100KB:      ${sizeBuckets.tiny} images`)
  console.log(`   100KB - 500KB: ${sizeBuckets.small} images`)
  console.log(`   500KB - 1MB:   ${sizeBuckets.medium} images`)
  console.log(`   1MB - 3MB:     ${sizeBuckets.large} images`)
  console.log(`   > 3MB:         ${sizeBuckets.xlarge} images`)

  console.log(`\n📷 Format Distribution:`)
  Object.entries(formatCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([format, count]) => {
      console.log(`   ${format}: ${count} images`)
    })

  console.log(`\n⚠️  Images needing attention:`)
  console.log(`   Larger than 2400px: ${largeImages} images`)
  console.log(`   Missing files: ${missingFiles} images`)

  if (sizeBuckets.xlarge > 0 || largeImages > 0) {
    console.log(
      `\n💡 Recommendation: Run 'pnpm optimize:images' to reduce file sizes`
    )
  }

  console.log('')
}

analyzeImages()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    return prisma.$disconnect().then(() => process.exit(1))
  })
