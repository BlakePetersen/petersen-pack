// ABOUTME: Script to remove "[Category] // " prefix from blog post titles
// ABOUTME: Run with: pnpm tsx scripts/clean-blog-titles.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanBlogTitles() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, title: true },
  })

  // Match "Category // " or "[Category] // " at start of title
  const pattern = /^(\[.*?\]|[^/]+)\s*\/\/\s*/

  const postsToUpdate = posts.filter((post) => pattern.test(post.title))

  if (postsToUpdate.length === 0) {
    console.log('No posts need updating.')
    return
  }

  console.log(`Found ${postsToUpdate.length} posts to clean:\n`)

  for (const post of postsToUpdate) {
    const cleanTitle = post.title.replace(pattern, '')
    console.log(`  "${post.title}"`)
    console.log(`  → "${cleanTitle}"\n`)

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { title: cleanTitle },
    })
  }

  console.log(`✓ Updated ${postsToUpdate.length} posts.`)
}

cleanBlogTitles()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
