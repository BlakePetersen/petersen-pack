// ABOUTME: Debug script to check blog post image URLs in database
// ABOUTME: Verifies image URL formats and accessibility

import { prisma } from '@/lib/prisma'

async function main() {
  // Get a sample blog post with images
  const posts = await prisma.blogPost.findMany({
    take: 3,
    include: {
      images: {
        take: 3,
      },
    },
  })

  for (const post of posts) {
    console.log('\n=== Post:', post.title, '===')
    console.log('Cover image:', post.coverImage)
    console.log('Gallery images:')
    for (const img of post.images) {
      console.log(' -', img.url)
    }
  }

  // Count URL types
  const allImages = await prisma.blogPostImage.findMany()
  const blobUrls = allImages.filter((i) =>
    i.url.includes('blob.vercel-storage.com')
  )
  const localUrls = allImages.filter((i) => i.url.startsWith('/uploads/'))
  const otherUrls = allImages.filter(
    (i) =>
      !i.url.includes('blob.vercel-storage.com') &&
      !i.url.startsWith('/uploads/')
  )

  console.log('\n=== URL Distribution ===')
  console.log('Total images:', allImages.length)
  console.log('Blob URLs:', blobUrls.length)
  console.log('Local URLs:', localUrls.length)
  console.log('Other URLs:', otherUrls.length)

  if (otherUrls.length > 0) {
    console.log('\nSample other URLs:')
    for (const img of otherUrls.slice(0, 5)) {
      console.log(' -', img.url)
    }
  }

  await prisma.$disconnect()
}

main()
