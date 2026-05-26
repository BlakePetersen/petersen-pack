// ABOUTME: Script to consolidate duplicate galleries and remove empty ones
// ABOUTME: Merges Branding into Lifestyle Branding, Animals into Animals and People, removes empty duplicates

import { prisma } from '@/lib/prisma'

async function consolidateGalleries() {
  console.log('Starting gallery consolidation...')
  console.log('='.repeat(80))

  // 1. Consolidate Branding into Lifestyle Branding
  console.log('\n1. Consolidating Branding into Lifestyle Branding...')
  const branding = await prisma.gallery.findUnique({
    where: { slug: 'branding' },
    include: { images: true },
  })

  const lifestyleBranding = await prisma.gallery.findUnique({
    where: { slug: 'lifestyle-branding' },
  })

  if (branding && lifestyleBranding) {
    console.log(`  Found Branding with ${branding.images.length} images`)
    console.log(`  Moving images to Lifestyle Branding...`)

    // Move all images from Branding to Lifestyle Branding
    await prisma.image.updateMany({
      where: { galleryId: branding.id },
      data: { galleryId: lifestyleBranding.id },
    })

    // Delete the Branding gallery
    await prisma.gallery.delete({
      where: { id: branding.id },
    })

    console.log(
      `  ✓ Moved ${branding.images.length} images and deleted Branding gallery`
    )
  } else {
    console.log('  ⊘ Branding or Lifestyle Branding gallery not found')
  }

  // 2. Consolidate Animals into Animals and People
  console.log('\n2. Consolidating Animals into Animals and People...')
  const animals = await prisma.gallery.findUnique({
    where: { slug: 'animals' },
    include: { images: true },
  })

  const animalsAndPeople = await prisma.gallery.findUnique({
    where: { slug: 'animals-and-people' },
  })

  if (animals && animalsAndPeople) {
    console.log(`  Found Animals with ${animals.images.length} images`)
    console.log(`  Moving images to Animals and People...`)

    // Move all images from Animals to Animals and People
    await prisma.image.updateMany({
      where: { galleryId: animals.id },
      data: { galleryId: animalsAndPeople.id },
    })

    // Delete the Animals gallery
    await prisma.gallery.delete({
      where: { id: animals.id },
    })

    console.log(
      `  ✓ Moved ${animals.images.length} images and deleted Animals gallery`
    )
  } else {
    console.log('  ⊘ Animals or Animals and People gallery not found')
  }

  // 3. Remove empty Yoga and Dance duplicates
  console.log('\n3. Removing empty Yoga and Dance galleries...')
  const yogaGalleries = await prisma.gallery.findMany({
    where: { slug: 'yoga-and-dance' },
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  console.log(`  Found ${yogaGalleries.length} Yoga and Dance galleries`)

  for (const gallery of yogaGalleries) {
    if (gallery._count.images === 0) {
      console.log(
        `  Deleting empty gallery: ${gallery.title} (ID: ${gallery.id})`
      )
      await prisma.gallery.delete({
        where: { id: gallery.id },
      })
      console.log(`  ✓ Deleted empty gallery`)
    } else {
      console.log(`  Keeping gallery with ${gallery._count.images} images`)
    }
  }

  // 4. Show final gallery summary
  console.log('\n' + '='.repeat(80))
  console.log('Gallery consolidation complete!')
  console.log('\nFinal gallery list:')

  const galleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  for (const gallery of galleries) {
    console.log(
      `  ${gallery.title}: ${gallery._count.images} images${gallery.featured ? ' (featured)' : ''}`
    )
  }

  console.log(`\nTotal galleries: ${galleries.length}`)
  console.log(
    `Total images: ${galleries.reduce((acc, g) => acc + g._count.images, 0)}`
  )
}

consolidateGalleries()
  .then(() => {
    console.log('\n✓ Consolidation completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Consolidation failed:', error)
    process.exit(1)
  })
