// ABOUTME: Script to seed test testimonials into the database
// ABOUTME: Creates diverse client testimonials with different project types and ratings

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testimonials = [
  {
    clientName: 'Sarah Mitchell',
    projectType: 'Wedding Photography',
    quote:
      'Ashley captured our wedding day beautifully. Every photo tells a story and the attention to detail was incredible. We will treasure these memories forever.',
    rating: 5,
    sortOrder: 0,
    isActive: true,
  },
  {
    clientName: 'Marcus Chen',
    projectType: 'Corporate Headshots',
    quote:
      'Professional, efficient, and the results exceeded our expectations. Ashley made our entire team feel comfortable and the headshots are stunning.',
    rating: 5,
    sortOrder: 1,
    isActive: true,
  },
  {
    clientName: 'Emily Rodriguez',
    projectType: 'Family Portrait Session',
    quote:
      'Working with Ashley was such a joy. She has a natural ability to capture genuine moments and our family photos are absolutely perfect.',
    rating: 5,
    sortOrder: 2,
    isActive: true,
  },
  {
    clientName: 'David Thompson',
    projectType: 'Editorial Fashion',
    quote:
      'Ashley brings an artistic vision that elevates every project. The editorial shots were exactly what we needed for our campaign.',
    rating: 5,
    sortOrder: 3,
    isActive: true,
  },
  {
    clientName: 'Jennifer Park',
    projectType: 'Engagement Photos',
    quote:
      'We felt so at ease during our session. Ashley found the most beautiful locations and the golden hour shots are breathtaking.',
    rating: 5,
    sortOrder: 4,
    isActive: true,
  },
]

async function main() {
  console.log('Starting testimonials seed...')

  // Delete existing testimonials
  await prisma.testimonial.deleteMany()
  console.log('Cleared existing testimonials')

  // Create new testimonials
  for (const testimonial of testimonials) {
    const created = await prisma.testimonial.create({
      data: testimonial,
    })
    console.log(
      `Created testimonial: ${created.clientName} - ${created.projectType}`
    )
  }

  console.log(`✅ Successfully seeded ${testimonials.length} testimonials`)
}

main()
  .catch((e) => {
    console.error('Error seeding testimonials:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
