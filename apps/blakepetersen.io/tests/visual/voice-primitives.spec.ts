// ABOUTME: Visual regression torture test for voice primitives (CONTENT-06).
// ABOUTME: Captures /skills/convex-patterns in three viewports — light, dark, mobile.

import { test, expect } from '@playwright/test'

const SKILL_SLUG = 'convex-patterns'

test.describe('Voice primitives torture test (CONTENT-06)', () => {
  test('renders AuthorNote and DecisionRationale without layout regression', async ({
    page
  }, testInfo) => {
    // next-themes reads localStorage.theme BEFORE prefers-color-scheme.
    // colorScheme device emulation alone does not flip data-theme.
    // Force the attribute pre-navigation by writing localStorage.theme.
    const theme = testInfo.project.name.includes('dark') ? 'dark' : 'light'
    await page.addInitScript(t => {
      window.localStorage.setItem('theme', t)
    }, theme)

    await page.goto(`/skills/${SKILL_SLUG}`)

    // Anchor on AuthorNote — fails fast if the component isn't rendered
    // (e.g., 404 page would have no <aside role="note">).
    const authorNote = page.getByRole('note', { name: "Author's note" })
    await expect(authorNote).toBeVisible()

    // Full-page snapshot per UI-SPEC D-07
    await expect(page).toHaveScreenshot(
      `skill-detail-${testInfo.project.name}.png`,
      {
        fullPage: true,
        animations: 'disabled'
      }
    )
  })
})
