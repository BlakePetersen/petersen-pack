// ABOUTME: Fetch and update About image dimensions
// ABOUTME: Gets actual image dimensions from the URL and updates database

import { prisma } from '../../lib/prisma'
import sharp from 'sharp'

async function main() {
  console.log('Fetching About image...')

  const aboutContent = await prisma.homepageContent.findUnique({
    where: { section: 'about' },
    include: { image: true },
  })

  if (!aboutContent?.image) {
    console.error('No image found for About section')
    return
  }

  const imageUrl = aboutContent.image.url
  console.log('Image URL:', imageUrl)

  // Fetch the image
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Get dimensions using sharp
  const metadata = await sharp(buffer).metadata()
  const width = metadata.width!
  const height = metadata.height!

  console.log('Image dimensions:', width, 'x', height)

  // Update the database
  await prisma.image.update({
    where: { id: aboutContent.image.id },
    data: {
      width,
      height,
    },
  })

  console.log('✅ Updated image dimensions in database')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
