// ABOUTME: Utility for generating watermarked preview images
// ABOUTME: Uses Sharp to composite diagonal "PROOF" text over images

import sharp from 'sharp'
import { readFile, access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'

export async function generateWatermarkedPreview(
  imagePath: string,
  clientName: string,
  maxSize = 1200
): Promise<Buffer> {
  // Verify file exists and is readable
  try {
    await access(imagePath, constants.R_OK)
  } catch {
    throw new Error(`Image file not found or not readable: ${imagePath}`)
  }

  // Read the original image
  const imageBuffer = await readFile(imagePath)
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  // Calculate dimensions for preview (max 1200px longest edge)
  const width = metadata.width || 1200
  const height = metadata.height || 1200
  const aspectRatio = width / height

  let newWidth = width
  let newHeight = height

  if (width > height && width > maxSize) {
    newWidth = maxSize
    newHeight = Math.round(maxSize / aspectRatio)
  } else if (height > maxSize) {
    newHeight = maxSize
    newWidth = Math.round(maxSize * aspectRatio)
  }

  // Resize image
  const resized = await image
    .resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer()

  // Create watermark SVG (diagonal text across center)
  const sanitizedName = clientName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .toUpperCase()
  const watermarkText = `PROOF - ${sanitizedName}`
  const fontSize = Math.min(newWidth, newHeight) / 12

  const watermarkSvg = `
    <svg width="${newWidth}" height="${newHeight}">
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="rgba(255, 255, 255, 0.4)"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-45 ${newWidth / 2} ${newHeight / 2})"
      >
        ${watermarkText}
      </text>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="none"
        stroke="rgba(0, 0, 0, 0.3)"
        stroke-width="2"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-45 ${newWidth / 2} ${newHeight / 2})"
      >
        ${watermarkText}
      </text>
    </svg>
  `

  // Composite watermark onto image
  const watermarkedImage = await sharp(resized)
    .composite([
      {
        input: Buffer.from(watermarkSvg),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 85 })
    .toBuffer()

  return watermarkedImage
}
