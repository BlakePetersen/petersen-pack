// ABOUTME: Generates PNG assets and ZIP bundle from existing SVG brand files
// ABOUTME: Reads refined SVGs with vectorized text and creates raster versions

import sharp from 'sharp'
import archiver from 'archiver'
import * as fs from 'fs'
import * as path from 'path'

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'brand')

const ICON_SIZES = [64, 128, 256, 512, 1024]
const FULL_LOGO_SIZES = [256, 512, 1024]
const HORIZONTAL_LOGO_SIZES = [256, 512, 1024]

// Read existing SVG files instead of generating from templates
function readSvg(filename: string): string {
  const filepath = path.join(OUTPUT_DIR, filename)
  if (!fs.existsSync(filepath)) {
    throw new Error(`SVG file not found: ${filepath}`)
  }
  return fs.readFileSync(filepath, 'utf-8')
}

// Extract viewBox dimensions from SVG content
function getViewBox(svgContent: string): { width: number; height: number } {
  const match = svgContent.match(/viewBox="([^"]+)"/)
  if (!match) {
    return { width: 100, height: 100 }
  }
  const parts = match[1].split(/\s+/).map(Number)
  // viewBox format: "minX minY width height"
  return { width: parts[2], height: parts[3] }
}

async function generatePngFromSvg(
  svgContent: string,
  outputPath: string,
  size: number
): Promise<void> {
  const viewBox = getViewBox(svgContent)
  const aspectRatio = viewBox.width / viewBox.height

  let width: number, height: number

  if (outputPath.includes('icon')) {
    // Icons are square
    width = size
    height = size
  } else if (outputPath.includes('horizontal')) {
    // Horizontal logos: width is the limiting dimension
    width = size
    height = Math.round(size / aspectRatio)
  } else {
    // Stacked (full) logos: height is the limiting dimension
    height = size
    width = Math.round(size * aspectRatio)
  }

  await sharp(Buffer.from(svgContent))
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath)

  console.log(`Generated: ${path.basename(outputPath)} (${width}x${height})`)
}

async function createZipBundle(outputDir: string): Promise<void> {
  const zipPath = path.join(outputDir, 'luna-brand-assets.zip')
  const output = fs.createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(
        `Created ZIP bundle: ${path.basename(zipPath)} (${archive.pointer()} bytes)`
      )
      resolve()
    })

    archive.on('error', reject)
    archive.pipe(output)

    // Add all files except the zip itself
    const files = fs.readdirSync(outputDir).filter((f) => !f.endsWith('.zip'))
    for (const file of files) {
      const filePath = path.join(outputDir, file)
      archive.file(filePath, { name: file })
    }

    archive.finalize()
  })
}

async function main(): Promise<void> {
  console.log('Generating PNG assets from existing SVGs...\n')

  // Read existing SVG files
  console.log('--- Reading SVG Sources ---')
  const iconSvg = readSvg('luna-icon.svg')
  console.log('Read: luna-icon.svg')

  const darkFullSvg = readSvg('luna-full-dark.svg')
  console.log('Read: luna-full-dark.svg')

  const lightFullSvg = readSvg('luna-full-light.svg')
  console.log('Read: luna-full-light.svg')

  const darkHorizontalSvg = readSvg('luna-horizontal-dark.svg')
  console.log('Read: luna-horizontal-dark.svg')

  const lightHorizontalSvg = readSvg('luna-horizontal-light.svg')
  console.log('Read: luna-horizontal-light.svg')

  // Generate icon PNGs (dark version uses the base icon)
  console.log('\n--- Icon PNGs (Dark) ---')
  for (const size of ICON_SIZES) {
    await generatePngFromSvg(
      iconSvg,
      path.join(OUTPUT_DIR, `luna-icon-dark-${size}.png`),
      size
    )
  }

  // Generate light icon by replacing fill color
  console.log('\n--- Icon PNGs (Light) ---')
  const lightIconSvg = iconSvg.replace(/#171717/g, '#fafafa')
  for (const size of ICON_SIZES) {
    await generatePngFromSvg(
      lightIconSvg,
      path.join(OUTPUT_DIR, `luna-icon-light-${size}.png`),
      size
    )
  }

  // Generate stacked (full) logo PNGs
  console.log('\n--- Stacked Logo PNGs (Dark) ---')
  for (const size of FULL_LOGO_SIZES) {
    await generatePngFromSvg(
      darkFullSvg,
      path.join(OUTPUT_DIR, `luna-full-dark-${size}.png`),
      size
    )
  }

  console.log('\n--- Stacked Logo PNGs (Light) ---')
  for (const size of FULL_LOGO_SIZES) {
    await generatePngFromSvg(
      lightFullSvg,
      path.join(OUTPUT_DIR, `luna-full-light-${size}.png`),
      size
    )
  }

  // Generate horizontal logo PNGs
  console.log('\n--- Horizontal Logo PNGs (Dark) ---')
  for (const size of HORIZONTAL_LOGO_SIZES) {
    await generatePngFromSvg(
      darkHorizontalSvg,
      path.join(OUTPUT_DIR, `luna-horizontal-dark-${size}.png`),
      size
    )
  }

  console.log('\n--- Horizontal Logo PNGs (Light) ---')
  for (const size of HORIZONTAL_LOGO_SIZES) {
    await generatePngFromSvg(
      lightHorizontalSvg,
      path.join(OUTPUT_DIR, `luna-horizontal-light-${size}.png`),
      size
    )
  }

  // Create ZIP bundle
  console.log('\n--- ZIP Bundle ---')
  await createZipBundle(OUTPUT_DIR)

  console.log('\nBrand assets generated successfully!')
  console.log(`Output directory: ${OUTPUT_DIR}`)
}

main().catch((error) => {
  console.error('Error generating brand assets:', error)
  process.exit(1)
})
