// ABOUTME: Script to analyze blog tags and their usage counts
// ABOUTME: Helps identify low-count tags for consolidation

import { prisma } from '../lib/prisma'

async function analyzeTags() {
  const tags = await prisma.blogTag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  console.log('Current tags (sorted by name):')
  console.log('='.repeat(60))
  tags.forEach((tag) => {
    console.log(`${tag.name.padEnd(30)} | ${tag._count.posts} post(s)`)
  })

  console.log('\n\nTags sorted by post count:')
  console.log('='.repeat(60))
  const sortedByCount = [...tags].sort(
    (a, b) => b._count.posts - a._count.posts
  )
  sortedByCount.forEach((tag) => {
    console.log(`${tag.name.padEnd(30)} | ${tag._count.posts} post(s)`)
  })

  console.log('\n\nLow-count tags (3 or fewer posts):')
  console.log('='.repeat(60))
  const lowCount = tags.filter((tag) => tag._count.posts <= 3)
  lowCount.forEach((tag) => {
    console.log(
      `${tag.name.padEnd(30)} | ${tag._count.posts} post(s) | ID: ${tag.id}`
    )
  })

  await prisma.$disconnect()
}

analyzeTags().catch(console.error)
