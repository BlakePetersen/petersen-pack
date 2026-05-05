// ABOUTME: Database seed script
// ABOUTME: Creates initial galleries and admin user

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedServiceContentBlocks } from './seeds/service-content-blocks'
import { seedHomepageContent } from './seeds/homepage-content'

const prisma = new PrismaClient()

const galleries = [
  {
    title: 'Animals',
    slug: 'animals',
    description:
      'Professional animal photography capturing the personality and spirit of your pets',
    featured: true,
  },
  {
    title: 'Boudoir',
    slug: 'boudoir',
    description: 'Elegant and empowering boudoir photography',
    featured: false,
  },
  {
    title: 'Branding',
    slug: 'branding',
    description:
      'Professional branding and lifestyle photography for businesses',
    featured: true,
  },
  {
    title: 'Headshots',
    slug: 'headshots',
    description:
      'Professional headshots for actors, corporate professionals, and LinkedIn profiles',
    featured: true,
  },
  {
    title: 'Fantasy',
    slug: 'fantasy',
    description:
      'Creative and fantastical photography bringing imagination to life',
    featured: false,
  },
  {
    title: 'Portraits',
    slug: 'lifestyle-portraiture',
    description:
      'Natural, authentic lifestyle portraits and family photography',
    featured: true,
  },
  {
    title: 'Travel',
    slug: 'travel',
    description: 'Travel photography capturing destinations and adventures',
    featured: false,
  },
  {
    title: 'Yoga & Dance',
    slug: 'yoga-dance',
    description: 'Dynamic photography of yoga practice and dance movement',
    featured: true,
  },
  {
    title: 'Underwater',
    slug: 'underwater',
    description: 'Unique underwater photography sessions',
    featured: true,
  },
  {
    title: 'Rescue Tales',
    slug: 'rescue-tales',
    description: 'Special project featuring rescue animals and their stories',
    featured: false,
  },
]

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
  },
]

const pricingCategories = [
  {
    name: 'Headshots',
    slug: 'headshots',
    description:
      'Professional headshots for actors, corporate, and LinkedIn. Make a powerful first impression with images that capture your authentic confidence and professional presence.',
    packages: [
      {
        name: 'Essential Headshots',
        price: 350,
        duration: '45 minutes',
        features: [
          '1-2 outfit changes',
          '20-30 edited images',
          'Online gallery for selection',
          '3 high-resolution retouched images',
          'Digital download',
        ],
        isPopular: false,
      },
      {
        name: 'Premium Headshots',
        price: 550,
        duration: '90 minutes',
        features: [
          '3-4 outfit changes',
          '40-60 edited images',
          'Online gallery for selection',
          '5 high-resolution retouched images',
          'Digital download',
          'Professional hair & makeup consultation',
        ],
        isPopular: true,
      },
      {
        name: 'Team Headshots',
        price: 2500,
        duration: 'Half day',
        features: [
          'Up to 10 employees included',
          '$250 per additional employee',
          'Consistent lighting and backdrop',
          'Individual attention for each person',
          'All high-resolution retouched images',
          'Online gallery for team access',
          'Perfect for company websites and LinkedIn',
        ],
        isPopular: false,
      },
    ],
  },
  {
    name: 'Branding & Commercial',
    slug: 'branding-commercial',
    description:
      'Lifestyle and commercial photography for businesses. Elevate your brand with compelling visual storytelling that connects with your audience and showcases what makes your business unique.',
    packages: [
      {
        name: 'Starter Branding',
        price: 650,
        duration: '2 hours',
        features: [
          'Pre-session planning consultation',
          'Multiple locations/setups',
          '50-75 edited images',
          '10 high-resolution images',
          'Usage rights for marketing',
          'Digital download',
        ],
        isPopular: false,
      },
      {
        name: 'Complete Branding',
        price: 1200,
        duration: '4 hours',
        features: [
          'Pre-session planning consultation',
          'Multiple locations/setups',
          '100-150 edited images',
          '25 high-resolution images',
          'Usage rights for marketing',
          'Digital download',
          'Brand guide alignment',
          'Team photos included',
        ],
        isPopular: true,
      },
    ],
  },
  {
    name: 'Lifestyle & Family',
    slug: 'lifestyle-family',
    description:
      'Natural, authentic lifestyle portraits and family photography. Preserve precious moments and genuine connections with timeless images that celebrate your story and the love you share.',
    packages: [
      {
        name: 'Lifestyle Session',
        price: 450,
        duration: '60 minutes',
        features: [
          'Location of your choice',
          '30-40 edited images',
          'Online gallery',
          '5 high-resolution images',
          'Digital download',
          'Perfect for families, couples, or individuals',
        ],
        isPopular: false,
      },
      {
        name: 'Extended Lifestyle',
        price: 750,
        duration: '2 hours',
        features: [
          'Multiple locations',
          '60-80 edited images',
          'Online gallery',
          '10 high-resolution images',
          'Digital download',
          'Outfit change options',
          'Extended family groups welcome',
        ],
        isPopular: false,
      },
    ],
  },
  {
    name: 'Animals & Pets',
    slug: 'animals-pets',
    description:
      'Professional pet photography capturing personality and spirit. Celebrate the bond with your furry companions through portraits that showcase their unique character and the joy they bring to your life.',
    packages: [
      {
        name: 'Pet Portrait Session',
        price: 400,
        duration: '60 minutes',
        features: [
          'Outdoor location',
          '25-35 edited images',
          'Online gallery',
          '5 high-resolution images',
          'Digital download',
          'Multiple pets welcome',
        ],
        isPopular: false,
      },
      {
        name: 'Pets & People',
        price: 500,
        duration: '90 minutes',
        features: [
          'Outdoor location',
          '40-50 edited images',
          'Online gallery',
          '8 high-resolution images',
          'Digital download',
          'Combination of pets and family',
          'Multiple pets welcome',
        ],
        isPopular: false,
      },
    ],
  },
  {
    name: 'Creative & Specialty',
    slug: 'creative-specialty',
    description:
      'Unique sessions including underwater, boudoir, and fantasy. Push creative boundaries and explore extraordinary imagery that transforms your vision into stunning artistic reality.',
    packages: [
      {
        name: 'Underwater Session',
        price: 800,
        duration: '2 hours',
        features: [
          'Pool or controlled water environment',
          'Unique underwater imagery',
          '30-40 edited images',
          '10 high-resolution images',
          'Digital download',
          'Safety equipment provided',
        ],
        isPopular: true,
      },
      {
        name: 'Boudoir Session',
        price: 700,
        duration: '2 hours',
        features: [
          'Private studio setting',
          'Professional guidance and posing',
          '40-50 edited images',
          '10 high-resolution retouched images',
          'Digital download',
          'Hair & makeup available (additional fee)',
        ],
        isPopular: false,
      },
      {
        name: 'Fantasy/Creative Session',
        price: 650,
        duration: '2 hours',
        features: [
          'Custom concept development',
          'Creative editing and compositing',
          '30-40 edited images',
          '8 high-resolution images',
          'Digital download',
          'Props and styling consultation',
        ],
        isPopular: false,
      },
    ],
  },
]

const addOns = [
  {
    name: 'Additional Retouched Images',
    price: '50',
    unit: 'per image',
  },
  {
    name: 'Professional Hair & Makeup',
    price: '150',
    unit: 'per session',
  },
  {
    name: 'Rush Delivery (7 days)',
    price: '200',
    unit: 'per session',
  },
  {
    name: 'Print Products',
    price: 'varies',
    unit: 'contact for pricing',
  },
  {
    name: 'Extended Usage Rights',
    price: 'varies',
    unit: 'contact for details',
  },
]

const usageRights = [
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
  console.log('Starting database seed...')

  // Clear existing data (delete in order to respect foreign key constraints)
  await prisma.pricingPackage.deleteMany()
  await prisma.pricingCategory.deleteMany()
  await prisma.pricingAddOn.deleteMany()
  await prisma.image.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.contract.deleteMany() // Delete contracts before users
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ashleypetersenphoto.com',
      password: hashedPassword,
      name: 'Ashley Petersen',
      role: 'ADMIN',
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // Create galleries with proper sorting
  for (let i = 0; i < galleries.length; i++) {
    const gallery = galleries[i]
    await prisma.gallery.create({
      data: {
        ...gallery,
        sortOrder: i,
      },
    })
    console.log(`Created gallery: ${gallery.title}`)
  }

  // Create pricing categories and packages
  for (let i = 0; i < pricingCategories.length; i++) {
    const category = pricingCategories[i]
    const { packages, ...categoryData } = category

    const createdCategory = await prisma.pricingCategory.create({
      data: {
        ...categoryData,
        sortOrder: i,
      },
    })
    console.log(`Created pricing category: ${category.name}`)

    // Create packages for this category
    for (let j = 0; j < packages.length; j++) {
      const pkg = packages[j]
      await prisma.pricingPackage.create({
        data: {
          ...pkg,
          categoryId: createdCategory.id,
          sortOrder: j,
        },
      })
      console.log(`  - Created package: ${pkg.name}`)
    }
  }

  // Create add-ons
  for (let i = 0; i < addOns.length; i++) {
    const addOn = addOns[i]
    await prisma.pricingAddOn.create({
      data: {
        ...addOn,
        sortOrder: i,
      },
    })
    console.log(`Created add-on: ${addOn.name}`)
  }

  // Create usage rights
  for (const usageRight of usageRights) {
    await prisma.usageRight.upsert({
      where: { slug: usageRight.slug },
      update: usageRight,
      create: usageRight,
    })
    console.log(`Created usage right: ${usageRight.name}`)
  }

  // Seed service content blocks
  await seedServiceContentBlocks()

  // Seed homepage content
  await seedHomepageContent()

  // Create hero slides
  for (let i = 0; i < heroSlides.length; i++) {
    const slide = heroSlides[i]
    await prisma.heroSlide.create({
      data: {
        ...slide,
        sortOrder: i,
        isActive: true,
      },
    })
    console.log(`Created hero slide: ${slide.title}`)
  }

  console.log(`\n✅ Seed complete!`)
  console.log(`Created:`)
  console.log(`  - Admin user`)
  console.log(`  - ${galleries.length} galleries`)
  console.log(`  - ${heroSlides.length} hero slides`)
  console.log(`  - ${pricingCategories.length} pricing categories`)
  console.log(
    `  - ${pricingCategories.reduce((sum, cat) => sum + cat.packages.length, 0)} pricing packages`
  )
  console.log(`  - ${addOns.length} add-ons\n`)
  console.log('Admin Login:')
  console.log('  Email: admin@ashleypetersenphoto.com')
  console.log('  Password: admin123')
  console.log('\nNext steps:')
  console.log('1. Start the dev server: npm run dev')
  console.log('2. Visit http://localhost:3000/login')
  console.log('3. Sign in and upload images\n')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
