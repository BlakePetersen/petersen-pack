// ABOUTME: Generates descriptive alt tags based on gallery context without AI
// ABOUTME: Uses gallery title, shoot type, and image metadata to create meaningful descriptions

import { prisma } from '../lib/prisma'

interface ImageToProcess {
  id: string
  url: string
  galleryTitle: string
  sortOrder: number
  currentAltText: string | null
}

function generateAltTag(
  galleryTitle: string,
  imageNumber: number,
  totalImages: number
): string {
  // Clean up the gallery title
  const cleanTitle = galleryTitle.replace(/[_-]/g, ' ')

  // Create descriptive alt text based on shoot type and context
  const templates: Record<string, string[]> = {
    Animals: [
      `Pet portrait photography`,
      `Dog portrait session`,
      `Animal photography`,
      `Pet lifestyle portrait`,
      `Companion animal portrait`,
    ],
    Boudoir: [
      `Elegant boudoir portrait`,
      `Intimate boudoir session`,
      `Confident boudoir photography`,
      `Artistic boudoir portrait`,
      `Empowering boudoir imagery`,
    ],
    Commercial: [
      `Professional branding portrait`,
      `Business headshot photography`,
      `Corporate portrait session`,
      `Commercial lifestyle image`,
      `Professional business portrait`,
    ],
    BRANDING: [
      `Lifestyle branding session`,
      `Professional brand photography`,
      `Business lifestyle portrait`,
      `Personal brand imagery`,
      `Commercial branding portrait`,
    ],
    Creative: [
      `Creative conceptual portrait`,
      `Artistic photography session`,
      `Imaginative portrait work`,
      `Fine art photography`,
      `Conceptual portrait imagery`,
    ],
    Headshots: [
      `Professional headshot`,
      `Corporate portrait`,
      `Business headshot photography`,
      `Professional portrait session`,
      `Executive headshot`,
    ],
    Lifestyle: [
      `Lifestyle portrait session`,
      `Natural lifestyle photography`,
      `Candid lifestyle moment`,
      `Authentic lifestyle portrait`,
      `Documentary style portrait`,
    ],
    Travel: [
      `Travel photography`,
      `Destination portrait session`,
      `Travel lifestyle imagery`,
      `Location photography`,
      `Travel landscape portrait`,
    ],
  }

  // Special handling for specific galleries
  if (galleryTitle.toLowerCase().includes('underwater')) {
    const underwater = [
      `Underwater portrait photography`,
      `Submerged artistic portrait`,
      `Aquatic fashion photography`,
      `Ethereal underwater imagery`,
      `Creative underwater session`,
    ]
    const idx = (imageNumber - 1) % underwater.length
    return `${underwater[idx]} - East Bay photographer`
  }

  if (galleryTitle.toLowerCase().includes('fantasy')) {
    const fantasy = [
      `Fantasy portrait session`,
      `Whimsical creative portrait`,
      `Fairytale inspired photography`,
      `Imaginative portrait work`,
      `Storybook style portrait`,
    ]
    const idx = (imageNumber - 1) % fantasy.length
    return `${fantasy[idx]} by Ashley Petersen`
  }

  if (
    galleryTitle.toLowerCase().includes('yoga') ||
    galleryTitle.toLowerCase().includes('dance')
  ) {
    const movement = [
      `Yoga portrait photography`,
      `Dance movement photography`,
      `Athletic lifestyle portrait`,
      `Wellness lifestyle session`,
      `Movement and motion portrait`,
    ]
    const idx = (imageNumber - 1) % movement.length
    return `${movement[idx]} - Bay Area photographer`
  }

  if (galleryTitle.toLowerCase().includes('rescue')) {
    const rescue = [
      `Animal rescue photography`,
      `Rescue dog portrait`,
      `Pet adoption photography`,
      `Rescue animal portrait`,
      `Shelter pet photography`,
    ]
    const idx = (imageNumber - 1) % rescue.length
    return `${rescue[idx]} by Ashley Petersen`
  }

  // Find matching template based on gallery title
  let selectedTemplates: string[] = []

  for (const [key, temps] of Object.entries(templates)) {
    if (cleanTitle.toLowerCase().includes(key.toLowerCase())) {
      selectedTemplates = temps
      break
    }
  }

  // If no specific template found, use gallery-based description
  if (selectedTemplates.length === 0) {
    const descriptors = [
      `Professional ${cleanTitle.toLowerCase()} photography`,
      `${cleanTitle} portrait session`,
      `${cleanTitle} lifestyle photography`,
      `${cleanTitle} creative portrait`,
      `${cleanTitle} professional imagery`,
    ]
    const idx = (imageNumber - 1) % descriptors.length
    return `${descriptors[idx]} by Ashley Petersen`
  }

  // Use image number to vary the templates
  const templateIndex = (imageNumber - 1) % selectedTemplates.length
  const template = selectedTemplates[templateIndex]

  // Add location/setting variety every few images
  const locations = [
    'East Bay',
    'San Francisco Bay Area',
    'Northern California',
    'on location',
    'outdoor',
  ]
  const shouldAddLocation = imageNumber % 4 === 0
  const location = shouldAddLocation
    ? ` - ${locations[(imageNumber / 4) % locations.length]}`
    : ''

  return `${template}${location} by Ashley Petersen Photography`
}

async function processImages(options: {
  dryRun?: boolean
  limit?: number
  skipExisting?: boolean
}) {
  const { dryRun = false, limit, skipExisting = false } = options

  console.log('Fetching images from database...\n')

  const galleries = await prisma.gallery.findMany({
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { title: 'asc' },
  })

  const imagesToProcess: ImageToProcess[] = []

  for (const gallery of galleries) {
    for (let i = 0; i < gallery.images.length; i++) {
      const image = gallery.images[i]

      // Skip if skipExisting is true and image already has descriptive alt text
      if (
        skipExisting &&
        image.altText &&
        image.altText.length > 30 &&
        !image.altText.includes('Image 1') &&
        !image.altText.includes('Image 2')
      ) {
        continue
      }

      imagesToProcess.push({
        id: image.id,
        url: image.url,
        galleryTitle: gallery.title,
        sortOrder: i + 1,
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

  // Group by gallery for better context
  const imagesByGallery = imagesToProcess.reduce(
    (acc, img) => {
      if (!acc[img.galleryTitle]) acc[img.galleryTitle] = []
      acc[img.galleryTitle].push(img)
      return acc
    },
    {} as Record<string, ImageToProcess[]>
  )

  let globalCount = 0

  for (const [galleryTitle, images] of Object.entries(imagesByGallery)) {
    const galleryImages = images.slice(
      0,
      Math.max(0, totalToProcess - globalCount)
    )
    if (galleryImages.length === 0) break

    console.log(
      `\n📸 Gallery: ${galleryTitle} (${galleryImages.length} images)`
    )
    console.log('─'.repeat(60))

    for (let i = 0; i < galleryImages.length; i++) {
      const image = galleryImages[i]
      globalCount++

      const newAltText = generateAltTag(
        image.galleryTitle,
        image.sortOrder,
        images.length
      )

      console.log(
        `\n[${globalCount}/${totalToProcess}] Image ${image.sortOrder}/${images.length}`
      )
      console.log(`  Current: ${image.currentAltText || '(none)'}`)
      console.log(`  New:     ${newAltText}`)

      if (!dryRun) {
        await prisma.image.update({
          where: { id: image.id },
          data: { altText: newAltText },
        })
        updated++
      }

      processed++

      if (globalCount >= totalToProcess) break
    }

    if (globalCount >= totalToProcess) break
  }

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total images found: ${imagesToProcess.length}`)
  console.log(`Images processed: ${processed}`)
  console.log(`Images updated: ${updated}`)

  if (dryRun) {
    console.log('\n⚠️  DRY RUN - No changes were made to the database')
  } else {
    console.log('\n✅ Alt tags successfully updated!')
  }

  await prisma.$disconnect()
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined
const skipExisting = args.includes('--skip-existing')

console.log('Manual Alt Tag Generator')
console.log('='.repeat(60))
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
console.log(`Limit: ${limit || 'None'}`)
console.log(`Skip existing: ${skipExisting}`)
console.log('='.repeat(60) + '\n')

processImages({ dryRun, limit, skipExisting }).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
