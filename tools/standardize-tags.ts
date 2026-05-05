// ABOUTME: Standardizes tag capitalization across the blog
// ABOUTME: Updates tag names to use proper title case

import { prisma } from '../lib/prisma'

const tagCapitalizationFixes = [
  { oldName: 'branding', newName: 'Branding' },
  { oldName: 'client closet', newName: 'Client Closet' },
  { oldName: 'fall', newName: 'Fall' },
  { oldName: 'family', newName: 'Family' },
  { oldName: 'golden hour', newName: 'Golden Hour' },
  { oldName: 'indoor', newName: 'Indoor' },
  { oldName: 'outdoor', newName: 'Outdoor' },
  { oldName: 'spring', newName: 'Spring' },
  { oldName: 'summer', newName: 'Summer' },
  { oldName: 'whimsical', newName: 'Whimsical' },
  { oldName: 'winter', newName: 'Winter' },
]

async function standardizeTags() {
  console.log('Standardizing tag capitalization...\n')

  for (const fix of tagCapitalizationFixes) {
    const tag = await prisma.blogTag.findFirst({
      where: { name: fix.oldName },
    })

    if (tag) {
      await prisma.blogTag.update({
        where: { id: tag.id },
        data: { name: fix.newName },
      })
      console.log(`✓ Updated: "${fix.oldName}" → "${fix.newName}"`)
    }
  }

  console.log('\nTag capitalization standardized!')

  await prisma.$disconnect()
}

standardizeTags().catch((error) => {
  console.error('Error standardizing tags:', error)
  process.exit(1)
})
