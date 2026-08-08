// ABOUTME: Script to query gallery images from database
// ABOUTME: Helps find images for specific galleries

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get underwater gallery
  const underwaterGallery = await prisma.gallery.findFirst({
    where: { title: { contains: 'Underwater', mode: 'insensitive' } },
    include: {
      images: {
        take: 5,
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  console.log('\n🌊 Underwater Gallery:')
  if (underwaterGallery) {
    console.log(`ID: ${underwaterGallery.id}`)
    console.log(`Title: ${underwaterGallery.title}`)
    console.log(`Images (${underwaterGallery.images.length}):`)
    underwaterGallery.images.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.url}`)
    })
  } else {
    console.log('Not found')
  }

  // Get all lifestyle portraiture images
  const lifestyleGallery = await prisma.gallery.findFirst({
    where: {
      title: { contains: 'Lifestyle Portraiture', mode: 'insensitive' },
    },
    include: {
      images: {
        take: 10,
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  console.log('\n📸 Lifestyle Portraiture Gallery:')
  if (lifestyleGallery) {
    console.log(`ID: ${lifestyleGallery.id}`)
    console.log(`Title: ${lifestyleGallery.title}`)
    console.log(`Images (showing first 10):`)
    lifestyleGallery.images.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.url}`)
    })
  } else {
    console.log('Not found')
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
