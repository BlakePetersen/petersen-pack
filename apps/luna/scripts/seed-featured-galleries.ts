// ABOUTME: Script to mark existing galleries as featured for homepage display
// ABOUTME: Updates galleries to show in the Featured Work section

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting featured galleries seed...')

  // First, get all galleries with images
  const galleries = await prisma.gallery.findMany({
    include: {
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { images: true },
      },
    },
  })

  console.log(`Found ${galleries.length} galleries`)

  // Filter galleries that have images
  const galleriesWithImages = galleries.filter((g) => g._count.images > 0)
  console.log(`Found ${galleriesWithImages.length} galleries with images`)

  if (galleriesWithImages.length === 0) {
    console.log(
      'No galleries with images found. Please create some galleries first.'
    )
    return
  }

  // Reset all featured flags
  await prisma.gallery.updateMany({
    data: { featured: false },
  })
  console.log('Reset all featured flags')

  // Select up to 6 galleries to feature
  const galleriestoFeature = galleriesWithImages.slice(0, 6)

  // Update featured galleries
  for (let i = 0; i < galleriestoFeature.length; i++) {
    const gallery = galleriestoFeature[i]
    await prisma.gallery.update({
      where: { id: gallery.id },
      data: {
        featured: true,
        sortOrder: i,
      },
    })
    console.log(
      `Featured gallery: ${gallery.title} (${gallery._count.images} images)`
    )
  }

  console.log(`✅ Successfully featured ${galleriestoFeature.length} galleries`)
}

main()
  .catch((e) => {
    console.error('Error seeding featured galleries:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
