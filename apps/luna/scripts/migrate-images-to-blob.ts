// ABOUTME: Migrates images from local uploads to Vercel Blob
// ABOUTME: Updates database records with new Blob URLs

import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const SCRAPED_DIR = path.join(process.cwd(), 'public/uploads/scraped')
const BLOG_DIR = path.join(process.cwd(), 'public/uploads/blog')

async function uploadToBlob(
  filePath: string,
  blobPath: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const blob = await put(blobPath, fileBuffer, {
    access: 'public',
    contentType: filePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
    addRandomSuffix: false,
  })
  return blob.url
}

async function migrateDirectory(
  dir: string,
  blobPrefix: string,
  localPrefix: string
): Promise<Record<string, string>> {
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f))
  console.log(`Found ${files.length} images in ${path.basename(dir)}`)

  const urlMapping: Record<string, string> = {}
  const BATCH_SIZE = 10
  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (fileName) => {
        const filePath = path.join(dir, fileName)
        const oldPath = `${localPrefix}/${fileName}`
        const blobPath = `${blobPrefix}/${fileName}`

        try {
          const newUrl = await uploadToBlob(filePath, blobPath)
          urlMapping[oldPath] = newUrl
          uploaded++
          process.stdout.write(
            `\r  Progress: ${uploaded + skipped}/${files.length}`
          )
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('already exists')) {
            // File already in blob - construct the URL
            const baseUrl = process.env.BLOB_READ_WRITE_TOKEN?.includes('iWDr7')
              ? 'https://iwdr7kqxwo00nm51.public.blob.vercel-storage.com'
              : 'https://blob.vercel-storage.com'
            urlMapping[oldPath] = `${baseUrl}/${blobPath}`
            skipped++
            process.stdout.write(
              `\r  Progress: ${uploaded + skipped}/${files.length}`
            )
          } else {
            console.error(`\n  ✗ Failed ${fileName}:`, errorMessage)
            failed++
          }
        }
      })
    )
  }

  console.log(
    `\n  ✓ ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`
  )
  return urlMapping
}

async function migrateImages() {
  console.log('='.repeat(60))
  console.log('Migrating images to Vercel Blob')
  console.log('='.repeat(60))

  // Migrate scraped images (portfolio + hero)
  console.log('\n📁 Scraped images (portfolio/hero):')
  const scrapedMapping = await migrateDirectory(
    SCRAPED_DIR,
    'portfolio',
    '/uploads/scraped'
  )

  // Migrate blog images
  console.log('\n📁 Blog images:')
  const blogMapping = await migrateDirectory(BLOG_DIR, 'blog', '/uploads/blog')

  const urlMapping = { ...scrapedMapping, ...blogMapping }

  // Update HeroSlides
  console.log('\n🔄 Updating database records...')
  console.log('  HeroSlides...')
  const heroSlides = await prisma.heroSlide.findMany({
    where: { imageUrl: { startsWith: '/uploads/' } },
  })
  for (const slide of heroSlides) {
    if (slide.imageUrl && urlMapping[slide.imageUrl]) {
      await prisma.heroSlide.update({
        where: { id: slide.id },
        data: { imageUrl: urlMapping[slide.imageUrl] },
      })
    }
  }
  console.log(`    ${heroSlides.length} checked`)

  // Update Image records
  console.log('  Images...')
  const images = await prisma.image.findMany({
    where: { url: { startsWith: '/uploads/' } },
  })
  for (const image of images) {
    if (urlMapping[image.url]) {
      await prisma.image.update({
        where: { id: image.id },
        data: { url: urlMapping[image.url] },
      })
    }
  }
  console.log(`    ${images.length} checked`)

  // Update ServiceImage records
  console.log('  ServiceImages...')
  const serviceImages = await prisma.serviceImage.findMany({
    where: { url: { startsWith: '/uploads/' } },
  })
  for (const img of serviceImages) {
    if (urlMapping[img.url]) {
      await prisma.serviceImage.update({
        where: { id: img.id },
        data: { url: urlMapping[img.url] },
      })
    }
  }
  console.log(`    ${serviceImages.length} checked`)

  // Update BlogPost cover images
  console.log('  BlogPost covers...')
  const blogPosts = await prisma.blogPost.findMany({
    where: { coverImage: { startsWith: '/uploads/' } },
  })
  for (const post of blogPosts) {
    if (post.coverImage && urlMapping[post.coverImage]) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { coverImage: urlMapping[post.coverImage] },
      })
    }
  }
  console.log(`    ${blogPosts.length} checked`)

  // Update BlogPostImage records
  console.log('  BlogPostImages...')
  const blogImages = await prisma.blogPostImage.findMany({
    where: { url: { startsWith: '/uploads/' } },
  })
  for (const img of blogImages) {
    if (urlMapping[img.url]) {
      await prisma.blogPostImage.update({
        where: { id: img.id },
        data: { url: urlMapping[img.url] },
      })
    }
  }
  console.log(`    ${blogImages.length} checked`)

  // Save mapping for reference
  const mappingPath = path.join(process.cwd(), 'image-url-mapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2))
  console.log(`\n📝 URL mapping saved to ${mappingPath}`)

  console.log('\n' + '='.repeat(60))
  console.log('✅ Migration complete!')
  console.log('='.repeat(60))
}

migrateImages()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
