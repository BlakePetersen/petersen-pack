// ABOUTME: Script to generate PWA icons and favicon for SEO
// ABOUTME: Creates app icons and Open Graph images using Sharp

import sharp from 'sharp'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const publicDir = join(process.cwd(), 'public')

// Brand colors from the site
const primaryColor = '#1e40af' // blue-700
const secondaryColor = '#7c3aed' // purple-600

async function generateIcon(size: number, filename: string) {
  // Create a gradient background SVG
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" />
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${size * 0.4}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >AP</text>
    </svg>
  `

  const buffer = Buffer.from(svg)
  await sharp(buffer).resize(size, size).png().toFile(join(publicDir, filename))

  console.log(`✓ Created ${filename} (${size}x${size})`)
}

async function generateFavicon() {
  // Create a 32x32 favicon
  const size = 32
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" />
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${size * 0.55}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >AP</text>
    </svg>
  `

  const buffer = Buffer.from(svg)
  await sharp(buffer).resize(32, 32).toFile(join(publicDir, 'favicon.ico'))

  console.log('✓ Created favicon.ico (32x32)')
}

async function generateOGImage() {
  // Create a 1200x630 Open Graph image
  const width = 1200
  const height = 630

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      <text
        x="50%"
        y="40%"
        font-family="Arial, sans-serif"
        font-size="80"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >Ashley Petersen</text>
      <text
        x="50%"
        y="55%"
        font-family="Arial, sans-serif"
        font-size="60"
        font-weight="300"
        fill="white"
        opacity="0.9"
        text-anchor="middle"
        dominant-baseline="middle"
      >Photography</text>
      <text
        x="50%"
        y="75%"
        font-family="Arial, sans-serif"
        font-size="28"
        fill="white"
        opacity="0.8"
        text-anchor="middle"
        dominant-baseline="middle"
      >East Bay • San Francisco • Contra Costa County</text>
    </svg>
  `

  const buffer = Buffer.from(svg)
  await sharp(buffer)
    .resize(width, height)
    .jpeg({ quality: 90 })
    .toFile(join(publicDir, 'og-image.jpg'))

  console.log(`✓ Created og-image.jpg (${width}x${height})`)
}

async function main() {
  console.log('Generating SEO icons and images...\n')

  try {
    // Generate PWA icons
    await generateIcon(192, 'icon-192.png')
    await generateIcon(512, 'icon-512.png')

    // Generate favicon
    await generateFavicon()

    // Generate Open Graph image
    await generateOGImage()

    console.log('\n✅ All icons generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

main()
