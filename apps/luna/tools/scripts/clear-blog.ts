// ABOUTME: Script to clear all blog posts from database
// ABOUTME: Useful for re-importing posts with corrected data

import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'blog')

async function main() {
  console.log('Clearing all blog posts from database...')

  // Delete all blog post images
  const deletedImages = await prisma.blogPostImage.deleteMany({})
  console.log(`✓ Deleted ${deletedImages.count} blog post images from database`)

  // Delete all blog post-category relationships
  const deletedPostCategories = await prisma.blogPostCategory.deleteMany({})
  console.log(
    `✓ Deleted ${deletedPostCategories.count} post-category relationships`
  )

  // Delete all blog post-tag relationships
  const deletedPostTags = await prisma.blogPostTag.deleteMany({})
  console.log(`✓ Deleted ${deletedPostTags.count} post-tag relationships`)

  // Delete all blog posts
  const deletedPosts = await prisma.blogPost.deleteMany({})
  console.log(`✓ Deleted ${deletedPosts.count} blog posts`)

  // Delete uploaded image files
  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR)
    let deletedFileCount = 0
    for (const file of files) {
      fs.unlinkSync(path.join(UPLOADS_DIR, file))
      deletedFileCount++
    }
    console.log(`✓ Deleted ${deletedFileCount} image files from disk`)
  }

  console.log('\nBlog posts cleared successfully!')
  console.log('Categories and tags were kept for reuse.')
}

main()
  .then(() => {
    console.log('\n✓ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error)
    process.exit(1)
  })
