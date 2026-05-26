// ABOUTME: Check sample image URLs from database
// ABOUTME: Diagnostic tool for troubleshooting broken images

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUrls() {
  const images = await prisma.image.findMany({
    take: 10,
    select: { url: true, publicId: true },
  })

  console.log('\nSample Image URLs:')
  console.log('─'.repeat(70))
  for (const image of images) {
    console.log(`URL: ${image.url}`)
    console.log(`PublicID: ${image.publicId}`)
    console.log('─'.repeat(70))
  }
}

checkUrls()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
