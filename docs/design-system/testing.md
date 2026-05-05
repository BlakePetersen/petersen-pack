# Testing Guidelines

Comprehensive testing guidelines for Luna Design System components.

## Testing Strategy

We use a multi-layered testing approach:

1. **Unit Tests** - Component logic and utilities
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Full user workflows (Playwright)
4. **Visual Tests** - Component appearance (Storybook)

## Testing Tools

- **Playwright** - End-to-end testing
- **Storybook** - Component development and visual testing
- **TypeScript** - Type checking as tests

## E2E Testing with Playwright

### Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Component Tests

Test components in realistic scenarios:

```typescript
// tests/admin/navigation.spec.ts
import { test, expect } from '../fixtures'

test.describe('Admin Navigation', () => {
  test('displays sidebar with all main sections', async ({
    authenticatedPage,
  }) => {
    const nav = authenticatedPage.getByRole('navigation')
    await expect(nav).toBeVisible()

    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(
      nav.getByRole('link', { name: 'Galleries', exact: true })
    ).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Blog Posts' })).toBeVisible()
  })

  test('navigates to galleries page', async ({ authenticatedPage }) => {
    const nav = authenticatedPage.getByRole('navigation')
    await nav.getByRole('link', { name: 'Galleries', exact: true }).click()

    await expect(authenticatedPage).toHaveURL('/admin/galleries')
    await expect(
      authenticatedPage.getByRole('heading', { name: /galleries/i })
    ).toBeVisible()
  })
})
```

### Accessibility Tests

Test accessibility features:

```typescript
// tests/accessibility/navigation.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('has no automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Tab through nav items
    await page.keyboard.press('Tab')
    await expect(page.locator('nav a').first()).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('nav a').nth(1)).toBeFocused()
  })

  test('has proper ARIA labels', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation')
    await expect(nav).toHaveAttribute('aria-label')

    const buttons = page.getByRole('button')
    for (const button of await buttons.all()) {
      const label = await button.getAttribute('aria-label')
      const text = await button.textContent()
      expect(label || text).toBeTruthy()
    }
  })
})
```

### Visual Regression Tests

Test visual consistency:

```typescript
// tests/visual/components.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Tests', () => {
  test('Button variants match snapshot', async ({ page }) => {
    await page.goto('/design-system#buttons')

    const buttonSection = page.locator('#buttons')
    await expect(buttonSection).toHaveScreenshot('button-variants.png')
  })

  test('Dark mode matches snapshot', async ({ page }) => {
    await page.goto('/')

    // Toggle dark mode
    await page.getByRole('button', { name: /dark mode/i }).click()

    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
    })
  })
})
```

### Form Tests

Test form behavior comprehensively:

```typescript
// tests/forms/contact.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test('validates required fields', async ({ page }) => {
    await page.goto('/contact')

    // Submit empty form
    await page.getByRole('button', { name: 'Send Message' }).click()

    // Check validation messages
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Message is required')).toBeVisible()
  })

  test('validates email format', async ({ page }) => {
    await page.goto('/contact')

    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Message').fill('Test message')
    await page.getByRole('button', { name: 'Send Message' }).click()

    await expect(page.getByText('Invalid email format')).toBeVisible()
  })

  test('submits successfully with valid data', async ({ page }) => {
    await page.goto('/contact')

    await page.getByLabel('Name').fill('John Doe')
    await page.getByLabel('Email').fill('john@example.com')
    await page.getByLabel('Message').fill('This is a test message')

    await page.getByRole('button', { name: 'Send Message' }).click()

    await expect(page.getByText('Message sent successfully')).toBeVisible()
  })

  test('prevents double submission', async ({ page }) => {
    await page.goto('/contact')

    await page.getByLabel('Name').fill('John Doe')
    await page.getByLabel('Email').fill('john@example.com')
    await page.getByLabel('Message').fill('Test message')

    const submitButton = page.getByRole('button', { name: 'Send Message' })

    await submitButton.click()
    await expect(submitButton).toBeDisabled()
  })
})
```

## Running Tests

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in a specific file
pnpm test tests/admin/navigation.spec.ts

# Run tests in UI mode (interactive)
pnpm test:ui

# Run tests in debug mode
pnpm test:debug

# View test report
pnpm test:report
```

### Test Configuration

Tests run against the dev server at `http://localhost:3333`. The test runner automatically starts the dev server before running tests.

### Viewing Results

After running tests, view the HTML report:

```bash
pnpm test:report
```

This opens an interactive report showing:

- Test results and timing
- Screenshots and videos of failures
- Detailed trace files for debugging

## Component Testing Best Practices

### 1. Test User Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
test('sets state correctly', async ({ page }) => {
  // Don't test internal state
})

// ✅ Good: Testing user behavior
test('displays success message after form submission', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Success!')).toBeVisible()
})
```

### 2. Use Semantic Queries

```typescript
// ✅ Good: Role-based queries
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { level: 1 })
page.getByLabel('Email')

// Also good: Text content
page.getByText('Welcome to Luna')

// ❌ Avoid: Implementation details
page.locator('.submit-button')
page.locator('#email-input')
```

### 3. Wait for Conditions, Not Time

```typescript
// ❌ Bad: Arbitrary waits
await page.waitForTimeout(1000)

// ✅ Good: Wait for specific conditions
await expect(page.getByText('Loaded')).toBeVisible()
await page.waitForLoadState('networkidle')
await page.waitForResponse((resp) => resp.url().includes('/api/data'))
```

### 4. Test Edge Cases

```typescript
test.describe('Gallery Grid', () => {
  test('handles empty state', async ({ page }) => {
    await page.goto('/portfolio?filter=nonexistent')
    await expect(page.getByText('No galleries found')).toBeVisible()
  })

  test('handles single item', async ({ page }) => {
    // Test with only one gallery
  })

  test('handles many items', async ({ page }) => {
    // Test with 100+ galleries
  })

  test('handles long text', async ({ page }) => {
    // Test with very long titles/descriptions
  })
})
```

### 5. Test Responsive Behavior

```typescript
test.describe('Responsive Navigation', () => {
  test('shows mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const mobileMenu = page.getByRole('button', { name: 'Menu' })
    await expect(mobileMenu).toBeVisible()

    await mobileMenu.click()
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('shows desktop nav on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
    await expect(page.getByRole('button', { name: 'Menu' })).not.toBeVisible()
  })
})
```

## Testing Utilities

### Custom Test Fixtures

Create reusable test fixtures:

```typescript
// tests/fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.waitForURL('/admin')

    await use(page)
  },
})

// Use in tests
test('admin can create gallery', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/admin/galleries/new')
  // ...
})
```

### Helper Functions

```typescript
// tests/helpers.ts
export async function fillContactForm(
  page,
  data: {
    name: string
    email: string
    message: string
  }
) {
  await page.getByLabel('Name').fill(data.name)
  await page.getByLabel('Email').fill(data.email)
  await page.getByLabel('Message').fill(data.message)
}

export async function expectToast(page, message: string) {
  const toast = page.locator('[role="alert"]')
  await expect(toast).toContainText(message)
  await expect(toast).toBeVisible()
}
```

## Storybook for Visual Testing

### Story Structure

```typescript
// stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/Button'

const meta: Meta<typeof Button> = {
  title: 'Commons/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'destructive'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Button>
      <PlusIcon className="w-4 h-4 mr-2" />
      Add Item
    </Button>
  ),
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm playwright install
      - run: pnpm test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Coverage Goals

- **Critical paths**: 100% coverage
- **UI components**: 80%+ coverage
- **Utilities**: 90%+ coverage
- **Integration tests**: All major workflows
- **E2E tests**: Happy paths + critical edge cases

## When to Write Tests

1. **Before implementing** (TDD):
   - Complex business logic
   - Critical user workflows
   - Bug fixes

2. **After implementing**:
   - UI components
   - Refactoring existing code

3. **Always**:
   - Accessibility features
   - Form validation
   - Error handling
