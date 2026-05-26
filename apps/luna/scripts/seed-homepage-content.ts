// ABOUTME: Seeds initial homepage content into database
// ABOUTME: Populates about, services, and CTA sections with default content

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding homepage content...')

  // About section content
  await prisma.homepageContent.upsert({
    where: { section: 'about' },
    update: {},
    create: {
      section: 'about',
      content: {
        heading: 'About Ashley',
        imageUrl: '/uploads/scraped/1761515352979-0-lifestyle-portraiture.webp',
        paragraphs: [
          'With over a decade of experience capturing moments that matter, I specialize in creating timeless imagery that tells your unique story.',
          'My approach combines technical precision with artistic vision, resulting in photographs that are both beautiful and authentic. Whether it\'s an intimate portrait session or a grand commercial project, I bring the same level of dedication and creativity to every shoot.',
          'Based in the East Bay, I work with clients throughout the Bay Area, bringing a refined aesthetic and professional expertise to every project.',
        ],
        stats: [
          { value: '10+', label: 'Years Experience' },
          { value: '500+', label: 'Projects Completed' },
          { value: '100+', label: 'Happy Clients' },
        ],
        linkText: 'Learn More About Me',
        linkUrl: '/about',
      },
    },
  })

  console.log('✓ Seeded about section')

  // Services section content
  await prisma.homepageContent.upsert({
    where: { section: 'services' },
    update: {},
    create: {
      section: 'services',
      content: {
        heading: 'Services',
        subtitle: 'Comprehensive photography services tailored to your vision and needs',
        services: [
          {
            icon: 'Camera',
            title: 'Portrait Photography',
            description:
              'Capturing the essence of individuals and families with natural, timeless portraits that celebrate personality and connection.',
          },
          {
            icon: 'Users',
            title: 'Family Sessions',
            description:
              'Creating treasured memories with relaxed, joyful family portraits that showcase your unique bonds and relationships.',
          },
          {
            icon: 'Building2',
            title: 'Commercial Projects',
            description:
              'Professional imagery for businesses, products, and marketing campaigns that elevate your brand presence and impact.',
          },
          {
            icon: 'Sparkles',
            title: 'Creative Sessions',
            description:
              'Artistic and editorial work for unique projects that demand striking visual storytelling and creative vision.',
          },
        ],
      },
    },
  })

  console.log('✓ Seeded services section')

  // CTA section content
  await prisma.homepageContent.upsert({
    where: { section: 'cta' },
    update: {},
    create: {
      section: 'cta',
      content: {
        heading: 'Ready to Book Your Session?',
        subtitle: "Let's create beautiful memories together",
        buttonText: 'Book a Session',
        buttonUrl: '/book',
      },
    },
  })

  console.log('✓ Seeded CTA section')

  console.log('\n✅ Successfully seeded homepage content')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
