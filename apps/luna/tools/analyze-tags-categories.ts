// ABOUTME: Analyzes current blog tags and categories
// ABOUTME: Shows counts and usage to help with consolidation

import { prisma } from '../lib/prisma'

async function analyzeTags() {
  // Get all categories with post counts
  const categories = await prisma.blogCategory.findMany({
    include: {
      posts: {
        select: {
          postId: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  console.log('\n=== CATEGORIES ===')
  console.log(`Total categories: ${categories.length}\n`)

  categories.forEach((category) => {
    console.log(`${category.name} (${category.slug})`)
    console.log(`  Posts: ${category.posts.length}`)
    console.log(`  Description: ${category.description || 'N/A'}`)
    console.log()
  })

  // Get all tags with post counts
  const tags = await prisma.blogTag.findMany({
    include: {
      posts: {
        select: {
          postId: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  console.log('\n=== TAGS ===')
  console.log(`Total tags: ${tags.length}\n`)

  tags.forEach((tag) => {
    console.log(`${tag.name} (${tag.slug})`)
    console.log(`  Posts: ${tag.posts.length}`)
    console.log()
  })

  await prisma.$disconnect()
}

analyzeTags().catch((error) => {
  console.error('Error analyzing tags:', error)
  process.exit(1)
})
