// ABOUTME: Merges "Animals and People" gallery into "Animals"
// ABOUTME: Consolidates all animal-related images into a single gallery

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Merging "Animals and People" into "Animals"...\n')

  // Find both galleries
  const animalsGallery = await prisma.gallery.findUnique({
    where: { slug: 'animals' },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  const animalsAndPeopleGallery = await prisma.gallery.findUnique({
    where: { slug: 'animals-and-people' },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      heroSlides: true,
    },
  })

  if (!animalsGallery) {
    throw new Error('Animals gallery not found')
  }

  if (!animalsAndPeopleGallery) {
    console.log('Animals and People gallery not found - nothing to merge')
    return
  }

  console.log(`Animals gallery: ${animalsGallery.images.length} images`)
  console.log(
    `Animals and People gallery: ${animalsAndPeopleGallery.images.length} images`
  )
  console.log(
    `Hero slides referencing Animals and People: ${animalsAndPeopleGallery.heroSlides.length}`
  )

  // Calculate new sort order starting after existing Animals images
  const startingSortOrder = animalsGallery.images.length

  // Move all images from Animals and People to Animals
  console.log('\nMoving images...')
  for (let i = 0; i < animalsAndPeopleGallery.images.length; i++) {
    const image = animalsAndPeopleGallery.images[i]
    await prisma.image.update({
      where: { id: image.id },
      data: {
        galleryId: animalsGallery.id,
        sortOrder: startingSortOrder + i,
      },
    })
  }

  console.log(
    `✓ Moved ${animalsAndPeopleGallery.images.length} images to Animals gallery`
  )

  // Update any hero slides that reference Animals and People
  if (animalsAndPeopleGallery.heroSlides.length > 0) {
    console.log('\nUpdating hero slides...')
    await prisma.heroSlide.updateMany({
      where: { galleryId: animalsAndPeopleGallery.id },
      data: { galleryId: animalsGallery.id },
    })
    console.log(
      `✓ Updated ${animalsAndPeopleGallery.heroSlides.length} hero slides`
    )
  }

  // Delete the Animals and People gallery
  console.log('\nDeleting Animals and People gallery...')
  await prisma.gallery.delete({
    where: { id: animalsAndPeopleGallery.id },
  })
  console.log('✓ Deleted Animals and People gallery')

  // Get final count
  const finalAnimalsGallery = await prisma.gallery.findUnique({
    where: { slug: 'animals' },
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  console.log(
    `\n✅ Merge complete! Animals gallery now has ${finalAnimalsGallery?._count.images} images`
  )
}

main()
  .catch((e) => {
    console.error('Error merging galleries:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
