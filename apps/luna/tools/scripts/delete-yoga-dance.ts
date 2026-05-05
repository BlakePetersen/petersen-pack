// ABOUTME: Deletes the empty Yoga and Dance gallery
// ABOUTME: Removes gallery from database if it has no images

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking Yoga and Dance gallery...\n')

  const gallery = await prisma.gallery.findUnique({
    where: { slug: 'yoga-dance' },
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  if (!gallery) {
    console.log('❌ Yoga and Dance gallery not found')
    return
  }

  console.log(`Found gallery: ${gallery.title}`)
  console.log(`Images: ${gallery._count.images}`)

  if (gallery._count.images > 0) {
    console.log(
      `\n⚠️  Gallery has ${gallery._count.images} images. Not deleting.`
    )
    return
  }

  console.log('\n🗑️  Deleting empty gallery...')

  await prisma.gallery.delete({
    where: { id: gallery.id },
  })

  console.log('✅ Deleted Yoga and Dance gallery')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
