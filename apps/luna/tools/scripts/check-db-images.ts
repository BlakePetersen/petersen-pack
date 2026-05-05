// ABOUTME: Quick script to check database image counts
// ABOUTME: Diagnostic tool for troubleshooting

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImages() {
  const galleries = await prisma.gallery.findMany({
    include: { _count: { select: { images: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  console.log('\nGallery Image Counts:')
  console.log('─'.repeat(50))
  for (const gallery of galleries) {
    console.log(`${gallery.title.padEnd(30)} ${gallery._count.images} images`)
  }

  const totalImages = await prisma.image.count()
  console.log('─'.repeat(50))
  console.log(`Total images in database: ${totalImages}`)
}

checkImages()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
