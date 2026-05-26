// ABOUTME: Scrapes gallery and blog images from database backup
// ABOUTME: Creates mapping files for reusable seeding

import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

interface ImageData {
  id: string
  url: string
  publicId: string | null
  altText: string | null
  width: number | null
  height: number | null
  focalX: number
  focalY: number
  sortOrder: number
  galleryId?: string | null
  postId?: string
}

interface GalleryData {
  id: string
  title: string
  slug: string
  description: string | null
  featured: boolean
  sortOrder: number
  coverImage: string | null
  images: ImageData[]
}

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  images: ImageData[]
}

interface ImageMapping {
  galleries: GalleryData[]
  blogPosts: BlogPostData[]
  scrapedAt: string
}

const OUTPUT_DIR = path.join(process.cwd(), 'prisma/seeds/data')
const MAPPING_FILE = path.join(OUTPUT_DIR, 'image-mapping.json')

const prisma = new PrismaClient()

async function extractDataFromCurrentDb(): Promise<ImageMapping> {
  console.log('Fetching galleries with images...')
  const galleries = await prisma.gallery.findMany({
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  console.log('Fetching blog posts with images...')
  const blogPosts = await prisma.blogPost.findMany({
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  const galleryData: GalleryData[] = galleries.map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    description: gallery.description,
    featured: gallery.featured,
    sortOrder: gallery.sortOrder,
    coverImage: gallery.coverImage,
    images: gallery.images.map((img) => ({
      id: img.id,
      url: img.url,
      publicId: img.publicId,
      altText: img.altText,
      width: img.width,
      height: img.height,
      focalX: img.focalX ?? 0.5,
      focalY: img.focalY ?? 0.5,
      sortOrder: img.sortOrder,
      galleryId: img.galleryId ?? undefined,
    })),
  }))

  const blogPostData: BlogPostData[] = blogPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    images: post.images.map((img) => ({
      id: img.id,
      url: img.url,
      publicId: img.publicId,
      altText: img.altText,
      width: img.width,
      height: img.height,
      focalX: img.focalX ?? 0.5,
      focalY: img.focalY ?? 0.5,
      sortOrder: img.sortOrder,
      postId: img.postId,
    })),
  }))

  return {
    galleries: galleryData,
    blogPosts: blogPostData,
    scrapedAt: new Date().toISOString(),
  }
}

async function saveMapping(mapping: ImageMapping): Promise<void> {
  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }

  // Save mapping file
  await writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2))

  const totalGalleryImages = mapping.galleries.reduce(
    (sum, g) => sum + g.images.length,
    0
  )
  const totalBlogImages = mapping.blogPosts.reduce(
    (sum, p) => sum + p.images.length,
    0
  )

  console.log('\n✅ Image mapping created successfully!')
  console.log(`   Saved to: ${MAPPING_FILE}`)
  console.log(
    `   Galleries: ${mapping.galleries.length} (${totalGalleryImages} images)`
  )
  console.log(
    `   Blog Posts: ${mapping.blogPosts.length} (${totalBlogImages} images)`
  )
}

async function generateSeedFile(mapping: ImageMapping): Promise<void> {
  const seedFilePath = path.join(process.cwd(), 'prisma/seeds/images.ts')

  const seedContent = `// ABOUTME: Seeds gallery and blog images from scraped mapping
// ABOUTME: Auto-generated from scrape-gallery-images script

import { PrismaClient } from '@prisma/client'
import imageMapping from './data/image-mapping.json'

const prisma = new PrismaClient()

export async function seedImages() {
  console.log('Seeding images from mapping...')

  let galleryImageCount = 0
  let blogImageCount = 0

  // Seed gallery images
  for (const gallery of imageMapping.galleries) {
    // Find gallery by slug (since IDs will be different)
    const dbGallery = await prisma.gallery.findUnique({
      where: { slug: gallery.slug }
    })

    if (!dbGallery) {
      console.warn(\`Gallery not found: \${gallery.slug}\`)
      continue
    }

    // Update cover image if it exists
    if (gallery.coverImage) {
      await prisma.gallery.update({
        where: { id: dbGallery.id },
        data: { coverImage: gallery.coverImage }
      })
    }

    // Create images for this gallery
    for (const image of gallery.images) {
      await prisma.image.create({
        data: {
          url: image.url,
          publicId: image.publicId,
          altText: image.altText || \`\${gallery.title} - Image \${image.sortOrder + 1}\`,
          width: image.width,
          height: image.height,
          focalX: image.focalX,
          focalY: image.focalY,
          sortOrder: image.sortOrder,
          galleryId: dbGallery.id
        }
      })
      galleryImageCount++
    }

    console.log(\`  - Seeded \${gallery.images.length} images for gallery: \${gallery.title}\`)
  }

  // Seed blog post images
  for (const post of imageMapping.blogPosts) {
    // Find blog post by slug
    const dbPost = await prisma.blogPost.findUnique({
      where: { slug: post.slug }
    })

    if (!dbPost) {
      console.warn(\`Blog post not found: \${post.slug}\`)
      continue
    }

    // Update cover image if it exists
    if (post.coverImage) {
      await prisma.blogPost.update({
        where: { id: dbPost.id },
        data: { coverImage: post.coverImage }
      })
    }

    // Create images for this blog post
    for (const image of post.images) {
      await prisma.blogPostImage.create({
        data: {
          url: image.url,
          publicId: image.publicId,
          altText: image.altText || \`\${post.title} - Image \${image.sortOrder + 1}\`,
          width: image.width,
          height: image.height,
          focalX: image.focalX,
          focalY: image.focalY,
          sortOrder: image.sortOrder,
          postId: dbPost.id
        }
      })
      blogImageCount++
    }

    console.log(\`  - Seeded \${post.images.length} images for blog post: \${post.title}\`)
  }

  console.log(\`\\n✅ Image seeding complete!\`)
  console.log(\`   Gallery images: \${galleryImageCount}\`)
  console.log(\`   Blog images: \${blogImageCount}\`)
}

// Allow running directly
if (require.main === module) {
  seedImages()
    .catch((e) => {
      console.error('Error seeding images:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
`

  await writeFile(seedFilePath, seedContent)
  console.log(`\n✅ Seed file generated: ${seedFilePath}`)
}

async function main() {
  console.log('🔍 Starting image scraper...\n')
  console.log(
    '⚠️  Make sure you have restored the backup to your database first!'
  )
  console.log(
    '   Run: pg_restore -d luna_development backups/luna_backup_20251115_221254.dump'
  )
  console.log("   (Press Ctrl+C if you haven't done this yet)\n")

  // Wait 3 seconds to give user time to cancel
  await new Promise((resolve) => setTimeout(resolve, 3000))

  try {
    // Extract data from current database
    const mapping = await extractDataFromCurrentDb()

    // Save mapping file
    await saveMapping(mapping)

    // Generate seed file
    await generateSeedFile(mapping)

    console.log('\n📝 Next steps:')
    console.log('   1. Reset database: pnpm prisma migrate reset --force')
    console.log('   2. Seed with images: npx tsx prisma/seeds/images.ts')
  } catch (error) {
    console.error('Error during scraping:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})
