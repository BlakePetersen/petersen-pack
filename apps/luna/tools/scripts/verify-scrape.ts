// ABOUTME: Verifies the scraped images and galleries in the database
// ABOUTME: Shows summary statistics of what was imported from the legacy site

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyScrapedData() {
  console.log('\n🔍 Verifying Scraped Data from Legacy Site\n')
  console.log('='.repeat(60))

  // Get total galleries
  const totalGalleries = await prisma.gallery.count()
  console.log(`\n📁 Total Galleries: ${totalGalleries}`)

  // Get galleries with image counts
  const galleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: { title: 'asc' },
  })

  console.log('\n📊 Gallery Breakdown:\n')
  console.log('-'.repeat(60))

  let totalImages = 0
  galleries.forEach((gallery) => {
    const imageCount = gallery._count.images
    totalImages += imageCount
    console.log(
      `  ${gallery.title.padEnd(30)} ${imageCount.toString().padStart(5)} images`
    )
  })

  console.log('-'.repeat(60))
  console.log(
    `  ${'TOTAL'.padEnd(30)} ${totalImages.toString().padStart(5)} images`
  )
  console.log('\n' + '='.repeat(60))

  // Check images directory
  console.log('\n📂 Checking scraped images directory...\n')

  const fs = require('fs')
  const path = require('path')
  const scrapedDir = path.join(process.cwd(), 'public', 'uploads', 'scraped')

  if (fs.existsSync(scrapedDir)) {
    const files = fs
      .readdirSync(scrapedDir)
      .filter((f: string) => f.endsWith('.webp'))
    console.log(
      `  ✓ Found ${files.length} WebP files in /public/uploads/scraped/`
    )

    // Calculate total size
    let totalSize = 0
    files.forEach((file: string) => {
      const stats = fs.statSync(path.join(scrapedDir, file))
      totalSize += stats.size
    })

    const sizeMB = (totalSize / 1024 / 1024).toFixed(2)
    console.log(`  ✓ Total size: ${sizeMB} MB`)
  } else {
    console.log(`  ✗ Scraped directory not found`)
  }

  console.log('\n✨ Verification Complete!\n')
}

verifyScrapedData()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    prisma.$disconnect().then(() => process.exit(1))
  })
