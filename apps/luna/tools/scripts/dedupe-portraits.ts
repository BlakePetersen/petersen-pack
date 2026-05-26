// ABOUTME: Removes duplicate images from Portraits gallery
// ABOUTME: Keeps first occurrence and deletes duplicates based on URL

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Deduplicating Portraits gallery...\n')

  const gallery = await prisma.gallery.findUnique({
    where: { slug: 'portraits' },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!gallery) {
    console.log('Portraits gallery not found')
    return
  }

  console.log(`Found gallery: ${gallery.title}`)
  console.log(`  Total images: ${gallery.images.length}`)

  // Track seen URLs and duplicates
  const seenUrls = new Set<string>()
  const duplicates: string[] = []

  for (const image of gallery.images) {
    if (seenUrls.has(image.url)) {
      duplicates.push(image.id)
    } else {
      seenUrls.add(image.url)
    }
  }

  console.log(`  Unique images: ${seenUrls.size}`)
  console.log(`  Duplicates found: ${duplicates.length}`)

  if (duplicates.length === 0) {
    console.log('\n✅ No duplicates found!')
    return
  }

  // Delete duplicates
  console.log('\nDeleting duplicates...')
  const result = await prisma.image.deleteMany({
    where: {
      id: {
        in: duplicates,
      },
    },
  })

  console.log(`✓ Deleted ${result.count} duplicate images`)

  // Reorder remaining images
  console.log('\nReordering images...')
  const remainingImages = await prisma.image.findMany({
    where: { galleryId: gallery.id },
    orderBy: { sortOrder: 'asc' },
  })

  for (let i = 0; i < remainingImages.length; i++) {
    await prisma.image.update({
      where: { id: remainingImages[i].id },
      data: { sortOrder: i },
    })
  }

  console.log(`✓ Reordered ${remainingImages.length} images`)

  console.log('\n✅ Deduplication complete!')
  console.log(`   Final count: ${remainingImages.length} images`)
}

main()
  .catch((e) => {
    console.error('Error deduplicating gallery:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
