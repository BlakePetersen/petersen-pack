// ABOUTME: Check About section content in database
// ABOUTME: Helper script to debug image rendering issues

import { prisma } from '../../lib/prisma'

async function main() {
  const aboutContent = await prisma.homepageContent.findUnique({
    where: { section: 'about' },
    include: {
      image: true,
    },
  })

  console.log('About Content:')
  console.log(JSON.stringify(aboutContent, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
