// ABOUTME: Clears all gallery images from database
// ABOUTME: Useful for re-seeding galleries with fresh data

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearImages() {
  const deletedCount = await prisma.image.deleteMany({})
  console.log(`✓ Deleted ${deletedCount.count} image records from database`)
}

clearImages()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
