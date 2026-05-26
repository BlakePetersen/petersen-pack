// ABOUTME: Tests for image utilities
// ABOUTME: Validates CSS calculation logic for cropped images

import { describe, it, expect } from 'vitest'
import { getImageStyles, ASPECT_RATIOS } from './image-utils'

describe('getImageStyles', () => {
  describe('uncropped images', () => {
    it('should return basic focal point styles when no crop data provided', () => {
      const result = getImageStyles(
        {
          url: 'https://example.com/image.jpg',
          focalX: 0.6,
          focalY: 0.4,
        },
        '16/9'
      )

      expect(result.container).toEqual({
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        overflow: 'hidden',
      })
      expect(result.image).toEqual({
        objectFit: 'cover',
        objectPosition: '60% 40%',
      })
    })

    it('should default focal point to center when not provided', () => {
      const result = getImageStyles(
        {
          url: 'https://example.com/image.jpg',
        },
        '4/3'
      )

      expect(result.image.objectPosition).toBe('50% 50%')
    })

    it('should handle null focal values', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
        focalX: null,
        focalY: null,
      })

      expect(result.image.objectPosition).toBe('50% 50%')
    })

    it('should omit aspectRatio when not provided', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
      })

      expect(result.container.aspectRatio).toBeUndefined()
    })
  })

  describe('cropped images', () => {
    it('should apply transform scale when crop data provided', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
        focalX: 0.5,
        focalY: 0.5,
        cropX: 0.25,
        cropY: 0.25,
        cropWidth: 0.5,
        cropHeight: 0.5,
      })

      expect(result.image.transform).toBe('scale(2, 2)')
    })

    it('should calculate correct transformOrigin for centered crop', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
        focalX: 0.5,
        focalY: 0.5,
        cropX: 0.25,
        cropY: 0.25,
        cropWidth: 0.5,
        cropHeight: 0.5,
      })

      // focalX - cropX = 0.5 - 0.25 = 0.25
      // (0.25 / 0.5) * 100 = 50%
      expect(result.image.transformOrigin).toBe('50% 50%')
    })

    it('should calculate correct transformOrigin for off-center focal point', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
        focalX: 0.375, // 37.5% of full image
        focalY: 0.375,
        cropX: 0.25, // Crop starts at 25%
        cropY: 0.25,
        cropWidth: 0.5, // Crop is 50% wide
        cropHeight: 0.5,
      })

      // focalX - cropX = 0.375 - 0.25 = 0.125
      // (0.125 / 0.5) * 100 = 25%
      expect(result.image.transformOrigin).toBe('25% 25%')
    })

    it('should handle asymmetric crops', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
        focalX: 0.5,
        focalY: 0.5,
        cropX: 0.1,
        cropY: 0.2,
        cropWidth: 0.6,
        cropHeight: 0.4,
      })

      expect(result.image.transform).toBe(`scale(${1 / 0.6}, ${1 / 0.4})`)
      expect(result.image.transformOrigin).toBe(
        `${((0.5 - 0.1) / 0.6) * 100}% ${((0.5 - 0.2) / 0.4) * 100}%`
      )
    })

    it('should still apply focal point when crop is present', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
        focalX: 0.7,
        focalY: 0.3,
        cropX: 0.25,
        cropY: 0.25,
        cropWidth: 0.5,
        cropHeight: 0.5,
      })

      expect(result.image.objectPosition).toBe('70% 30%')
    })

    it('should require all crop fields to be present', () => {
      const result = getImageStyles({
        url: 'https://example.com/image.jpg',
        cropX: 0.25,
        cropY: 0.25,
        cropWidth: 0.5,
        // Missing cropHeight
      })

      expect(result.image.transform).toBeUndefined()
    })
  })
})

describe('ASPECT_RATIOS', () => {
  it('should have correct aspect ratio values', () => {
    expect(ASPECT_RATIOS['1:1'].value).toBe(1)
    expect(ASPECT_RATIOS['4:3'].value).toBe(4 / 3)
    expect(ASPECT_RATIOS['16:9'].value).toBe(16 / 9)
    expect(ASPECT_RATIOS['3:2'].value).toBe(3 / 2)
    expect(ASPECT_RATIOS['9:16'].value).toBe(9 / 16)
    expect(ASPECT_RATIOS['3:4'].value).toBe(3 / 4)
    expect(ASPECT_RATIOS['2:3'].value).toBe(2 / 3)
    expect(ASPECT_RATIOS.original.value).toBeNull()
    expect(ASPECT_RATIOS.custom.value).toBeNull()
  })

  it('should have descriptive labels', () => {
    expect(ASPECT_RATIOS['1:1'].label).toBe('Square (1:1)')
    expect(ASPECT_RATIOS['4:3'].label).toBe('Landscape (4:3)')
    expect(ASPECT_RATIOS['16:9'].label).toBe('Landscape (16:9)')
    expect(ASPECT_RATIOS['3:2'].label).toBe('Landscape (3:2)')
    expect(ASPECT_RATIOS['9:16'].label).toBe('Portrait (9:16)')
    expect(ASPECT_RATIOS['3:4'].label).toBe('Portrait (3:4)')
    expect(ASPECT_RATIOS['2:3'].label).toBe('Portrait (2:3)')
    expect(ASPECT_RATIOS.original.label).toBe('Original')
    expect(ASPECT_RATIOS.custom.label).toBe('Custom')
  })
})
