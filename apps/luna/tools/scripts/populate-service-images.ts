// ABOUTME: Populates ServiceImage table with standout examples from galleries
// ABOUTME: Maps pricing categories to related galleries and selects 3 images per service

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map service slugs to gallery slugs
const SERVICE_GALLERY_MAP: Record<string, string[]> = {
  headshots: ['headshots'],
  'branding-commercial': ['branding'],
  'lifestyle-family': ['portraits'],
  'animals-pets': ['animals'],
  'creative-specialty': ['underwater', 'boudoir', 'fantasy'],
}

async function main() {
  console.log('Populating service images from galleries...\n')

  // Get all pricing categories
  const categories = await prisma.pricingCategory.findMany({
    where: { isActive: true },
  })

  for (const category of categories) {
    const galleryIds = SERVICE_GALLERY_MAP[category.slug]

    if (!galleryIds || galleryIds.length === 0) {
      console.log(`⚠️  No gallery mapping for ${category.name}, skipping`)
      continue
    }

    console.log(`\n📸 Processing ${category.name}...`)
    console.log(`   Mapped to galleries: ${galleryIds.join(', ')}`)

    // Get images from mapped galleries
    const galleries = await prisma.gallery.findMany({
      where: {
        slug: { in: galleryIds },
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    // Collect all images from all mapped galleries
    const allImages = galleries.flatMap((g) => g.images)

    if (allImages.length === 0) {
      console.log(`   ⚠️  No images found in galleries`)
      continue
    }

    // Select 5 images evenly distributed
    const selectedImages = []
    if (allImages.length >= 5) {
      // Pick images at 0%, 25%, 50%, 75%, 100% positions
      selectedImages.push(allImages[0])
      selectedImages.push(allImages[Math.floor(allImages.length * 0.25)])
      selectedImages.push(allImages[Math.floor(allImages.length * 0.5)])
      selectedImages.push(allImages[Math.floor(allImages.length * 0.75)])
      selectedImages.push(allImages[allImages.length - 1])
    } else {
      // Use what we have
      selectedImages.push(...allImages)
    }

    console.log(
      `   Found ${allImages.length} images, selected ${selectedImages.length}`
    )

    // Delete existing service images for this category
    await prisma.serviceImage.deleteMany({
      where: { categoryId: category.id },
    })

    // Create service images
    for (let i = 0; i < selectedImages.length; i++) {
      const img = selectedImages[i]
      await prisma.serviceImage.create({
        data: {
          categoryId: category.id,
          url: img.url,
          publicId: img.publicId,
          altText: img.altText || `${category.name} example ${i + 1}`,
          width: img.width,
          height: img.height,
          focalX: img.focalX,
          focalY: img.focalY,
          sortOrder: i,
        },
      })
    }

    console.log(`   ✅ Added ${selectedImages.length} service images`)
  }

  // Summary
  const summary = await prisma.pricingCategory.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { serviceImages: true },
      },
    },
  })

  console.log('\n' + '='.repeat(60))
  console.log('Summary:')
  for (const cat of summary) {
    console.log(`  ${cat.name}: ${cat._count.serviceImages} images`)
  }
  console.log('='.repeat(60))
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
