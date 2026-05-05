// ABOUTME: Update hero slides with real gallery images
// ABOUTME: Replaces placeholder images with actual portfolio photos

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating hero slides with real images...\n')

  // Delete all existing hero slides
  await prisma.heroSlide.deleteMany()
  console.log('Cleared existing hero slides')

  // Define which galleries we want to feature and get their first images
  const heroGalleries = [
    { slug: 'underwater', title: 'Underwater Photography' },
    { slug: 'headshots', title: 'Headshots' },
    { slug: 'branding', title: 'Branding & Lifestyle' },
    { slug: 'animals', title: 'Wild Hearts' },
    { slug: 'yoga-dance', title: 'Yoga & Dance' },
    { slug: 'boudoir', title: 'Beautifully Bold' },
    { slug: 'fantasy', title: 'Dream in Color' },
    { slug: 'lifestyle-portraiture', title: 'Real Life, Real Love' },
  ]

  let sortOrder = 0

  for (const galleryInfo of heroGalleries) {
    const gallery = await prisma.gallery.findUnique({
      where: { slug: galleryInfo.slug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    })

    if (!gallery) {
      console.log(`⚠️  Gallery not found: ${galleryInfo.slug}`)
      continue
    }

    if (gallery.images.length === 0) {
      console.log(`⚠️  No images in gallery: ${gallery.title}`)
      continue
    }

    const image = gallery.images[0]

    await prisma.heroSlide.create({
      data: {
        title: galleryInfo.title,
        imageId: image.id,
        linkUrl: `/portfolio/${gallery.slug}`,
        linkText: 'View Gallery',
        sortOrder,
        isActive: true,
      },
    })

    console.log(`✓ Created slide ${sortOrder + 1}: ${galleryInfo.title}`)
    console.log(`  Image: ${image.url.substring(0, 60)}...`)
    console.log(`  Link: /portfolio/${gallery.slug}\n`)

    sortOrder++
  }

  console.log(`\n✨ Created ${sortOrder} hero slides with real images!`)
}

main()
  .catch((e) => {
    console.error('Error updating hero slides:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
