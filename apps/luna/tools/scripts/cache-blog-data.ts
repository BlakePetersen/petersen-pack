// ABOUTME: Exports blog data from database to JSON cache files
// ABOUTME: Creates reproducible seed data for deployments without re-scraping

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()
const CACHE_DIR = path.join(process.cwd(), 'prisma', 'seed-data', 'blog')

async function cacheBlogData() {
  console.log('Caching blog data to JSON...\n')

  // Create cache directory
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }

  // Export categories
  console.log('Exporting blog categories...')
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
  })
  fs.writeFileSync(
    path.join(CACHE_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2)
  )
  console.log(`  Exported ${categories.length} categories`)

  // Export tags
  console.log('Exporting blog tags...')
  const tags = await prisma.blogTag.findMany({
    orderBy: { name: 'asc' },
  })
  fs.writeFileSync(
    path.join(CACHE_DIR, 'tags.json'),
    JSON.stringify(tags, null, 2)
  )
  console.log(`  Exported ${tags.length} tags`)

  // Export posts with relations
  console.log('Exporting blog posts...')
  const posts = await prisma.blogPost.findMany({
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  // Transform to cacheable format
  const postsData = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    coverFocalX: post.coverFocalX,
    coverFocalY: post.coverFocalY,
    published: post.published,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    categories: post.categories.map((pc) => pc.category.slug),
    tags: post.tags.map((pt) => pt.tag.slug),
    images: post.images.map((img) => ({
      id: img.id,
      url: img.url,
      width: img.width,
      height: img.height,
      focalX: img.focalX,
      focalY: img.focalY,
      sortOrder: img.sortOrder,
    })),
  }))

  fs.writeFileSync(
    path.join(CACHE_DIR, 'posts.json'),
    JSON.stringify(postsData, null, 2)
  )
  console.log(`  Exported ${posts.length} posts`)

  // Count total images
  const totalImages = posts.reduce((sum, p) => sum + p.images.length, 0)
  console.log(`  Total images: ${totalImages}`)

  console.log(`\n✅ Blog data cached to ${CACHE_DIR}`)
}

cacheBlogData()
  .catch((e) => {
    console.error('Cache failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
