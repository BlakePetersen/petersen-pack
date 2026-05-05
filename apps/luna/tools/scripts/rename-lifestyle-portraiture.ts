// ABOUTME: Renames "Lifestyle Portraiture" gallery to "Portraits"
// ABOUTME: Updates title and slug

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Renaming "Lifestyle Portraiture" to "Portraits"...\n')

  const gallery = await prisma.gallery.findUnique({
    where: { slug: 'lifestyle-portraiture' },
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  if (!gallery) {
    console.log('Lifestyle Portraiture gallery not found - nothing to rename')
    return
  }

  console.log(`Found gallery: ${gallery.title}`)
  console.log(`  Images: ${gallery._count.images}`)
  console.log(`  Current slug: ${gallery.slug}`)

  await prisma.gallery.update({
    where: { id: gallery.id },
    data: {
      title: 'Portraits',
      slug: 'portraits',
    },
  })

  console.log('\n✅ Renamed to "Portraits" with slug "portraits"')
}

main()
  .catch((e) => {
    console.error('Error renaming gallery:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
