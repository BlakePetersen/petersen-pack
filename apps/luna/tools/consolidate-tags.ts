// ABOUTME: Script to consolidate low-count tags into more general categories
// ABOUTME: Merges similar tags and removes very specific low-count tags

import { prisma } from '../lib/prisma'

// Tag consolidation map: oldTagName -> newTagName
const tagMergeMap: Record<string, string> = {
  // Nature/Outdoor consolidation
  'forest': 'nature',
  'redwoods': 'nature',
  'barn': 'nature',
  'ranch': 'nature',

  // Water/Beach
  'beach': 'outdoor',
  'lake': 'outdoor',

  // Indoor settings
  'cafe': 'indoor',
  'home session': 'indoor',

  // Animals
  'mixed breeds': 'dogs',

  // Fantasy/Whimsical
  'fantasy': 'whimsical',
  'disney': 'whimsical',

  // Family/People
  'grandma and grandson': 'family',
  'mama and baby': 'family',
  'best friends': 'family',

  // Flowers/Garden
  'yellow flowers': 'garden',

  // Time of day - remove very specific ones
  'morning': 'golden hour',

  // Location - East Bay cities
  'Danville': 'East Bay',
  'Lafayette': 'East Bay',
  'Walnut Creek': 'East Bay',
}

async function consolidateTags() {
  console.log('Starting tag consolidation...\n')

  for (const [oldTagName, newTagName] of Object.entries(tagMergeMap)) {
    console.log(`Merging "${oldTagName}" → "${newTagName}"`)

    // Find or create the target tag
    let targetTag = await prisma.blogTag.findFirst({
      where: { name: newTagName }
    })

    if (!targetTag) {
      console.log(`  Creating new tag: ${newTagName}`)
      targetTag = await prisma.blogTag.create({
        data: {
          name: newTagName,
          slug: newTagName.toLowerCase().replace(/\s+/g, '-')
        }
      })
    }

    // Find the old tag
    const oldTag = await prisma.blogTag.findFirst({
      where: { name: oldTagName },
      include: {
        posts: {
          select: {
            postId: true
          }
        }
      }
    })

    if (!oldTag) {
      console.log(`  ⚠️  Tag "${oldTagName}" not found, skipping`)
      continue
    }

    console.log(`  Found ${oldTag.posts.length} post(s) with "${oldTagName}"`)

    // For each post with the old tag, add the new tag (if not already present)
    for (const post of oldTag.posts) {
      // Check if post already has the target tag
      const existing = await prisma.blogPostTag.findFirst({
        where: {
          postId: post.postId,
          tagId: targetTag.id
        }
      })

      if (!existing) {
        await prisma.blogPostTag.create({
          data: {
            postId: post.postId,
            tagId: targetTag.id
          }
        })
        console.log(`    Added "${newTagName}" to post ${post.postId}`)
      }
    }

    // Delete all relationships with the old tag
    await prisma.blogPostTag.deleteMany({
      where: {
        tagId: oldTag.id
      }
    })

    // Delete the old tag
    await prisma.blogTag.delete({
      where: {
        id: oldTag.id
      }
    })

    console.log(`  ✓ Deleted old tag "${oldTagName}"\n`)
  }

  console.log('\nTag consolidation complete!')
  console.log('\nRunning analysis to see new tag counts...\n')

  // Show updated tag counts
  const tags = await prisma.blogTag.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  console.log('Updated tags:')
  console.log('='.repeat(60))
  const sortedByCount = [...tags].sort((a, b) => b._count.posts - a._count.posts)
  sortedByCount.forEach(tag => {
    console.log(`${tag.name.padEnd(30)} | ${tag._count.posts} post(s)`)
  })

  await prisma.$disconnect()
}

consolidateTags().catch(console.error)
