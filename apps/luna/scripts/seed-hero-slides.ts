// ABOUTME: Seed script to create hero slides for testing
// ABOUTME: Creates multiple hero slides with varied focal points

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const heroSlides = [
  {
    title: 'Underwater Dreams',
    imageUrl: '/uploads/scraped/1763345411948-0-underwater.webp',
    focalX: 0.5,
    focalY: 0.5,
    mobileFocalX: 0.5,
    mobileFocalY: 0.5,
    linkUrl: '/portfolio/underwater',
    linkText: 'See Gallery',
    sortOrder: 0,
    isActive: true,
  },
  {
    title: 'Fantasy & Fine Art',
    imageUrl: '/uploads/scraped/1763345400798-0-fantasy.webp',
    focalX: 0.5,
    focalY: 0.4,
    mobileFocalX: 0.5,
    mobileFocalY: 0.4,
    linkUrl: '/portfolio/fantasy',
    linkText: 'View Portfolio',
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Movement & Grace',
    imageUrl: '/uploads/scraped/1763345410984-0-yoga-dance.webp',
    focalX: 0.5,
    focalY: 0.5,
    mobileFocalX: 0.5,
    mobileFocalY: 0.5,
    linkUrl: '/portfolio/yoga-dance',
    linkText: 'See Work',
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Animals & Their People',
    imageUrl: '/uploads/scraped/1763345395871-0-animals.webp',
    focalX: 0.5,
    focalY: 0.5,
    mobileFocalX: 0.5,
    mobileFocalY: 0.5,
    linkUrl: '/portfolio/animals',
    linkText: 'Book Now',
    sortOrder: 3,
    isActive: true,
  },
  {
    title: 'Intimate Portraits',
    imageUrl: '/uploads/scraped/1763345396448-0-boudoir.webp',
    focalX: 0.5,
    focalY: 0.4,
    mobileFocalX: 0.5,
    mobileFocalY: 0.5,
    linkUrl: '/portfolio/boudoir',
    linkText: 'View Gallery',
    sortOrder: 4,
    isActive: true,
  },
]

async function main() {
  console.log('Starting hero slides seed...')

  // Delete existing hero slides
  const deleted = await prisma.heroSlide.deleteMany()
  console.log(`Deleted ${deleted.count} existing hero slides`)

  // Create new hero slides
  for (const slide of heroSlides) {
    const created = await prisma.heroSlide.create({
      data: slide,
    })
    console.log(
      `Created hero slide: ${created.title} (Focal: ${created.focalX * 100}%, ${created.focalY * 100}%)`
    )
  }

  console.log('\nSeed completed successfully!')
  console.log(
    `Created ${heroSlides.length} hero slides with varied focal points`
  )
  console.log('Visit the homepage to see the carousel in action')
}

main()
  .catch((e) => {
    console.error('Error seeding hero slides:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
