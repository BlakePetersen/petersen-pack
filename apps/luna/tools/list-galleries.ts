// ABOUTME: Script to list all galleries in the database
// ABOUTME: Shows gallery titles, image counts, and slugs

import { prisma } from '../lib/prisma'

async function listGalleries() {
  const galleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: { title: 'asc' },
  })

  console.log('Current galleries in database:')
  console.log('='.repeat(60))
  galleries.forEach((g) => {
    console.log(`${g.title.padEnd(40)} | ${g._count.images} images | ${g.slug}`)
  })
  console.log(`\nTotal: ${galleries.length} galleries`)

  await prisma.$disconnect()
}

listGalleries().catch(console.error)
