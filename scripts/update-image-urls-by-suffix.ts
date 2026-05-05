// ABOUTME: Updates Image URLs by matching filename suffix to Blob URLs
// ABOUTME: Maps prod DB images (new timestamps) to already-uploaded Blob files (old timestamps)

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

function extractSuffix(filename: string): string {
  // Extract suffix like "-0-animals.webp" from "1764644388389-0-animals.webp"
  const match = filename.match(/-(\d+-[^/]+\.webp)$/)
  return match ? match[1] : ''
}

async function updateImageUrls() {
  console.log('Loading URL mapping...')

  const mappingPath = path.join(process.cwd(), 'image-url-mapping.json')
  const urlMapping: Record<string, string> = JSON.parse(
    fs.readFileSync(mappingPath, 'utf-8')
  )

  // Build suffix -> blob URL mapping
  const suffixToBlob: Record<string, string> = {}
  for (const [oldPath, blobUrl] of Object.entries(urlMapping)) {
    const filename = oldPath.split('/').pop() || ''
    const suffix = extractSuffix(filename)
    if (suffix) {
      suffixToBlob[suffix] = blobUrl
    }
  }

  console.log(`Built ${Object.keys(suffixToBlob).length} suffix mappings\n`)

  // Update Image records
  console.log('Updating Image records...')
  const images = await prisma.image.findMany({
    where: {
      url: {
        startsWith: '/uploads/scraped/',
      },
    },
  })

  console.log(`Found ${images.length} Image records to update\n`)

  let updated = 0
  let notFound = 0

  for (const image of images) {
    const filename = image.url.split('/').pop() || ''
    const suffix = extractSuffix(filename)
    const newUrl = suffixToBlob[suffix]

    if (newUrl) {
      await prisma.image.update({
        where: { id: image.id },
        data: { url: newUrl },
      })
      updated++
      process.stdout.write(`\rUpdated: ${updated}/${images.length}`)
    } else {
      console.log(
        `\n  Warning: No mapping found for suffix ${suffix} (${image.url})`
      )
      notFound++
    }
  }

  console.log(
    `\n\nImage update complete: ${updated} updated, ${notFound} not found\n`
  )
  console.log('\n✅ URL update complete!')
}

updateImageUrls()
  .catch((e) => {
    console.error('Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
