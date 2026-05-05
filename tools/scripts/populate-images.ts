// ABOUTME: Script to download images from Ashley's current site
// ABOUTME: Populates galleries with real photography samples

import { PrismaClient } from '@prisma/client'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import stream from 'stream'

const prisma = new PrismaClient()
const pipeline = promisify(stream.pipeline)

const imageData = {
  animals: [
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1617750942032-ONG1UNTGD2L7JDV7EN7H/_DSC5849.JPG',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1493246605643-6ZGYN06IUKUUMI46V5DX/DSC_2425.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1448132206324-I94DL1EZX39D0MPJO7O9/_DSC5039.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1448133421553-TP8EWPUMXUM2RGXTS1XC/_DSC9953.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1448132223156-7RWPMM7VFPM3RS4I54H1/_DSC6915.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1485483170427-J2RGVOGCNTVIPXX66LWZ/_DSC0118.jpg',
  ],
  headshots: [
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1659243136288-H0CIBGBWNKI1B1XIJCAL/5_Capture0045-2.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743279378751-SYRGKKSTVDWIISXY4H7O/_DSC1811-Edit.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743279377906-W3QE46A8GLKIVNJRGTJP/_DSC1939-Edit.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743279382820-BOZRO3E3R07HETZWPDS6/_DSC2076-Edit.jpg',
  ],
  branding: [
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743290561734-V6FFQBFW2PZ29X8NY7B5/_DSC2483-Edit.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743290577849-R65HMDYCLUDA4YWTU6AQ/_DSC3771-Edit.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743290547917-T4LOH95MW8VFF94T6QOZ/_DSC2305-Edit.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743290587696-EWD4HUZT5ZADQPKPT8Q6/_DSC4026.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743290588515-YEBJUZDI4PI5FLZXBU7Y/_DSC4366-Edit.jpg',
    'https://images.squarespace-cdn.com/content/v1/55e7bf3fe4b067b60920223e/1743290564968-TCM1R4X9UEZ11SHI1RM8/_DSC2630-Edit.jpg',
  ],
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const cleanUrl = url.split('?')[0] // Remove query params

  return new Promise((resolve, reject) => {
    https.get(cleanUrl, (response) => {
      if (response.statusCode === 200) {
        const writeStream = fs.createWriteStream(filepath)
        pipeline(response, writeStream)
          .then(() => resolve())
          .catch(reject)
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`))
      }
    }).on('error', reject)
  })
}

async function main() {
  console.log('Starting image population...')

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  // Get galleries
  const galleries = await prisma.gallery.findMany()
  const galleryMap = new Map(galleries.map(g => [g.slug, g]))

  for (const [gallerySlug, urls] of Object.entries(imageData)) {
    const gallery = galleryMap.get(gallerySlug)
    if (!gallery) {
      console.log(`Gallery ${gallerySlug} not found, skipping...`)
      continue
    }

    console.log(`\nPopulating ${gallery.title}...`)

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const filename = `${gallerySlug}-${Date.now()}-${i}.jpg`
      const filepath = path.join(uploadsDir, filename)

      try {
        console.log(`  Downloading image ${i + 1}/${urls.length}...`)
        await downloadImage(url, filepath)

        // Create database record
        await prisma.image.create({
          data: {
            url: `/uploads/${filename}`,
            galleryId: gallery.id,
            sortOrder: i,
            altText: `${gallery.title} photography by Ashley Petersen`,
          },
        })

        console.log(`  ✓ Saved ${filename}`)
      } catch (error) {
        console.error(`  ✗ Failed to download ${url}:`, error)
      }
    }
  }

  console.log('\n✅ Image population complete!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
