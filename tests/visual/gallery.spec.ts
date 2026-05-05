// ABOUTME: Visual regression tests for gallery components
// ABOUTME: Tests carousel, image grid layouts, and responsive behavior

import { test, expect } from '@playwright/test'

test.describe('Gallery Visual Regression', () => {
  test.describe('Hero Carousel', () => {
    test('should match homepage hero carousel snapshot', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Wait for carousel to load
      await page.waitForSelector('[data-testid="hero-carousel"]', {
        timeout: 5000,
      })

      // Take full carousel snapshot
      const carousel = page.locator('[data-testid="hero-carousel"]')
      await expect(carousel).toHaveScreenshot('hero-carousel.png')
    })

    test('should match carousel navigation controls', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const controls = page.locator('[data-testid="carousel-controls"]')
      await expect(controls).toHaveScreenshot('carousel-controls.png')
    })

    test('should match carousel after navigation', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Click next button
      await page.click('[data-testid="carousel-next"]')
      await page.waitForTimeout(1000) // Wait for transition

      const carousel = page.locator('[data-testid="hero-carousel"]')
      await expect(carousel).toHaveScreenshot('hero-carousel-next.png')
    })
  })

  test.describe('Gallery Grid Layout', () => {
    test('should match gallery page layout on desktop', async ({ page }) => {
      await page.goto('/galleries')
      await page.waitForLoadState('networkidle')

      // Wait for images to load
      await page.waitForSelector('[data-testid="gallery-grid"]', {
        timeout: 5000,
      })

      const grid = page.locator('[data-testid="gallery-grid"]')
      await expect(grid).toHaveScreenshot('gallery-grid-desktop.png')
    })

    test('should match individual gallery page', async ({ page }) => {
      // Navigate to first gallery
      await page.goto('/galleries')
      await page.waitForLoadState('networkidle')

      const firstGallery = page.locator('[data-testid="gallery-card"]').first()
      await firstGallery.click()
      await page.waitForLoadState('networkidle')

      // Take snapshot of gallery detail page
      await expect(page).toHaveScreenshot('gallery-detail.png', {
        fullPage: true,
      })
    })

    test('should match gallery image lightbox', async ({ page }) => {
      // Navigate to first gallery and open first image
      await page.goto('/galleries')
      await page.waitForLoadState('networkidle')

      const firstGallery = page.locator('[data-testid="gallery-card"]').first()
      await firstGallery.click()
      await page.waitForLoadState('networkidle')

      // Click first image to open lightbox
      const firstImage = page.locator('[data-testid="gallery-image"]').first()
      await firstImage.click()

      // Wait for lightbox to appear
      await page.waitForSelector('[data-testid="lightbox"]', { timeout: 5000 })

      const lightbox = page.locator('[data-testid="lightbox"]')
      await expect(lightbox).toHaveScreenshot('gallery-lightbox.png')
    })
  })

  test.describe('Responsive Layouts', () => {
    test('should match gallery grid on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/galleries')
      await page.waitForLoadState('networkidle')

      const grid = page.locator('[data-testid="gallery-grid"]')
      await expect(grid).toHaveScreenshot('gallery-grid-mobile.png')
    })

    test('should match gallery grid on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      await page.goto('/galleries')
      await page.waitForLoadState('networkidle')

      const grid = page.locator('[data-testid="gallery-grid"]')
      await expect(grid).toHaveScreenshot('gallery-grid-tablet.png')
    })

    test('should match hero carousel on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const carousel = page.locator('[data-testid="hero-carousel"]')
      await expect(carousel).toHaveScreenshot('hero-carousel-mobile.png')
    })
  })

  test.describe('Image Loading States', () => {
    test('should match gallery with loading placeholders', async ({ page }) => {
      // Throttle network to see loading states
      await page.route('**/*.{png,jpg,jpeg,webp}', (route) => {
        setTimeout(() => route.continue(), 2000)
      })

      await page.goto('/galleries')

      // Take snapshot during loading
      const grid = page.locator('[data-testid="gallery-grid"]')
      await expect(grid).toHaveScreenshot('gallery-loading.png')
    })
  })
})
