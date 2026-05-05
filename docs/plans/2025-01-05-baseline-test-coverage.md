# Baseline Test Coverage Plan

**Date:** 2025-01-05
**Status:** Approved

## Goal

Establish baseline test and story coverage for existing components before implementing new CMS features.

## Scope

Focus on high-value, reusable components that will be used in CMS implementation:

### Priority 1: Commons Components (Shared Primitives)

These are used everywhere and must be reliable:

**Component Stories & Tests:**

1. **Button** - All variants, sizes, states (loading, disabled)
2. **Card** - Standard card layouts
3. **Badge** - All variants
4. **Container** - Layout component
5. **PageHeader** - Standard page headers
6. **Section** - Layout sections

### Priority 2: Form Components (Will be heavily used in CMS)

1. **Input fields** - Text, textarea, email validation
2. **File upload** - Image upload with preview
3. **Repeatable fields** - Add/remove array items (for services, paragraphs, stats)

### Priority 3: Admin-Specific Components (Sol)

1. **AdminLayout** - Sidebar navigation
2. **Form patterns** - Common form behaviors (save/cancel, validation, toasts)

## Implementation Strategy

### Storybook Stories

For each component, create a story file with:

- **Default story** - Component with default props
- **All variants** - Every variant option demonstrated
- **Interactive story** - Demonstrates user interactions
- **Edge cases** - Long text, empty states, error states

Example structure:

```typescript
// components/commons/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Commons/Button',
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { children: 'Button' }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  )
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
}

export const States: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button>Loading...</Button>
    </div>
  )
}
```

### Playwright Tests

For each priority area, create E2E tests:

1. **Setup:** Create `playwright.config.ts`
2. **Admin workflow tests:**
   - Login flow
   - Navigation
   - Form submission
3. **Component interaction tests:**
   - Button clicks
   - Form validation
   - File uploads

Example test:

```typescript
// tests/admin/navigation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login helper
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.waitForURL('/admin')
  })

  test('displays sidebar with all sections', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Galleries' })).toBeVisible()
  })

  test('navigates to galleries page', async ({ page }) => {
    await page.getByRole('link', { name: 'Galleries' }).click()
    await expect(page).toHaveURL('/admin/galleries')
    await expect(page.getByRole('heading', { name: 'Galleries' })).toBeVisible()
  })
})
```

## Deliverables

1. **Playwright Config** - `playwright.config.ts` configured for Luna
2. **Component Stories** - 6-10 story files for Priority 1 components
3. **E2E Tests** - 3-5 test suites for critical admin workflows
4. **Test Documentation** - Update testing.md with actual examples
5. **CI Integration** - Add test script to package.json

## Non-Goals

- Complete coverage of all components (incremental approach)
- Visual regression testing (future enhancement)
- Unit tests for utilities (focus on E2E first)
- Performance testing (future enhancement)

## Success Criteria

- Storybook runs and displays all stories
- Playwright tests pass locally
- Build + tests pass together
- Documentation updated with real examples
- Foundation established for adding tests as we build CMS features

## Timeline

Estimated: 2-3 hours

1. Setup (30 min) - Playwright config, test fixtures
2. Stories (60-90 min) - 6-10 component stories
3. Tests (60-90 min) - 3-5 test suites
4. Documentation (30 min) - Update docs with examples
