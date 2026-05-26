// ABOUTME: Seeds default usage rights tiers for contracts
// ABOUTME: Run with: pnpm prisma db seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultUsageRights = [
  {
    name: 'Personal Use Only',
    slug: 'personal-use',
    description:
      'Images may be used for personal purposes only. No commercial use, advertising, or resale permitted.',
    price: 0,
    sortOrder: 1,
  },
  {
    name: 'Social Media & Web',
    slug: 'social-media-web',
    description:
      'Personal use plus permission to post on social media and personal websites.',
    price: 50000, // $500
    sortOrder: 2,
  },
  {
    name: 'Print Advertising',
    slug: 'print-advertising',
    description:
      'Personal and social media use plus print advertising (magazines, brochures, billboards).',
    price: 150000, // $1,500
    sortOrder: 3,
  },
  {
    name: 'Unlimited Commercial',
    slug: 'unlimited-commercial',
    description:
      'Full commercial rights including advertising, resale, sublicensing, and unlimited distribution.',
    price: 500000, // $5,000
    sortOrder: 4,
  },
]

async function main() {
  console.log('Seeding usage rights...')

  for (const usageRight of defaultUsageRights) {
    await prisma.usageRight.upsert({
      where: { slug: usageRight.slug },
      update: usageRight,
      create: usageRight,
    })
    console.log(`✓ ${usageRight.name}`)
  }

  console.log('Usage rights seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
