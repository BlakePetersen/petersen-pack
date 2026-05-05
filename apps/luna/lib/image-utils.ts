// ABOUTME: Image rendering utilities for crop and focal point
// ABOUTME: Calculates CSS styles for displaying cropped images

export type ImageData = {
  url: string
  focalX?: number | null
  focalY?: number | null
  cropX?: number | null
  cropY?: number | null
  cropWidth?: number | null
  cropHeight?: number | null
  cropAspectRatio?: string | null
  flipHorizontal?: boolean | null
  flipVertical?: boolean | null
}

export type ImageStyles = {
  container: React.CSSProperties
  image: React.CSSProperties
}

/**
 * Calculate styles for displaying an image with crop and focal point
 *
 * The approach for cropped images uses a two-layer technique:
 * - Container sets the aspect ratio and clips overflow
 * - Image is positioned absolutely, scaled up, and translated so only the crop region shows
 * - Scale = 1/cropSize to make crop region fill the container
 * - Translate = -cropPosition * scale to move crop to top-left
 * - Flip is applied after positioning via negative scale
 *
 * @param imageData - Image metadata including crop and focal point
 * @param displayAspectRatio - Override aspect ratio for the container
 * @returns CSS styles for container and image
 */
export function getImageStyles(
  imageData: ImageData,
  displayAspectRatio?: string
): ImageStyles {
  const flipH = imageData.flipHorizontal ?? false
  const flipV = imageData.flipVertical ?? false

  // Check if we have valid crop data
  const hasCrop =
    imageData.cropX != null &&
    imageData.cropY != null &&
    imageData.cropWidth != null &&
    imageData.cropHeight != null &&
    imageData.cropWidth > 0 &&
    imageData.cropHeight > 0

  // Build flip transform if needed
  let flipTransform: string | undefined
  if (flipH || flipV) {
    flipTransform = `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
  }

  // If no crop data, use simple focal point positioning with object-fit cover
  if (!hasCrop) {
    const focalX = imageData.focalX ?? 0.5
    const focalY = imageData.focalY ?? 0.5

    const containerStyles: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
    }

    // Only set aspectRatio if explicitly provided
    if (displayAspectRatio) {
      containerStyles.aspectRatio = displayAspectRatio
    }

    return {
      container: containerStyles,
      image: {
        objectFit: 'cover',
        objectPosition: `${focalX * 100}% ${focalY * 100}%`,
        transform: flipTransform,
      },
    }
  }

  // We have crop data - use transform-based positioning
  const cropX = imageData.cropX!
  const cropY = imageData.cropY!
  const cropW = imageData.cropWidth!
  const cropH = imageData.cropHeight!

  // Determine container aspect ratio from the crop
  // Always use actual crop dimensions for most accurate aspect ratio
  let aspectRatio = `${cropW} / ${cropH}`

  // Only use displayAspectRatio or cropAspectRatio as override if explicitly provided
  if (displayAspectRatio) {
    aspectRatio = displayAspectRatio
  }

  // To display a cropped region:
  // 1. Set container to the crop's aspect ratio
  // 2. Set image width to (1/cropW * 100)% so crop region matches container width
  // 3. Set image height to (1/cropH * 100)% so crop region matches container height
  // 4. Position image so crop region aligns with container top-left
  //
  // Example: cropW=0.5, cropH=0.5, cropX=0.25, cropY=0.25
  // - Image width = 200% (so the 50% crop fills 100% of container)
  // - Image left = -50% (moves the 25% start point to 0)

  const imgWidth = (1 / cropW) * 100
  const imgHeight = (1 / cropH) * 100
  const imgLeft = -(cropX / cropW) * 100
  const imgTop = -(cropY / cropH) * 100

  // Build flip transform (flips around the visible center)
  let transform: string | undefined
  if (flipH || flipV) {
    transform = `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
  }

  return {
    container: {
      position: 'relative',
      width: '100%',
      aspectRatio,
      overflow: 'hidden',
    },
    image: {
      position: 'absolute',
      width: `${imgWidth}%`,
      height: `${imgHeight}%`,
      left: `${imgLeft}%`,
      top: `${imgTop}%`,
      maxWidth: 'none', // Override any max-width constraints
      transform,
      transformOrigin: 'center',
    },
  }
}

/**
 * Aspect ratio presets for cropping
 */
export const ASPECT_RATIOS = {
  '1:1': { label: 'Square (1:1)', value: 1 },
  '16:9': { label: 'Landscape (16:9)', value: 16 / 9 },
  '4:3': { label: 'Landscape (4:3)', value: 4 / 3 },
  '3:2': { label: 'Landscape (3:2)', value: 3 / 2 },
  '9:16': { label: 'Portrait (9:16)', value: 9 / 16 },
  '3:4': { label: 'Portrait (3:4)', value: 3 / 4 },
  '2:3': { label: 'Portrait (2:3)', value: 2 / 3 },
  custom: { label: 'Custom', value: null },
  original: { label: 'Original', value: null },
} as const

export type AspectRatioKey = keyof typeof ASPECT_RATIOS
