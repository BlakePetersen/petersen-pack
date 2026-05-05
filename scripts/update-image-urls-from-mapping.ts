// ABOUTME: Updates Image URLs using existing image-url-mapping.json file
// ABOUTME: Applies Blob URLs to Image records without re-uploading

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function updateImageUrls() {
  console.log('Loading URL mapping...')

  const mappingPath = path.join(process.cwd(), 'image-url-mapping.json')
  const urlMapping: Record<string, string> = JSON.parse(
    fs.readFileSync(mappingPath, 'utf-8')
  )

  console.log(`Loaded ${Object.keys(urlMapping).length} URL mappings\n`)

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
    const newUrl = urlMapping[image.url]
    if (newUrl) {
      await prisma.image.update({
        where: { id: image.id },
        data: { url: newUrl },
      })
      updated++
      process.stdout.write(`\rUpdated: ${updated}/${images.length}`)
    } else {
      console.log(`\n  Warning: No mapping found for ${image.url}`)
      notFound++
    }
  }

  console.log(
    `\n\nImage update complete: ${updated} updated, ${notFound} not found\n`
  )

  // Update ServiceImage records
  console.log('Updating ServiceImage records...')
  const serviceImages = await prisma.serviceImage.findMany({
    where: {
      url: {
        startsWith: '/uploads/scraped/',
      },
    },
  })

  console.log(`Found ${serviceImages.length} ServiceImage records to update\n`)

  let siUpdated = 0
  let siNotFound = 0

  for (const img of serviceImages) {
    const newUrl = urlMapping[img.url]
    if (newUrl) {
      await prisma.serviceImage.update({
        where: { id: img.id },
        data: { url: newUrl },
      })
      siUpdated++
      process.stdout.write(`\rUpdated: ${siUpdated}/${serviceImages.length}`)
    } else {
      console.log(`\n  Warning: No mapping found for ${img.url}`)
      siNotFound++
    }
  }

  console.log(
    `\n\nServiceImage update complete: ${siUpdated} updated, ${siNotFound} not found\n`
  )

  // Update HeroSlide records (just in case any were missed)
  console.log('Checking HeroSlide records...')
  const heroSlides = await prisma.heroSlide.findMany({
    where: {
      imageUrl: {
        startsWith: '/uploads/scraped/',
      },
    },
  })

  if (heroSlides.length > 0) {
    for (const slide of heroSlides) {
      if (slide.imageUrl && urlMapping[slide.imageUrl]) {
        await prisma.heroSlide.update({
          where: { id: slide.id },
          data: { imageUrl: urlMapping[slide.imageUrl] },
        })
        console.log(`  Updated HeroSlide: ${slide.title}`)
      }
    }
  } else {
    console.log('  No HeroSlide records need updating')
  }

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
