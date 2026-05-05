// ABOUTME: Script to upscale images using Replicate and migrate to Vercel Blob
// ABOUTME: Processes all images from database, upscales them, and updates URLs

import Replicate from 'replicate'
import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

// Set the blob token for Vercel Blob SDK
process.env.BLOB_READ_WRITE_TOKEN = process.env.LUNA_READ_WRITE_TOKEN

const prisma = new PrismaClient()
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

interface ImageRecord {
  id: string
  url: string
  publicId: string | null
}

// Configuration
const BATCH_SIZE = 5 // Process 5 images at a time to avoid rate limits
const UPSCALE_FACTOR = 2 // 2x upscaling (can be 2 or 4)
const DRY_RUN = process.env.DRY_RUN === 'true' // Set to test without making changes
const PUBLIC_DIR = join(process.cwd(), 'public')
const MAX_PIXELS = 2096704 // Max pixels for Replicate GPU (about 1447x1447)

async function getLocalFilePath(url: string): Promise<string> {
  // Convert URL to local file path
  // e.g., "/uploads/image.jpg" -> "/Users/blake/Sites/Luna/public/uploads/image.jpg"
  const relativePath = url.startsWith('/') ? url.slice(1) : url
  return join(PUBLIC_DIR, relativePath)
}

async function upscaleImage(imageUrl: string): Promise<string> {
  console.log(`  📈 Upscaling image via Replicate...`)

  // Get local file path
  const localPath = await getLocalFilePath(imageUrl)
  console.log(`  📂 Reading from: ${localPath}`)

  // Read file and convert to base64 data URI
  const fileBuffer = await readFile(localPath)
  const base64 = fileBuffer.toString('base64')
  const mimeType = localPath.endsWith('.webp')
    ? 'image/webp'
    : localPath.endsWith('.png')
      ? 'image/png'
      : 'image/jpeg'
  const dataUri = `data:${mimeType};base64,${base64}`

  const output = (await replicate.run(
    'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
    {
      input: {
        image: dataUri,
        scale: UPSCALE_FACTOR,
        face_enhance: false, // Set to true if you want face enhancement
      },
    }
  )) as unknown as string

  return output
}

async function uploadToVercelBlob(
  imageUrl: string,
  filename: string
): Promise<string> {
  console.log(`  ☁️  Uploading to Vercel Blob...`)

  // Fetch the upscaled image
  const response = await fetch(imageUrl)
  const blob = await response.blob()

  // Upload to Vercel Blob
  const { url } = await put(filename, blob, {
    access: 'public',
    addRandomSuffix: false,
  })

  return url
}

async function processImage(image: ImageRecord): Promise<void> {
  console.log(`\n🖼️  Processing: ${image.id}`)
  console.log(`  Original URL: ${image.url}`)

  try {
    // Skip if already on Vercel Blob
    if (image.url.includes('blob.vercel-storage.com')) {
      console.log(`  ✅ Already on Vercel Blob, skipping...`)
      return
    }

    // Get local file path
    const localPath = await getLocalFilePath(image.url)

    // Check image dimensions
    const metadata = await sharp(localPath).metadata()
    const width = metadata.width || 0
    const height = metadata.height || 0
    const totalPixels = width * height

    console.log(
      `  📐 Dimensions: ${width}x${height} (${totalPixels.toLocaleString()} pixels)`
    )

    if (DRY_RUN) {
      if (totalPixels > MAX_PIXELS) {
        console.log(
          `  🔍 DRY RUN: Would skip upscaling (too large), just migrate to Vercel Blob`
        )
      } else {
        console.log(`  🔍 DRY RUN: Would upscale and migrate this image`)
      }
      return
    }

    let finalImageUrl: string

    // Step 1: Upscale if small enough, otherwise use original
    if (totalPixels > MAX_PIXELS) {
      console.log(`  ⚠️  Image too large for upscaling, migrating original...`)
      // Read original file and convert to blob
      const fileBuffer = await readFile(localPath)
      const blob = new Blob([new Uint8Array(fileBuffer)])
      const filename = `images/${image.id}.${localPath.endsWith('.webp') ? 'webp' : 'jpg'}`
      const { url } = await put(filename, blob, {
        access: 'public',
        addRandomSuffix: false,
      })
      finalImageUrl = url
      console.log(`  ✅ Uploaded original to Vercel Blob: ${finalImageUrl}`)
    } else {
      const upscaledUrl = await upscaleImage(image.url)
      console.log(`  ✅ Upscaled successfully`)

      // Step 2: Upload to Vercel Blob
      const filename = `images/${image.id}.jpg`
      finalImageUrl = await uploadToVercelBlob(upscaledUrl, filename)
      console.log(
        `  ✅ Uploaded upscaled image to Vercel Blob: ${finalImageUrl}`
      )
    }

    // Step 3: Update database
    await prisma.image.update({
      where: { id: image.id },
      data: {
        url: finalImageUrl,
        publicId: null,
      },
    })
    console.log(`  ✅ Database updated`)

    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch (error) {
    console.error(`  ❌ Error processing image ${image.id}:`, error)
    throw error
  }
}

async function processBatch(images: ImageRecord[]): Promise<void> {
  for (const image of images) {
    await processImage(image)
  }
}

async function main() {
  console.log('🚀 Starting image upscale and migration process\n')
  console.log(`Configuration:`)
  console.log(`  - Upscale factor: ${UPSCALE_FACTOR}x`)
  console.log(`  - Batch size: ${BATCH_SIZE}`)
  console.log(`  - Dry run: ${DRY_RUN}`)
  console.log(`  - Max pixels for upscaling: ${MAX_PIXELS.toLocaleString()}`)
  console.log('')

  // Get all images from database
  const images = await prisma.image.findMany({
    select: {
      id: true,
      url: true,
      publicId: true,
    },
  })

  console.log(`📊 Found ${images.length} images to process\n`)

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
  }

  // Track stats
  let upscaledCount = 0
  let migratedCount = 0
  let skippedCount = 0

  // Process images in batches
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE)
    console.log(
      `\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(images.length / BATCH_SIZE)}`
    )

    for (const image of batch) {
      const localPath = await getLocalFilePath(image.url)

      if (image.url.includes('blob.vercel-storage.com')) {
        skippedCount++
        continue
      }

      const metadata = await sharp(localPath).metadata()
      const totalPixels = (metadata.width || 0) * (metadata.height || 0)

      if (totalPixels > MAX_PIXELS) {
        migratedCount++
      } else {
        upscaledCount++
      }
    }

    await processBatch(batch)
  }

  console.log('\n\n✨ Migration complete!')
  console.log(`\n📊 Summary:`)
  console.log(`  - Total images processed: ${images.length}`)
  console.log(`  - Images upscaled: ${upscaledCount}`)
  console.log(`  - Images migrated as-is (too large): ${migratedCount}`)
  console.log(`  - Images skipped (already on Vercel Blob): ${skippedCount}`)

  if (!DRY_RUN) {
    // Count images on Vercel Blob
    const vercelBlobCount = await prisma.image.count({
      where: {
        url: {
          contains: 'blob.vercel-storage.com',
        },
      },
    })
    console.log(`  - Images now on Vercel Blob: ${vercelBlobCount}`)
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
