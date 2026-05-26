// ABOUTME: Script to consolidate "Animals" and "Animals and People" into a single gallery
// ABOUTME: Merges images from both galleries and removes duplicate gallery

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting gallery consolidation...')

  // Find the two animal galleries
  const animalsGallery = await prisma.gallery.findFirst({
    where: { title: 'Animals' },
    include: { images: true },
  })

  const animalsAndPeopleGallery = await prisma.gallery.findFirst({
    where: { title: 'Animals and People' },
    include: { images: true },
  })

  if (!animalsGallery) {
    console.log('Animals gallery not found')
    return
  }

  if (!animalsAndPeopleGallery) {
    console.log('Animals and People gallery not found, nothing to consolidate')
    return
  }

  console.log(`Found Animals gallery with ${animalsGallery.images.length} images`)
  console.log(`Found Animals and People gallery with ${animalsAndPeopleGallery.images.length} images`)

  // Move all images from "Animals and People" to "Animals"
  if (animalsAndPeopleGallery.images.length > 0) {
    await prisma.image.updateMany({
      where: { galleryId: animalsAndPeopleGallery.id },
      data: { galleryId: animalsGallery.id },
    })
    console.log(`Moved ${animalsAndPeopleGallery.images.length} images to Animals gallery`)
  }

  // Delete the "Animals and People" gallery
  await prisma.gallery.delete({
    where: { id: animalsAndPeopleGallery.id },
  })
  console.log('Deleted "Animals and People" gallery')

  const updatedGallery = await prisma.gallery.findUnique({
    where: { id: animalsGallery.id },
    include: { _count: { select: { images: true } } },
  })

  console.log(`✅ Successfully consolidated into Animals gallery with ${updatedGallery?._count.images} images`)
}

main()
  .catch((e) => {
    console.error('Error consolidating galleries:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
