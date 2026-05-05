// ABOUTME: Seed script for generating mock contracts, galleries, and related data
// ABOUTME: Run with: pnpm tsx prisma/seed-contracts.ts

import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const SHOOT_TYPES = [
  'Wedding',
  'Engagement',
  'Portrait',
  'Family',
  'Maternity',
  'Newborn',
  'Corporate',
  'Event',
  'Fashion',
  'Product',
]

const SHOOT_LOCATIONS = [
  'Central Park, NYC',
  'Golden Gate Park, SF',
  'Studio Downtown',
  'Beachfront Venue',
  'Mountain Lodge',
  'Urban Rooftop',
  'Botanical Gardens',
  'Historic Estate',
  'Client Home',
  'Art Gallery',
]

async function seedContracts() {
  console.log('🌱 Seeding contracts and galleries...')

  // Get usage rights
  const usageRights = await prisma.usageRight.findMany()
  if (usageRights.length === 0) {
    console.error('❌ No usage rights found. Run seed-usage-rights.ts first')
    return
  }

  // Create demo clients (or use existing)
  console.log('👥 Creating demo clients...')
  const clients = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const email = `client${i + 1}@demo.com`

      // Check if exists
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return existing

      return prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          role: 'CLIENT',
          password: await hash('demo123', 10),
        },
      })
    })
  )
  console.log(`✅ Created ${clients.length} clients`)

  // Generate contracts with varying statuses
  console.log('📄 Creating contracts...')
  const contractStatuses = ['DRAFT', 'SENT', 'SIGNED', 'SIGNED'] as const
  const contracts = []
  let createdCount = 0
  let skippedCount = 0

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]

    // Check if client already has contracts - skip if they do
    const existingContracts = await prisma.contract.findMany({
      where: { clientId: client.id },
    })

    if (existingContracts.length > 0) {
      console.log(
        `  ⏭️  Skipping ${client.email} - already has ${existingContracts.length} contract(s)`
      )
      contracts.push(...existingContracts)
      skippedCount++
      continue
    }

    const status = contractStatuses[i % contractStatuses.length]
    const shootType = faker.helpers.arrayElement(SHOOT_TYPES)
    const totalAmount = faker.number.int({ min: 150000, max: 500000 }) // $1,500-$5,000
    const depositPercent = faker.helpers.arrayElement([25, 30, 50])
    const depositAmount = Math.round(totalAmount * (depositPercent / 100))
    const shootDate = faker.date.future({ years: 1 })

    const contract = await prisma.contract.create({
      data: {
        clientId: client.id,
        shootType,
        shootDate,
        shootLocation: faker.helpers.arrayElement(SHOOT_LOCATIONS),
        sessionDuration: `${faker.number.int({ min: 2, max: 8 })} hours`,
        deliverablesDescription: `${faker.number.int({ min: 50, max: 300 })} professionally edited high-resolution photos delivered via online gallery`,
        totalAmount,
        depositAmount,
        retouchesIncluded: faker.number.int({ min: 5, max: 20 }),
        pricePerExtraRetouch: faker.number.int({ min: 5000, max: 15000 }), // $50-$150
        downloadQuota: faker.number.int({ min: 30, max: 100 }),
        maxFileSizePx: faker.helpers.arrayElement([2000, 3000, 4000, 6000]),
        status,
        signedAt: status === 'SIGNED' ? faker.date.recent({ days: 30 }) : null,
        sentAt: status !== 'DRAFT' ? faker.date.recent({ days: 45 }) : null,
        usageRights: {
          create: faker.helpers
            .arrayElements(usageRights, { min: 1, max: 2 })
            .map((ur) => ({
              usageRightId: ur.id,
            })),
        },
      },
    })

    contracts.push(contract)
    createdCount++
  }
  console.log(
    `✅ Contracts: ${createdCount} created, ${skippedCount} skipped (${contracts.length} total)`
  )

  // Create galleries for SIGNED contracts
  console.log('🖼️  Creating client galleries...')
  const signedContracts = contracts.filter((c) => c.status === 'SIGNED')
  let galleriesCreated = 0
  let galleriesSkipped = 0

  for (const contract of signedContracts) {
    // Check if contract already has a gallery
    const existingGallery = await prisma.clientGallery.findFirst({
      where: { contractId: contract.id },
      include: { images: true },
    })

    if (existingGallery) {
      console.log(
        `  ⏭️  Skipping gallery for contract ${contract.id} - already has gallery with ${existingGallery.images.length} images`
      )
      galleriesSkipped++
      continue
    }

    const client = clients.find((c) => c.id === contract.clientId)!
    const galleryTitle = `${client.name?.split(' ')[0]}'s ${contract.shootType}`
    const slug = `${contract.shootType.toLowerCase()}-${faker.string.alphanumeric(6)}`

    // Some galleries are linked, some are not yet
    const shouldLink = faker.datatype.boolean()
    const imageCount = faker.number.int({ min: 20, max: 80 })

    const gallery = await prisma.clientGallery.create({
      data: {
        title: galleryTitle,
        slug,
        clientId: client.id,
        status: 'APPROVED',
        contractId: shouldLink ? contract.id : null,
        expiresAt: shouldLink ? faker.date.soon({ days: 30 }) : null,
        downloadQuotaUsed: shouldLink
          ? faker.number.int({ min: 0, max: contract.downloadQuota / 2 })
          : 0,
        finalPaymentStatus: shouldLink
          ? faker.helpers.arrayElement(['PENDING', 'COMPLETED', null])
          : null,
      },
    })

    galleriesCreated++

    // Create mock images for the gallery
    console.log(`  📸 Creating ${imageCount} images for ${galleryTitle}...`)
    const images = await Promise.all(
      Array.from({ length: imageCount }, async (_, i) => {
        return prisma.clientImage.create({
          data: {
            clientGalleryId: gallery.id,
            url: `/uploads/galleries/${slug}/image-${i + 1}.jpg`,
            altText: faker.helpers.arrayElement([
              null,
              faker.lorem.words(3),
              faker.lorem.words(2),
            ]),
            isFavorite: faker.datatype.boolean(0.3), // 30% are favorites
            sortOrder: i,
          },
        })
      })
    )

    // Add some retouch requests
    if (shouldLink) {
      const retouchCount = faker.number.int({ min: 2, max: 8 })
      const selectedImages = faker.helpers.arrayElements(
        images,
        Math.min(retouchCount, images.length)
      )

      for (const image of selectedImages) {
        await prisma.retouchRequest.create({
          data: {
            clientImageId: image.id,
            clientGalleryId: gallery.id,
            notes: faker.helpers.arrayElement([
              'Please brighten the background slightly',
              'Can you remove the person in the background?',
              'Would love to see this in black and white',
              'Please enhance the colors a bit more',
              'Could you crop this tighter?',
              'Minor blemish removal please',
            ]),
            status: faker.helpers.arrayElement([
              'PENDING',
              'PENDING',
              'COMPLETED',
              'COMPLETED',
            ]),
          },
        })
      }
    }
  }

  console.log(
    `✅ Galleries: ${galleriesCreated} created, ${galleriesSkipped} skipped`
  )
  console.log('\n🎉 Seed complete!')
  console.log(`
📊 Summary:
  - ${clients.length} clients
  - ${contracts.length} contracts
    - ${contracts.filter((c) => c.status === 'DRAFT').length} DRAFT
    - ${contracts.filter((c) => c.status === 'SENT').length} SENT
    - ${contracts.filter((c) => c.status === 'SIGNED').length} SIGNED
  - ${signedContracts.length} galleries with images
  `)
}

async function main() {
  try {
    await seedContracts()
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
