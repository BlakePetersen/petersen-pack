# Baseline Test Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish baseline Storybook stories and Playwright E2E tests for existing components before CMS implementation.

**Architecture:** Add Storybook stories for 6 reusable commons components (Button, Card, Badge, Container, PageHeader, Section) and create 3 Playwright E2E test suites for critical admin workflows (login, navigation, form submission).

**Tech Stack:** Storybook 10, Playwright 1.56, TypeScript, Next.js 15

---

## Task 1: Set Up Playwright Configuration

**Files:**

- Create: `playwright.config.ts`
- Create: `tests/fixtures.ts`
- Modify: `package.json` (add test scripts)
- Create: `.github/workflows/test.yml` (optional, for CI)

**Step 1: Create Playwright config**

Create `playwright.config.ts`:

```typescript
// ABOUTME: Playwright configuration for E2E testing
// ABOUTME: Configured for Next.js dev server on port 3333

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
    screenshot: 'only-on-failure',
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
    timeout: 120000,
  },
})
```

**Step 2: Create test fixtures for authentication**

Create `tests/fixtures.ts`:

```typescript
// ABOUTME: Playwright test fixtures
// ABOUTME: Provides authenticated page fixture for admin tests

import { test as base } from '@playwright/test'

type Fixtures = {
  authenticatedPage: typeof base extends (fixtures: infer T) => any ? T : never
}

export const test = base.extend<Fixtures>({
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

export { expect } from '@playwright/test'
```

**Step 3: Add test scripts to package.json**

Add to `package.json` scripts section:

```json
"test": "playwright test",
"test:ui": "playwright test --ui",
"test:debug": "playwright test --debug",
"test:report": "playwright show-report"
```

**Step 4: Verify Playwright setup**

Run: `pnpm exec playwright install`
Expected: Installs browser binaries

Run: `pnpm test --help`
Expected: Shows Playwright CLI help

**Step 5: Commit**

```bash
git add playwright.config.ts tests/fixtures.ts package.json
git commit -m "feat: add Playwright E2E test configuration

Set up Playwright with authenticated page fixture for admin testing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Button Component Stories

**Files:**

- Create: `components/commons/Button.stories.tsx`

**Step 1: Create Button stories file**

Create `components/commons/Button.stories.tsx`:

```typescript
// ABOUTME: Storybook stories for Button component
// ABOUTME: Demonstrates all variants, sizes, and states

import type { Meta, StoryObj } from '@storybook/react'
import { Button, ButtonLink } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Commons/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button className="opacity-50 cursor-wait">Loading</Button>
    </div>
  ),
}

export const WithLinks: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ButtonLink href="/about" variant="primary">
        Go to About
      </ButtonLink>
      <ButtonLink href="/contact" variant="outline">
        Contact Us
      </ButtonLink>
    </div>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-950 p-8 rounded-lg">
      <div className="flex flex-wrap gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </div>
  ),
}
```

**Step 2: Verify stories render**

Run: `pnpm storybook`
Navigate to: http://localhost:6006
Expected: Button stories appear in sidebar under "Commons/Button"

**Step 3: Commit**

```bash
git add components/commons/Button.stories.tsx
git commit -m "feat: add Button component stories

Storybook stories demonstrating all Button variants, sizes, and states including dark mode.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Card Component Stories

**Files:**

- Create: `components/commons/Card.stories.tsx`

**Step 1: Create Card stories**

Create `components/commons/Card.stories.tsx`:

```typescript
// ABOUTME: Storybook stories for Card component
// ABOUTME: Demonstrates card layouts and content patterns

import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Commons/Card',
  component: Card,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Card Title</h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is a simple card with some content inside.
      </p>
    </Card>
  ),
}

export const WithPadding: Story = {
  render: () => (
    <div className="space-y-4">
      <Card className="p-4">
        <p>Card with p-4 padding</p>
      </Card>
      <Card className="p-gutter">
        <p>Card with p-gutter padding</p>
      </Card>
      <Card className="p-gutter-lg">
        <p>Card with p-gutter-lg padding</p>
      </Card>
    </div>
  ),
}

export const WithBorder: Story = {
  render: () => (
    <Card className="border border-gray-200 dark:border-gray-700 p-gutter">
      <h3 className="text-lg font-semibold mb-2">Bordered Card</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Card with visible border styling.
      </p>
    </Card>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-950 p-8 rounded-lg">
      <Card className="p-gutter">
        <h3 className="text-lg font-semibold mb-2 text-white">Dark Mode Card</h3>
        <p className="text-gray-400">
          Card rendered in dark mode with appropriate styling.
        </p>
      </Card>
    </div>
  ),
}
```

**Step 2: Verify stories**

Run: `pnpm storybook`
Expected: Card stories visible under "Commons/Card"

**Step 3: Commit**

```bash
git add components/commons/Card.stories.tsx
git commit -m "feat: add Card component stories

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Badge Component Stories

**Files:**

- Create: `components/commons/Badge.stories.tsx`

**Step 1: Create Badge stories**

Create `components/commons/Badge.stories.tsx`:

```typescript
// ABOUTME: Storybook stories for Badge component
// ABOUTME: Demonstrates badge variants and use cases

import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Commons/Badge',
  component: Badge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Badge>

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="accent">Accent</Badge>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge className="text-xs px-2 py-0.5">Small</Badge>
      <Badge>Default</Badge>
      <Badge className="text-sm px-3 py-1">Large</Badge>
    </div>
  ),
}

export const StatusIndicators: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
          Active
        </Badge>
        <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
          Pending
        </Badge>
        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
          Inactive
        </Badge>
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-950 p-8 rounded-lg">
      <div className="flex flex-wrap gap-3">
        <Badge variant="solid">Solid</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="accent">Accent</Badge>
      </div>
    </div>
  ),
}
```

**Step 2: Verify stories**

Run: `pnpm storybook`
Expected: Badge stories visible

**Step 3: Commit**

```bash
git add components/commons/Badge.stories.tsx
git commit -m "feat: add Badge component stories

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Container, PageHeader, and Section Stories

**Files:**

- Create: `components/commons/Container.stories.tsx`
- Create: `components/commons/PageHeader.stories.tsx`
- Create: `components/commons/Section.stories.tsx`

**Step 1: Create Container stories**

Create `components/commons/Container.stories.tsx`:

```typescript
// ABOUTME: Storybook stories for Container component
// ABOUTME: Layout component stories

import type { Meta, StoryObj } from '@storybook/react'
import { Container } from './Container'

const meta: Meta<typeof Container> = {
  title: 'Commons/Container',
  component: Container,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Container>

export const Default: Story = {
  render: () => (
    <Container>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        Content inside container with max-width constraint
      </div>
    </Container>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <div className="w-full bg-gray-100 dark:bg-gray-800 p-4">
      Full width content (no container)
    </div>
  ),
}
```

**Step 2: Create PageHeader stories**

Create `components/commons/PageHeader.stories.tsx`:

```typescript
// ABOUTME: Storybook stories for PageHeader component
// ABOUTME: Page header patterns

import type { Meta, StoryObj } from '@storybook/react'
import { PageHeader } from './PageHeader'

const meta: Meta<typeof PageHeader> = {
  title: 'Commons/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: 'Page Title',
    description: 'This is a description of the page content.',
  },
}

export const WithoutDescription: Story = {
  args: {
    title: 'Simple Page Title',
  },
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-950 p-8">
      <PageHeader
        title="Dark Mode Header"
        description="Header displayed in dark mode"
      />
    </div>
  ),
}
```

**Step 3: Create Section stories**

Create `components/commons/Section.stories.tsx`:

```typescript
// ABOUTME: Storybook stories for Section component
// ABOUTME: Section layout patterns

import type { Meta, StoryObj } from '@storybook/react'
import { Section } from './Section'

const meta: Meta<typeof Section> = {
  title: 'Commons/Section',
  component: Section,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Section>

export const Default: Story = {
  render: () => (
    <Section>
      <h2 className="text-2xl font-bold mb-4">Section Content</h2>
      <p>This is content inside a section with standard spacing.</p>
    </Section>
  ),
}

export const WithBackground: Story = {
  render: () => (
    <Section className="bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4">Section with Background</h2>
      <p>Section with custom background color.</p>
    </Section>
  ),
}
```

**Step 4: Verify all layout stories**

Run: `pnpm storybook`
Expected: Container, PageHeader, Section stories all visible

**Step 5: Commit**

```bash
git add components/commons/Container.stories.tsx components/commons/PageHeader.stories.tsx components/commons/Section.stories.tsx
git commit -m "feat: add layout component stories (Container, PageHeader, Section)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Admin Login E2E Test

**Files:**

- Create: `tests/admin/login.spec.ts`

**Step 1: Create login test suite**

Create `tests/admin/login.spec.ts`:

```typescript
// ABOUTME: E2E tests for admin login flow
// ABOUTME: Tests authentication and navigation after login

import { test, expect } from '@playwright/test'

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('displays login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('shows validation for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /login/i }).click()

    // Form should not submit
    await expect(page).toHaveURL('/login')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /login/i }).click()

    // Should show error message
    await expect(page.getByText(/invalid/i)).toBeVisible()
  })

  test('logs in with valid credentials and redirects to admin', async ({
    page,
  }) => {
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: /login/i }).click()

    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin')
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible()
  })

  test('persists login across page navigation', async ({ page }) => {
    // Login
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: /login/i }).click()
    await page.waitForURL('/admin')

    // Navigate to galleries
    await page.getByRole('link', { name: /galleries/i }).click()
    await expect(page).toHaveURL(/\/admin\/galleries/)

    // Should still be logged in (not redirected to login)
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
```

**Step 2: Run login tests**

Run: `pnpm test tests/admin/login.spec.ts`
Expected: All 5 login tests pass

**Step 3: Commit**

```bash
git add tests/admin/login.spec.ts
git commit -m "test: add admin login E2E tests

Tests for login form display, validation, authentication, and session persistence.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Admin Navigation E2E Test

**Files:**

- Create: `tests/admin/navigation.spec.ts`

**Step 1: Create navigation test suite**

Create `tests/admin/navigation.spec.ts`:

```typescript
// ABOUTME: E2E tests for admin navigation
// ABOUTME: Tests sidebar navigation and routing

import { test, expect } from '../fixtures'

test.describe('Admin Navigation', () => {
  test('displays sidebar with all main sections', async ({
    authenticatedPage,
  }) => {
    await expect(authenticatedPage.getByRole('navigation')).toBeVisible()

    // Verify main navigation items
    await expect(
      authenticatedPage.getByRole('link', { name: /dashboard/i })
    ).toBeVisible()
    await expect(
      authenticatedPage.getByRole('link', { name: /galleries/i })
    ).toBeVisible()
    await expect(
      authenticatedPage.getByRole('link', { name: /blog/i })
    ).toBeVisible()
    await expect(
      authenticatedPage.getByRole('link', { name: /testimonials/i })
    ).toBeVisible()
    await expect(
      authenticatedPage.getByRole('link', { name: /pricing/i })
    ).toBeVisible()
  })

  test('navigates to galleries page', async ({ authenticatedPage }) => {
    await authenticatedPage
      .getByRole('link', { name: /galleries/i })
      .first()
      .click()

    await expect(authenticatedPage).toHaveURL('/admin/galleries')
    await expect(
      authenticatedPage.getByRole('heading', { name: /galleries/i })
    ).toBeVisible()
  })

  test('navigates to blog page', async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole('link', { name: /blog/i }).first().click()

    await expect(authenticatedPage).toHaveURL('/admin/blog')
    await expect(
      authenticatedPage.getByRole('heading', { name: /blog/i })
    ).toBeVisible()
  })

  test('highlights active navigation item', async ({ authenticatedPage }) => {
    await authenticatedPage
      .getByRole('link', { name: /galleries/i })
      .first()
      .click()
    await authenticatedPage.waitForURL('/admin/galleries')

    // Active nav item should have special styling (aria-current or specific class)
    const galleriesLink = authenticatedPage
      .getByRole('link', { name: /galleries/i })
      .first()
    const classes = await galleriesLink.getAttribute('class')

    // Should have active state styling
    expect(classes).toContain('bg-')
  })

  test('shows logout button', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('button', { name: /logout/i })
    ).toBeVisible()
  })
})
```

**Step 2: Run navigation tests**

Run: `pnpm test tests/admin/navigation.spec.ts`
Expected: All navigation tests pass

**Step 3: Commit**

```bash
git add tests/admin/navigation.spec.ts
git commit -m "test: add admin navigation E2E tests

Tests for sidebar display, navigation routing, and active states.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Admin Form Submission E2E Test

**Files:**

- Create: `tests/admin/forms.spec.ts`

**Step 1: Create form submission tests**

Create `tests/admin/forms.spec.ts`:

```typescript
// ABOUTME: E2E tests for admin form submissions
// ABOUTME: Tests form validation, submission, and success states

import { test, expect } from '../fixtures'

test.describe('Admin Forms', () => {
  test.describe('Testimonial Form', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/testimonials/new')
    })

    test('displays form fields', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByLabel(/client name/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/project type/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/quote/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/rating/i)).toBeVisible()
    })

    test('validates required fields', async ({ authenticatedPage }) => {
      // Try to submit empty form
      await authenticatedPage
        .getByRole('button', { name: /save|create/i })
        .click()

      // Should show validation or stay on page
      await expect(authenticatedPage).toHaveURL('/admin/testimonials/new')
    })

    test('successfully creates testimonial', async ({ authenticatedPage }) => {
      await authenticatedPage.getByLabel(/client name/i).fill('Test Client')
      await authenticatedPage.getByLabel(/project type/i).fill('Wedding')
      await authenticatedPage.getByLabel(/quote/i).fill('Great photographer!')
      await authenticatedPage.getByLabel(/rating/i).fill('5')

      await authenticatedPage
        .getByRole('button', { name: /save|create/i })
        .click()

      // Should redirect to testimonials list
      await expect(authenticatedPage).toHaveURL('/admin/testimonials')

      // Should show success message or new testimonial
      await expect(authenticatedPage.getByText(/test client/i)).toBeVisible()
    })
  })

  test.describe('Gallery Form', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/galleries/new')
    })

    test('displays gallery form', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByLabel(/title/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/slug/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/shoot type/i)).toBeVisible()
    })

    test('auto-generates slug from title', async ({ authenticatedPage }) => {
      await authenticatedPage.getByLabel(/title/i).fill('Test Gallery')

      // Trigger blur to auto-generate slug
      await authenticatedPage.getByLabel(/shoot type/i).click()

      const slugValue = await authenticatedPage.getByLabel(/slug/i).inputValue()
      expect(slugValue).toBe('test-gallery')
    })
  })
})
```

**Step 2: Run form tests**

Run: `pnpm test tests/admin/forms.spec.ts`
Expected: All form tests pass

**Step 3: Commit**

```bash
git add tests/admin/forms.spec.ts
git commit -m "test: add admin form E2E tests

Tests for form validation, auto-generation, and submission flows.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Update Documentation with Real Examples

**Files:**

- Modify: `docs/design-system/testing.md` (replace example code with actual tests)

**Step 1: Update testing documentation**

Update `docs/design-system/testing.md` lines 60-104 with actual code from our tests:

````markdown
### Component Tests

Test components in realistic scenarios:

```typescript
// tests/admin/navigation.spec.ts
import { test, expect } from '../fixtures'

test.describe('Admin Navigation', () => {
  test('displays sidebar with all main sections', async ({
    authenticatedPage,
  }) => {
    await expect(authenticatedPage.getByRole('navigation')).toBeVisible()

    await expect(
      authenticatedPage.getByRole('link', { name: /dashboard/i })
    ).toBeVisible()
    await expect(
      authenticatedPage.getByRole('link', { name: /galleries/i })
    ).toBeVisible()
  })

  test('navigates to galleries page', async ({ authenticatedPage }) => {
    await authenticatedPage
      .getByRole('link', { name: /galleries/i })
      .first()
      .click()

    await expect(authenticatedPage).toHaveURL('/admin/galleries')
    await expect(
      authenticatedPage.getByRole('heading', { name: /galleries/i })
    ).toBeVisible()
  })
})
```
````

````

**Step 2: Add section about running tests**

Add to `docs/design-system/testing.md` before "Component Testing Best Practices":

```markdown
## Running Tests

### Run All Tests

```bash
pnpm test
````

### Run Specific Test File

```bash
pnpm test tests/admin/login.spec.ts
```

### Run Tests in UI Mode

```bash
pnpm test:ui
```

### Debug Tests

```bash
pnpm test:debug
```

### View Test Report

```bash
pnpm test:report
```

````

**Step 3: Commit documentation updates**

```bash
git add docs/design-system/testing.md
git commit -m "docs: update testing guide with real examples

Replace example code with actual tests from the codebase and add test running commands.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
````

---

## Task 10: Run Full Test Suite and Verify

**Step 1: Run all Playwright tests**

Run: `pnpm test`
Expected: All tests pass (login, navigation, forms)

**Step 2: Run Storybook**

Run: `pnpm storybook`
Navigate to: http://localhost:6006
Expected: All 6 component stories render correctly

**Step 3: Run build to ensure no TypeScript errors**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify baseline test coverage complete

All Storybook stories and Playwright tests passing. Build succeeds.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Verification Checklist

- [ ] Playwright config created and browser installed
- [ ] Test fixtures for authentication created
- [ ] 6 component stories created (Button, Card, Badge, Container, PageHeader, Section)
- [ ] 3 E2E test suites created (login, navigation, forms)
- [ ] All stories render in Storybook
- [ ] All Playwright tests pass
- [ ] Build succeeds
- [ ] Documentation updated with real examples
- [ ] All commits follow convention

---

## Success Criteria

✅ `pnpm storybook` displays all 6 component stories
✅ `pnpm test` passes all E2E tests
✅ `pnpm build` succeeds with no errors
✅ Documentation reflects actual test code
✅ Foundation established for adding tests incrementally during CMS development
