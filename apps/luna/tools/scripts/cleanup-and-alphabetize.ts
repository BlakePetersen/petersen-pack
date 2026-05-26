// ABOUTME: Script to cleanup empty galleries and alphabetize all galleries
// ABOUTME: Removes galleries with no images and sets sortOrder alphabetically

import { prisma } from '@/lib/prisma'

async function cleanupAndAlphabetize() {
  console.log('Starting gallery cleanup and alphabetization...')
  console.log('='.repeat(80))

  // 1. Remove all galleries with 0 images
  console.log('\n1. Removing empty galleries...')
  const emptyGalleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  for (const gallery of emptyGalleries) {
    if (gallery._count.images === 0) {
      console.log(`  Deleting empty gallery: ${gallery.title}`)
      await prisma.gallery.delete({
        where: { id: gallery.id },
      })
    }
  }

  // 2. Alphabetize all remaining galleries
  console.log('\n2. Alphabetizing galleries...')
  const galleries = await prisma.gallery.findMany({
    orderBy: { title: 'asc' },
  })

  console.log(`  Found ${galleries.length} galleries to alphabetize`)

  for (let i = 0; i < galleries.length; i++) {
    await prisma.gallery.update({
      where: { id: galleries[i].id },
      data: { sortOrder: i },
    })
    console.log(`  ${i + 1}. ${galleries[i].title}`)
  }

  // 3. Show final gallery summary
  console.log('\n' + '='.repeat(80))
  console.log('Cleanup and alphabetization complete!')
  console.log('\nFinal gallery list (alphabetical):')

  const finalGalleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  for (const gallery of finalGalleries) {
    console.log(
      `  ${gallery.sortOrder + 1}. ${gallery.title}: ${gallery._count.images} images${gallery.featured ? ' (featured)' : ''}`
    )
  }

  console.log(`\nTotal galleries: ${finalGalleries.length}`)
  console.log(
    `Total images: ${finalGalleries.reduce((acc, g) => acc + g._count.images, 0)}`
  )
}

cleanupAndAlphabetize()
  .then(() => {
    console.log('\n✓ Cleanup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Cleanup failed:', error)
    process.exit(1)
  })
