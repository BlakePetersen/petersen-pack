// ABOUTME: Debug script to check what AboutSection receives
// ABOUTME: Simulates what the homepage passes to AboutSectionWithSession

import { prisma } from '../../lib/prisma'

async function main() {
  console.log('Fetching about content as homepage does...\n')

  const aboutContent = await prisma.homepageContent.findUnique({
    where: { section: 'about' },
    include: {
      image: true,
    },
  })

  console.log(
    'aboutContent.image:',
    JSON.stringify(aboutContent?.image, null, 2)
  )
  console.log(
    '\naboutContent.content.imageUrl:',
    (aboutContent?.content as any)?.imageUrl
  )
  console.log('\nWill use EditableImage?', !!aboutContent?.image)
  console.log(
    'Image URL source:',
    aboutContent?.image?.url || (aboutContent?.content as any)?.imageUrl
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
