// ABOUTME: Seeds homepage content sections
// ABOUTME: Creates about, services, and CTA sections for the homepage

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedHomepageContent() {
  console.log('Seeding homepage content...')

  // About Section
  await prisma.homepageContent.upsert({
    where: { section: 'about' },
    update: {
      content: {
        heading: 'About Ashley',
        imageUrl: '/images/ashley-headshot.jpg',
        paragraphs: [
          'As a professional photographer based in the San Francisco Bay Area, I specialize in capturing authentic moments and creating stunning visual stories. With over a decade of experience, I bring a unique blend of technical expertise and artistic vision to every project.',
          "My approach is collaborative and personalized. Whether it's a corporate headshot, lifestyle branding session, or underwater photography adventure, I work closely with you to ensure your vision comes to life.",
        ],
        stats: [
          { value: '10+', label: 'Years Experience' },
          { value: '500+', label: 'Happy Clients' },
          { value: '15+', label: 'Specialties' },
        ],
        linkText: 'View Portfolio',
        linkUrl: '/portfolio',
      },
    },
    create: {
      section: 'about',
      content: {
        heading: 'About Ashley',
        imageUrl: '/images/ashley-headshot.jpg',
        paragraphs: [
          'As a professional photographer based in the San Francisco Bay Area, I specialize in capturing authentic moments and creating stunning visual stories. With over a decade of experience, I bring a unique blend of technical expertise and artistic vision to every project.',
          "My approach is collaborative and personalized. Whether it's a corporate headshot, lifestyle branding session, or underwater photography adventure, I work closely with you to ensure your vision comes to life.",
        ],
        stats: [
          { value: '10+', label: 'Years Experience' },
          { value: '500+', label: 'Happy Clients' },
          { value: '15+', label: 'Specialties' },
        ],
        linkText: 'View Portfolio',
        linkUrl: '/portfolio',
      },
    },
  })
  console.log('  - Created/updated about section')

  // Services Section
  await prisma.homepageContent.upsert({
    where: { section: 'services' },
    update: {
      content: {
        heading: 'Photography Services',
        subtitle:
          'From professional headshots to creative underwater sessions, I offer a wide range of photography services',
        services: [
          {
            title: 'Headshots & Portraits',
            description:
              'Professional headshots for actors, corporate professionals, and personal branding',
            slug: 'headshots',
          },
          {
            title: 'Branding & Commercial',
            description:
              'Lifestyle and commercial photography to elevate your business and brand',
            slug: 'branding',
          },
          {
            title: 'Lifestyle & Family',
            description:
              'Natural, authentic portraits capturing genuine moments with loved ones',
            slug: 'lifestyle',
          },
          {
            title: 'Creative & Specialty',
            description:
              'Unique sessions including underwater, boudoir, and fantasy photography',
            slug: 'specialty',
          },
        ],
      },
    },
    create: {
      section: 'services',
      content: {
        heading: 'Photography Services',
        subtitle:
          'From professional headshots to creative underwater sessions, I offer a wide range of photography services',
        services: [
          {
            title: 'Headshots & Portraits',
            description:
              'Professional headshots for actors, corporate professionals, and personal branding',
            slug: 'headshots',
          },
          {
            title: 'Branding & Commercial',
            description:
              'Lifestyle and commercial photography to elevate your business and brand',
            slug: 'branding',
          },
          {
            title: 'Lifestyle & Family',
            description:
              'Natural, authentic portraits capturing genuine moments with loved ones',
            slug: 'lifestyle',
          },
          {
            title: 'Creative & Specialty',
            description:
              'Unique sessions including underwater, boudoir, and fantasy photography',
            slug: 'specialty',
          },
        ],
      },
    },
  })
  console.log('  - Created/updated services section')

  // CTA Section
  await prisma.homepageContent.upsert({
    where: { section: 'cta' },
    update: {
      content: {
        heading: 'Ready to Capture Your Story?',
        subtitle:
          "Let's work together to create stunning images that tell your unique story",
        buttonText: 'Get in Touch',
        buttonUrl: '/contact',
      },
    },
    create: {
      section: 'cta',
      content: {
        heading: 'Ready to Capture Your Story?',
        subtitle:
          "Let's work together to create stunning images that tell your unique story",
        buttonText: 'Get in Touch',
        buttonUrl: '/contact',
      },
    },
  })
  console.log('  - Created/updated CTA section')

  console.log('\n✅ Homepage content seeding complete!')
}

// Allow running directly
if (require.main === module) {
  seedHomepageContent()
    .catch((e) => {
      console.error('Error seeding homepage content:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
