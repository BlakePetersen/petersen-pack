// ABOUTME: Script to update homepage hero slides with gallery content
// ABOUTME: Creates slides with unique creative titles for each gallery

import { prisma } from '@/lib/prisma'

// Map gallery slugs to unique creative titles
const heroTitles: Record<string, string> = {
  animals: 'Wild Hearts',
  boudoir: 'Beautifully Bold',
  branding: 'Tell Your Story',
  headshots: 'Make It Count',
  fantasy: 'Dream in Color',
  'lifestyle-portraiture': 'Real Life, Real Love',
  travel: 'Wanderlust',
  'yoga-dance': 'Flow & Form',
  underwater: 'Beneath the Surface',
  'rescue-tales': 'Second Chances',
}

async function updateHeroSlides() {
  console.log('Updating hero slides...')

  // Get all galleries with their landscape images
  // Only use landscape images (width > height) and skip first image to avoid Featured Work duplication
  const allGalleries = await prisma.gallery.findMany({
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  if (allGalleries.length === 0) {
    console.log('No galleries found - please create some galleries first')
    return
  }

  // Find galleries with landscape images (skip first image)
  const galleriesWithLandscapeImages = allGalleries
    .map((gallery) => {
      // Skip first image and find landscape images
      const landscapeImages = gallery.images
        .slice(1) // Skip first image
        .filter((img) => img.width && img.height && img.width > img.height)

      if (landscapeImages.length > 0) {
        return {
          gallery,
          image: landscapeImages[0], // Use first landscape image
        }
      }
      return null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (galleriesWithLandscapeImages.length === 0) {
    console.log(
      'No galleries with landscape images found (after skipping first image)'
    )
    return
  }

  console.log(
    `Found ${galleriesWithLandscapeImages.length} galleries with landscape images`
  )

  // Delete existing hero slides
  await prisma.heroSlide.deleteMany({})
  console.log('Deleted existing hero slides')

  // Create hero slides for each gallery with landscape images (limit to 6)
  const slides = galleriesWithLandscapeImages
    .slice(0, 6)
    .map((item, index) => ({
      title: heroTitles[item.gallery.slug] || item.gallery.title,
      linkUrl: `/portfolio/${item.gallery.slug}`,
      linkText: 'View Gallery',
      sortOrder: index + 1,
      imageId: item.image.id,
    }))

  // Create all slides
  for (const slide of slides) {
    await prisma.heroSlide.create({
      data: {
        title: slide.title,
        linkUrl: slide.linkUrl,
        linkText: slide.linkText,
        sortOrder: slide.sortOrder,
        isActive: true,
        imageId: slide.imageId,
        focalX: 0.5,
        focalY: 0.5,
        mobileFocalX: 0.5,
        mobileFocalY: 0.5,
      },
    })
    console.log(`Created hero slide: ${slide.title}`)
  }

  console.log('✅ Hero slides updated successfully!')
}

updateHeroSlides()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error updating hero slides:', error)
    process.exit(1)
  })
