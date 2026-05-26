// ABOUTME: Migrate About section image from content URL to Image record
// ABOUTME: Creates Image record and links it to HomepageContent

import { prisma } from '../../lib/prisma'

async function main() {
  console.log('Migrating About section image...')

  // Get the current about content
  const aboutContent = await prisma.homepageContent.findUnique({
    where: { section: 'about' },
  })

  if (!aboutContent) {
    console.error('About section not found')
    return
  }

  const content = aboutContent.content as any
  const imageUrl = content.imageUrl

  if (!imageUrl) {
    console.error('No imageUrl found in about content')
    return
  }

  console.log('Current imageUrl:', imageUrl)

  // Check if an image record already exists
  if (aboutContent.imageId) {
    console.log('Image record already linked:', aboutContent.imageId)
    return
  }

  // Create a new Image record
  const image = await prisma.image.createManyAndReturn({
    data: {
      url: imageUrl,
      altText: 'Ashley Petersen',
      focalX: 0.5,
      focalY: 0.5,
      sortOrder: 0,
    },
  })

  console.log('Created image record:', image[0].id)

  // Link the image to the homepage content
  await prisma.homepageContent.update({
    where: { section: 'about' },
    data: {
      imageId: image[0].id,
    },
  })

  console.log('✅ Successfully migrated About section image')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
