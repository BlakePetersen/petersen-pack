// ABOUTME: Generates descriptive alt tags for images using OpenAI Vision API
// ABOUTME: Analyzes image content and creates accessibility-friendly descriptions

import { prisma } from '../lib/prisma'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ImageToProcess {
  id: string
  url: string
  galleryTitle: string
  currentAltText: string | null
}

async function generateAltTag(
  imagePath: string,
  galleryTitle: string
): Promise<string> {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    const mimeType = imagePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg'

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are writing alt text for a professional photography portfolio website.

This image is from a gallery titled "${galleryTitle}".

Write a concise, descriptive alt tag (max 125 characters) that:
1. Describes what's in the image for accessibility
2. Mentions the photography style/context
3. Is useful for screen readers
4. Avoids phrases like "image of" or "photo of"

Return ONLY the alt text, nothing else.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'low', // Use low detail for cost efficiency
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    })

    const altText = response.choices[0]?.message?.content?.trim()
    if (!altText) {
      throw new Error('No alt text generated')
    }

    return altText
  } catch (error) {
    console.error(`Error generating alt tag: ${error}`)
    throw error
  }
}

async function processImages(options: {
  dryRun?: boolean
  limit?: number
  skipExisting?: boolean
}) {
  const { dryRun = false, limit, skipExisting = false } = options

  console.log('Fetching images from database...\n')

  // Get all images with their gallery info
  const galleries = await prisma.gallery.findMany({
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  const imagesToProcess: ImageToProcess[] = []

  for (const gallery of galleries) {
    for (const image of gallery.images) {
      // Skip if skipExisting is true and image already has good alt text
      if (skipExisting && image.altText && image.altText.length > 20) {
        continue
      }

      imagesToProcess.push({
        id: image.id,
        url: image.url,
        galleryTitle: gallery.title,
        currentAltText: image.altText,
      })
    }
  }

  const totalToProcess = limit
    ? Math.min(limit, imagesToProcess.length)
    : imagesToProcess.length
  console.log(`Found ${imagesToProcess.length} images`)
  console.log(
    `Processing ${totalToProcess} images${dryRun ? ' (DRY RUN)' : ''}\n`
  )

  let processed = 0
  let updated = 0
  let errors = 0

  for (let i = 0; i < totalToProcess; i++) {
    const image = imagesToProcess[i]
    const imageNum = i + 1

    try {
      // Construct local file path
      const localPath = path.join(process.cwd(), 'public', image.url)

      if (!fs.existsSync(localPath)) {
        console.log(
          `⚠️  [${imageNum}/${totalToProcess}] File not found: ${image.url}`
        )
        errors++
        continue
      }

      console.log(
        `🔄 [${imageNum}/${totalToProcess}] Processing: ${image.galleryTitle}`
      )
      console.log(`   Current alt: ${image.currentAltText || '(none)'}`)

      const newAltText = await generateAltTag(localPath, image.galleryTitle)

      console.log(`   New alt: ${newAltText}`)

      if (!dryRun) {
        await prisma.image.update({
          where: { id: image.id },
          data: { altText: newAltText },
        })
        updated++
      }

      processed++
      console.log(`✓ Success\n`)

      // Rate limiting: wait 1 second between requests to avoid API limits
      if (i < totalToProcess - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`✗ Error processing image ${imageNum}:`, error)
      errors++
      console.log()

      // If we hit rate limits, wait longer
      if (error instanceof Error && error.message.includes('rate')) {
        console.log('Rate limit hit, waiting 60 seconds...\n')
        await new Promise((resolve) => setTimeout(resolve, 60000))
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total images found: ${imagesToProcess.length}`)
  console.log(`Images processed: ${processed}`)
  console.log(`Images updated: ${updated}`)
  console.log(`Errors: ${errors}`)

  if (dryRun) {
    console.log('\n⚠️  DRY RUN - No changes were made to the database')
  }

  await prisma.$disconnect()
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined
const skipExisting = args.includes('--skip-existing')

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set')
  console.error('Please add your OpenAI API key to your .env file')
  process.exit(1)
}

console.log('Alt Tag Generator')
console.log('='.repeat(50))
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
console.log(`Limit: ${limit || 'None'}`)
console.log(`Skip existing: ${skipExisting}`)
console.log('='.repeat(50) + '\n')

processImages({ dryRun, limit, skipExisting }).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
