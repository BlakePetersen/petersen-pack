// ABOUTME: Merges "Lifestyle Branding" gallery into "Branding"
// ABOUTME: Consolidates all branding-related images into a single gallery

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Merging "Lifestyle Branding" into "Branding"...\n')

  // Find both galleries
  const brandingGallery = await prisma.gallery.findUnique({
    where: { slug: 'branding' },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  const lifestyleBrandingGallery = await prisma.gallery.findUnique({
    where: { slug: 'lifestyle-branding' },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      heroSlides: true,
    },
  })

  if (!brandingGallery) {
    console.log('Branding gallery not found')
    if (lifestyleBrandingGallery) {
      console.log('Renaming Lifestyle Branding to Branding instead...')
      await prisma.gallery.update({
        where: { id: lifestyleBrandingGallery.id },
        data: {
          title: 'Branding',
          slug: 'branding',
        },
      })
      console.log('✅ Renamed Lifestyle Branding to Branding')
    }
    return
  }

  if (!lifestyleBrandingGallery) {
    console.log('Lifestyle Branding gallery not found - nothing to merge')
    return
  }

  console.log(`Branding gallery: ${brandingGallery.images.length} images`)
  console.log(
    `Lifestyle Branding gallery: ${lifestyleBrandingGallery.images.length} images`
  )
  console.log(
    `Hero slides referencing Lifestyle Branding: ${lifestyleBrandingGallery.heroSlides.length}`
  )

  // Calculate new sort order starting after existing Branding images
  const startingSortOrder = brandingGallery.images.length

  // Move all images from Lifestyle Branding to Branding
  console.log('\nMoving images...')
  for (let i = 0; i < lifestyleBrandingGallery.images.length; i++) {
    const image = lifestyleBrandingGallery.images[i]
    await prisma.image.update({
      where: { id: image.id },
      data: {
        galleryId: brandingGallery.id,
        sortOrder: startingSortOrder + i,
      },
    })
  }

  console.log(
    `✓ Moved ${lifestyleBrandingGallery.images.length} images to Branding gallery`
  )

  // Update any hero slides that reference Lifestyle Branding
  if (lifestyleBrandingGallery.heroSlides.length > 0) {
    console.log('\nUpdating hero slides...')
    await prisma.heroSlide.updateMany({
      where: { galleryId: lifestyleBrandingGallery.id },
      data: { galleryId: brandingGallery.id },
    })
    console.log(
      `✓ Updated ${lifestyleBrandingGallery.heroSlides.length} hero slides`
    )
  }

  // Delete the Lifestyle Branding gallery
  console.log('\nDeleting Lifestyle Branding gallery...')
  await prisma.gallery.delete({
    where: { id: lifestyleBrandingGallery.id },
  })
  console.log('✓ Deleted Lifestyle Branding gallery')

  // Get final count
  const finalBrandingGallery = await prisma.gallery.findUnique({
    where: { slug: 'branding' },
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  console.log(
    `\n✅ Merge complete! Branding gallery now has ${finalBrandingGallery?._count.images} images`
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
