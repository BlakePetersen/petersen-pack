// ABOUTME: Script to update featured galleries
// ABOUTME: Sets Underwater, Fantasy, and Yoga as featured galleries

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating featured galleries...\n')

  // First, unset all featured galleries
  const unsetResult = await prisma.gallery.updateMany({
    where: { featured: true },
    data: { featured: false },
  })
  console.log(`✓ Unset ${unsetResult.count} previously featured galleries\n`)

  // Set Underwater as featured
  await prisma.gallery.update({
    where: { slug: 'underwater' },
    data: { featured: true },
  })
  console.log(`✓ Set "Underwater" as featured`)

  // Set Fantasy as featured
  await prisma.gallery.update({
    where: { slug: 'fantasy' },
    data: { featured: true },
  })
  console.log(`✓ Set "Fantasy" as featured`)

  // Set Yoga & Dance as featured
  await prisma.gallery.update({
    where: { slug: 'yoga-dance' },
    data: { featured: true },
  })
  console.log(`✓ Set "Yoga & Dance" as featured`)

  console.log('\nFeatured galleries (in order):')
  const featured = await prisma.gallery.findMany({
    where: { featured: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  featured.forEach((g) => {
    console.log(`  ${g.sortOrder + 1}. ${g.title} (${g._count.images} images)`)
  })
}

main()
  .then(() => {
    console.log('\n✓ Done!')
    process.exit(0)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
