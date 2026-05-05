// ABOUTME: Script to backfill publishedAt for existing galleries
// ABOUTME: Sets publishedAt to current date for galleries where it is null

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.gallery.updateMany({
    where: { publishedAt: null },
    data: { publishedAt: new Date() },
  })
  console.log(`Updated ${result.count} galleries`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
