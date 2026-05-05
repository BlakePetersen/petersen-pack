# Contributing to Luna Design System

Guidelines for contributing components and improvements to the design system.

## Quick Start

1. **Identify the component type** - Commons, Luna, or Sol?
2. **Check if it already exists** - Search the design system pages
3. **Create the component** - Follow the patterns
4. **Add to Storybook** - Document with stories
5. **Write tests** - Ensure quality
6. **Update design system page** - Make it discoverable

## Component Classification

### Commons (`/components/commons/`)

**Use for**: Primitive, reusable components used by both Luna and Sol

**Examples**:

- Button, Card, Badge
- Container, Section, Heading
- Input, Select, Textarea
- Modal, Dialog, Dropdown

**Criteria**:

- ✅ Used in both public and admin
- ✅ No business logic
- ✅ Highly reusable
- ✅ Presents data, doesn't fetch it

### Luna (`/components/luna/`)

**Use for**: Public-facing portfolio components

**Examples**:

- HeroCarousel, GalleryGrid
- BlogCard, TestimonialSection
- ContactForm, BookingCalendar
- PortfolioFilter

**Criteria**:

- ✅ Public website only
- ✅ Photography/portfolio specific
- ✅ Client-facing interface

### Sol (`/components/sol/`)

**Use for**: Admin/CMS components

**Examples**:

- DataTable, DashboardWidget
- AdminForm, StatusBadge
- UploadManager, ImageEditor
- Analytics, ReportCard

**Criteria**:

- ✅ Admin interface only
- ✅ Content management focused
- ✅ Internal tools

## Creating a New Component

### Step 1: Plan

Ask yourself:

- Does this component already exist?
- Can I compose existing components instead?
- Is this really reusable, or is it one-off?
- Which category does it belong to?

### Step 2: Create the File

```bash
# Commons component
touch components/commons/MyComponent.tsx

# Luna component
touch components/luna/MyFeature.tsx

# Sol component
touch components/sol/AdminWidget.tsx
```

### Step 3: Write the Component

````typescript
// ABOUTME: Brief description of what the component does
// ABOUTME: Context about when/where to use it

import type { ReactNode } from 'react'

export interface MyComponentProps {
  /**
   * The main content to display
   */
  children: ReactNode

  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'secondary'

  /**
   * Size of the component
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Optional click handler
   */
  onClick?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * MyComponent provides...
 *
 * @example
 * ```tsx
 * <MyComponent variant="primary" size="lg">
 *   Content here
 * </MyComponent>
 * ```
 */
export function MyComponent({
  children,
  variant = 'default',
  size = 'md',
  onClick,
  className,
}: MyComponentProps) {
  return (
    <div
      className={cn(/* styles */, className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
````

### Step 4: Add to Index

```typescript
// components/commons/index.ts
export { MyComponent } from './MyComponent'
export type { MyComponentProps } from './MyComponent'
```

### Step 5: Create Storybook Story

```typescript
// stories/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from '@/components/commons/MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Commons/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof MyComponent>

export const Default: Story = {
  args: {
    children: 'Default component',
    variant: 'default',
    size: 'md',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <MyComponent variant="default">Default</MyComponent>
      <MyComponent variant="primary">Primary</MyComponent>
      <MyComponent variant="secondary">Secondary</MyComponent>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <MyComponent size="sm">Small</MyComponent>
      <MyComponent size="md">Medium</MyComponent>
      <MyComponent size="lg">Large</MyComponent>
    </div>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [count, setCount] = useState(0)
    return (
      <MyComponent onClick={() => setCount(c => c + 1)}>
        Clicked {count} times
      </MyComponent>
    )
  },
}
```

### Step 6: Write Tests

```typescript
// tests/components/my-component.spec.ts
import { test, expect } from '@playwright/test'

test.describe('MyComponent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/design-system')
  })

  test('renders with default props', async ({ page }) => {
    const component = page.locator('[data-testid="my-component"]')
    await expect(component).toBeVisible()
  })

  test('applies variant styles', async ({ page }) => {
    const primary = page.locator('[data-variant="primary"]')
    await expect(primary).toHaveClass(/bg-blue-600/)
  })

  test('handles click events', async ({ page }) => {
    const component = page.locator('[data-testid="my-component"]')
    await component.click()
    await expect(page.locator('.clicked-message')).toBeVisible()
  })

  test('supports keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab')
    const component = page.locator('[data-testid="my-component"]')
    await expect(component).toBeFocused()
  })
})
```

### Step 7: Update Design System Page

Add your component to the appropriate design system page:

**For Commons components** - Add to both Luna and Sol pages:

```typescript
// app/admin/design-system/page.tsx
// Add section:
<Section id="my-component">
  <Container>
    <Heading as="h2" className="mb-8">MyComponent</Heading>

    <div className="space-y-8">
      <div>
        <h3 className="text-heading-sm mb-4">Variants</h3>
        <div className="flex gap-4">
          <MyComponent variant="default">Default</MyComponent>
          <MyComponent variant="primary">Primary</MyComponent>
        </div>
      </div>

      <div>
        <h3 className="text-heading-sm mb-4">Sizes</h3>
        <div className="flex gap-4 items-end">
          <MyComponent size="sm">Small</MyComponent>
          <MyComponent size="md">Medium</MyComponent>
          <MyComponent size="lg">Large</MyComponent>
        </div>
      </div>
    </div>
  </Container>
</Section>
```

**Update navigation** in the sections array at the top of the file.

## Component API Design

### Props

```typescript
// ✅ Good: Clear, documented props
export interface ButtonProps {
  /** Button content */
  children: ReactNode

  /** Style variant */
  variant?: 'default' | 'primary'

  /** Optional click handler */
  onClick?: () => void
}

// ❌ Bad: Unclear, undocumented
export interface ButtonProps {
  kids: any
  type: string
  fn?: Function
}
```

### Defaults

Provide sensible defaults:

```typescript
export function Button({
  variant = 'default', // ✅ Sensible default
  size = 'md', // ✅ Sensible default
  disabled = false, // ✅ Explicit default
  children,
}: ButtonProps) {
  // ...
}
```

### Composition

Prefer composition over configuration:

```typescript
// ✅ Good: Composable
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>

// ❌ Bad: Too many props
<Card
  title="Title"
  content="Content"
  footerActions={[...]}
  hasHeader
  hasFooter
/>
```

## Styling Guidelines

### Use Design Tokens

```typescript
// ✅ Good: Design tokens
className = 'px-gutter py-section text-heading-md'

// ❌ Bad: Magic values
className = 'px-6 py-12 text-2xl'
```

### Responsive Design

```typescript
// ✅ Good: Mobile first
className = 'flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8'

// ❌ Bad: Desktop first
className = 'flex-row gap-8 md:flex-col md:gap-4'
```

### Dark Mode

Support dark mode by default:

```typescript
className = 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'
```

## Accessibility Checklist

- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus visible states
- [ ] Color contrast (WCAG AA)
- [ ] Screen reader tested
- [ ] No motion for `prefers-reduced-motion`

### Example

```typescript
export function Modal({ isOpen, onClose, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  return (
    <dialog
      open={isOpen}
      aria-modal="true"
      aria-labelledby="modal-title"
      className="..."
    >
      <div role="document">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close dialog"
        >
          <XIcon aria-hidden="true" />
        </button>
        {children}
      </div>
    </dialog>
  )
}
```

## Documentation

### Component Documentation

Include:

- Purpose and use cases
- Props documentation (TSDoc)
- Usage examples
- Do's and don'ts
- Accessibility notes

````typescript
/**
 * Button component for user actions
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Button onClick={handleClick}>Click me</Button>
 * ```
 *
 * @example
 * With variant and size:
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Large primary button
 * </Button>
 * ```
 *
 * @accessibility
 * - Uses semantic `<button>` element
 * - Keyboard accessible (Enter/Space)
 * - Focus visible by default
 */
export function Button(props: ButtonProps) {
  // ...
}
````

## Pull Request Process

### 1. Before Submitting

- [ ] Component works in isolation
- [ ] Component works in context
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Types are correct (`pnpm tsc`)
- [ ] Storybook story created
- [ ] Design system page updated
- [ ] Accessibility tested

### 2. PR Description

Include:

- **What**: What component/feature are you adding?
- **Why**: Why is this needed?
- **How**: How does it work?
- **Screenshots**: Show the component in action
- **Breaking changes**: Note any breaking changes
- **Testing**: How did you test it?

### 3. Code Review

Expect feedback on:

- Component API design
- Code quality and style
- Test coverage
- Accessibility
- Performance
- Documentation

### 4. After Approval

- Merge using squash and merge
- Delete the branch
- Verify in production

## Common Patterns

### Loading States

```typescript
export function DataComponent({ id }: { id: string }) {
  const { data, isLoading, error } = useData(id)

  if (isLoading) {
    return <Skeleton />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  if (!data) {
    return <EmptyState />
  }

  return <div>{/* render data */}</div>
}
```

### Error Boundaries

```typescript
'use client'

export class ComponentErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }

    return this.props.children
  }
}
```

### Controlled/Uncontrolled

```typescript
export function Input({
  value,
  defaultValue,
  onChange,
}: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e)
  }

  return <input value={currentValue} onChange={handleChange} />
}
```

## Getting Help

- **Questions**: Ask in team chat
- **Bug reports**: Create a GitHub issue
- **Feature requests**: Discuss in team meeting
- **Documentation**: Check `/docs/design-system/`
- **Examples**: Browse design system pages

## Resources

- [Design System Documentation](/docs/design-system/)
- [Patterns Guide](/docs/design-system/patterns.md)
- [Testing Guide](/docs/design-system/testing.md)
- [Linting Guide](/docs/design-system/linting.md)
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
