// ABOUTME: Script to populate existing galleries with images from the uploads directory
// ABOUTME: Adds images to galleries and marks some galleries as featured

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting gallery image population...')

  // Get all galleries
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: 'asc' },
  })

  if (galleries.length === 0) {
    console.log('No galleries found. Please create some galleries first.')
    return
  }

  console.log(`Found ${galleries.length} galleries`)

  // Get all images from uploads directory
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  let imageFiles: string[] = []

  try {
    const files = fs.readdirSync(uploadsDir)
    imageFiles = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    console.log(`Found ${imageFiles.length} images in uploads directory`)
  } catch (error) {
    console.error('Error reading uploads directory:', error)
    return
  }

  if (imageFiles.length === 0) {
    console.log('No images found in uploads directory')
    return
  }

  // Delete all existing images (all images belong to galleries in this schema)
  await prisma.image.deleteMany({})
  console.log('Cleared existing gallery images')

  // Distribute images across galleries
  const imagesPerGallery = Math.floor(imageFiles.length / galleries.length)
  let imageIndex = 0

  for (const gallery of galleries) {
    const numImages = Math.min(imagesPerGallery + 2, imageFiles.length - imageIndex)

    if (numImages <= 0) break

    console.log(`\nAdding ${numImages} images to gallery: ${gallery.title}`)

    for (let i = 0; i < numImages; i++) {
      const imageFile = imageFiles[imageIndex++]
      const imageUrl = `/uploads/${imageFile}`

      await prisma.image.create({
        data: {
          url: imageUrl,
          altText: `${gallery.title} - Image ${i + 1}`,
          galleryId: gallery.id,
          sortOrder: i,
          focalX: 0.5,
          focalY: 0.5,
        },
      })

      console.log(`  Added: ${imageFile}`)
    }
  }

  // Now mark first 6 galleries with images as featured
  const galleriesWithImages = await prisma.gallery.findMany({
    where: {
      images: {
        some: {},
      },
    },
    include: {
      _count: {
        select: { images: true },
      },
    },
    take: 6,
  })

  for (let i = 0; i < galleriesWithImages.length; i++) {
    await prisma.gallery.update({
      where: { id: galleriesWithImages[i].id },
      data: {
        featured: true,
        sortOrder: i,
      },
    })
    console.log(`\nFeatured: ${galleriesWithImages[i].title} (${galleriesWithImages[i]._count.images} images)`)
  }

  console.log(`\n✅ Successfully populated galleries with images and featured ${galleriesWithImages.length} galleries`)
}

main()
  .catch((e) => {
    console.error('Error populating gallery images:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
