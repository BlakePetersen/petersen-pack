// ABOUTME: Script to generate favicon files from Luna logo SVG
// ABOUTME: Creates various sizes for different platforms and use cases

import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const publicDir = join(__dirname, '..', 'public')

// SVG for the logo - Luna moon and sun
const logoSVG = `
<svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100" height="100" fill="#000000" />

  <!-- Moon and sun centered -->
  <g transform="translate(50, 50)">
    <!-- Crescent moon - filled -->
    <path d="M 0 -25 A 15 15 0 1 1 0 25 A 13 25 0 0 0 0 -25 Z" fill="#FFFFFF" stroke="none" />

    <!-- Sun rays - varying lengths -->
    <!-- Top (12 o'clock) -->
    <line x1="0" y1="-40" x2="0" y2="-25" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />

    <!-- Top-right diagonal (1:30) -->
    <line x1="28" y1="-28" x2="18" y2="-18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Right (3 o'clock) -->
    <line x1="25" y1="0" x2="38" y2="0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Bottom-right diagonal (4:30) -->
    <line x1="28" y1="28" x2="18" y2="18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Bottom (6 o'clock) -->
    <line x1="0" y1="25" x2="0" y2="40" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />

    <!-- Bottom-left diagonal (7:30) -->
    <line x1="-28" y1="28" x2="-18" y2="18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Left (9 o'clock) -->
    <line x1="-38" y1="0" x2="-25" y2="0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Top-left diagonal (10:30) -->
    <line x1="-28" y1="-28" x2="-18" y2="-18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  </g>
</svg>
`

const sizes = [
  { name: 'favicon.ico', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

async function generateFavicons() {
  console.log('🎨 Generating favicons...')

  const svgBuffer = Buffer.from(logoSVG)

  for (const { name, size } of sizes) {
    const outputPath = join(publicDir, name)

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath)

      console.log(`✅ Generated ${name} (${size}x${size})`)
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message)
    }
  }

  // Generate favicon.svg for modern browsers
  const faviconSvgPath = join(publicDir, 'favicon.svg')
  writeFileSync(faviconSvgPath, logoSVG)
  console.log('✅ Generated favicon.svg')

  console.log('\n✨ All favicons generated successfully!')
  console.log('\nUpdate your app/layout.tsx or pages/_document.tsx with:')
  console.log(`
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  `)
}

// Also generate site.webmanifest
const webmanifest = {
  name: 'Luna - Ashley Petersen Photography',
  short_name: 'Luna',
  icons: [
    {
      src: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ],
  theme_color: '#000000',
  background_color: '#000000',
  display: 'standalone'
}

writeFileSync(
  join(publicDir, 'site.webmanifest'),
  JSON.stringify(webmanifest, null, 2)
)
console.log('✅ Generated site.webmanifest')

generateFavicons().catch(console.error)
