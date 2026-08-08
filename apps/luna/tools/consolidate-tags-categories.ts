// ABOUTME: Consolidates blog tags and categories into generalized terms
// ABOUTME: Merges similar categories and tags to simplify organization

import { prisma } from '../lib/prisma'

type CategoryMapping = {
  newCategory: { name: string; slug: string; description: string }
  oldSlugs: string[]
}

type TagMapping = {
  newTag: { name: string; slug: string }
  oldSlugs: string[]
}

const categoryMappings: CategoryMapping[] = [
  {
    newCategory: {
      name: 'Portraits',
      slug: 'portraits',
      description:
        'Professional portrait photography including seniors, kids, and headshots',
    },
    oldSlugs: ['portraiture', 'senior-portrait', 'minis'],
  },
  {
    newCategory: {
      name: 'Family & Lifestyle',
      slug: 'family-lifestyle',
      description: 'Family sessions and lifestyle photography',
    },
    oldSlugs: ['family', 'lifestyle', 'kids'],
  },
  {
    newCategory: {
      name: 'Maternity & Newborn',
      slug: 'maternity-newborn',
      description: 'Maternity, newborn, and baby photography',
    },
    oldSlugs: ['maternity', 'newborn', 'milk-bath'],
  },
  {
    newCategory: {
      name: 'Weddings & Engagements',
      slug: 'weddings-engagements',
      description: 'Wedding and engagement photography',
    },
    oldSlugs: ['wedding', 'engagements'],
  },
  {
    newCategory: {
      name: 'Events',
      slug: 'events',
      description: 'Event photography',
    },
    oldSlugs: ['events'],
  },
  {
    newCategory: {
      name: 'Pets & Animals',
      slug: 'pets-animals',
      description: 'Pet photography and animal rescue stories',
    },
    oldSlugs: ['dogs', 'horses', 'rescue-tales'],
  },
  {
    newCategory: {
      name: 'Travel & Landscape',
      slug: 'travel-landscape',
      description: 'Travel photography and landscapes',
    },
    oldSlugs: ['travel', 'landscape', 'bay-area'],
  },
  {
    newCategory: {
      name: 'Creative & Conceptual',
      slug: 'creative-conceptual',
      description:
        'Creative and conceptual photography including underwater, yoga, and fantasy',
    },
    oldSlugs: ['fantasy', 'underwater', 'yoga'],
  },
]

const tagMappings: TagMapping[] = [
  {
    newTag: { name: 'East Bay', slug: 'east-bay' },
    oldSlugs: ['east-bay', 'berkeley', 'san-francisco', 'mount-diablo'],
  },
  {
    newTag: { name: 'Lake Tahoe', slug: 'lake-tahoe' },
    oldSlugs: ['lake-tahoe'],
  },
  {
    newTag: { name: 'Travel', slug: 'travel' },
    oldSlugs: ['kauai', 'mexico', 'napa'],
  },
  {
    newTag: { name: 'Fall', slug: 'fall' },
    oldSlugs: ['fall'],
  },
  {
    newTag: { name: 'Winter', slug: 'winter' },
    oldSlugs: ['winter', 'snow', 'christmas'],
  },
  {
    newTag: { name: 'Spring', slug: 'spring' },
    oldSlugs: ['spring'],
  },
  {
    newTag: { name: 'Summer', slug: 'summer' },
    oldSlugs: ['summer'],
  },
  {
    newTag: { name: 'Whimsical', slug: 'whimsical' },
    oldSlugs: ['whimsical', 'fashion', 'victorian'],
  },
  {
    newTag: { name: 'Outdoor', slug: 'outdoor' },
    oldSlugs: ['outdoor', 'nature', 'garden', 'hills'],
  },
  {
    newTag: { name: 'Indoor', slug: 'indoor' },
    oldSlugs: ['indoor'],
  },
  {
    newTag: { name: 'Conceptual', slug: 'conceptual' },
    oldSlugs: ['conceptual-portraiture', 'adventure'],
  },
  {
    newTag: { name: 'Pets', slug: 'pets' },
    oldSlugs: ['dogs', 'animals-and-people', 'animal-rescue'],
  },
  {
    newTag: { name: 'Client Closet', slug: 'client-closet' },
    oldSlugs: ['client-closet'],
  },
  {
    newTag: { name: 'Branding', slug: 'branding' },
    oldSlugs: ['branding'],
  },
  {
    newTag: { name: 'Golden Hour', slug: 'golden-hour' },
    oldSlugs: ['golden-hour', 'sunset'],
  },
  {
    newTag: { name: 'Family', slug: 'family' },
    oldSlugs: ['family', 'lifestyle'],
  },
]

async function consolidate() {
  console.log('Starting consolidation...\n')

  // Consolidate categories
  console.log('=== CONSOLIDATING CATEGORIES ===\n')

  for (const mapping of categoryMappings) {
    console.log(`Processing: ${mapping.newCategory.name}`)

    // Find or create the new category
    let newCategory = await prisma.blogCategory.findUnique({
      where: { slug: mapping.newCategory.slug },
    })

    if (!newCategory) {
      newCategory = await prisma.blogCategory.create({
        data: mapping.newCategory,
      })
      console.log(`  Created new category: ${newCategory.name}`)
    } else {
      console.log(`  Using existing category: ${newCategory.name}`)
    }

    // Find all old categories
    const oldCategories = await prisma.blogCategory.findMany({
      where: {
        slug: { in: mapping.oldSlugs },
      },
      include: {
        posts: true,
      },
    })

    // Move all posts from old categories to new category
    for (const oldCategory of oldCategories) {
      if (oldCategory.id === newCategory.id) continue

      console.log(
        `  Migrating ${oldCategory.posts.length} posts from "${oldCategory.name}"`
      )

      for (const postLink of oldCategory.posts) {
        // Check if post already has the new category
        const existing = await prisma.blogPostCategory.findUnique({
          where: {
            postId_categoryId: {
              postId: postLink.postId,
              categoryId: newCategory.id,
            },
          },
        })

        if (!existing) {
          await prisma.blogPostCategory.create({
            data: {
              postId: postLink.postId,
              categoryId: newCategory.id,
            },
          })
        }
      }

      // Delete old category links
      await prisma.blogPostCategory.deleteMany({
        where: { categoryId: oldCategory.id },
      })

      // Delete old category
      await prisma.blogCategory.delete({
        where: { id: oldCategory.id },
      })

      console.log(`  Deleted old category: ${oldCategory.name}`)
    }

    console.log()
  }

  // Consolidate tags
  console.log('=== CONSOLIDATING TAGS ===\n')

  for (const mapping of tagMappings) {
    console.log(`Processing: ${mapping.newTag.name}`)

    // Find or create the new tag
    let newTag = await prisma.blogTag.findUnique({
      where: { slug: mapping.newTag.slug },
    })

    if (!newTag) {
      newTag = await prisma.blogTag.create({
        data: mapping.newTag,
      })
      console.log(`  Created new tag: ${newTag.name}`)
    } else {
      console.log(`  Using existing tag: ${newTag.name}`)
    }

    // Find all old tags
    const oldTags = await prisma.blogTag.findMany({
      where: {
        slug: { in: mapping.oldSlugs },
      },
      include: {
        posts: true,
      },
    })

    // Move all posts from old tags to new tag
    for (const oldTag of oldTags) {
      if (oldTag.id === newTag.id) continue

      console.log(
        `  Migrating ${oldTag.posts.length} posts from "${oldTag.name}"`
      )

      for (const postLink of oldTag.posts) {
        // Check if post already has the new tag
        const existing = await prisma.blogPostTag.findUnique({
          where: {
            postId_tagId: {
              postId: postLink.postId,
              tagId: newTag.id,
            },
          },
        })

        if (!existing) {
          await prisma.blogPostTag.create({
            data: {
              postId: postLink.postId,
              tagId: newTag.id,
            },
          })
        }
      }

      // Delete old tag links
      await prisma.blogPostTag.deleteMany({
        where: { tagId: oldTag.id },
      })

      // Delete old tag
      await prisma.blogTag.delete({
        where: { id: oldTag.id },
      })

      console.log(`  Deleted old tag: ${oldTag.name}`)
    }

    console.log()
  }

  console.log('Consolidation complete!\n')

  // Show final counts
  const finalCategoryCount = await prisma.blogCategory.count()
  const finalTagCount = await prisma.blogTag.count()

  console.log(`Final category count: ${finalCategoryCount}`)
  console.log(`Final tag count: ${finalTagCount}`)

  await prisma.$disconnect()
}

consolidate().catch((error) => {
  console.error('Error consolidating:', error)
  process.exit(1)
})
