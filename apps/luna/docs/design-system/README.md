# Luna Design System

A comprehensive design system for Ashley Petersen Photography, consisting of two complementary systems:

- **Luna** - Public-facing design system for the photography portfolio
- **Sol** - Admin interface design system for content management

## Architecture

The design system is organized into three main directories:

### `/components/commons/`

Shared primitive components used by both Luna and Sol systems:

- Core UI primitives (Button, Card, Badge, etc.)
- Layout components (Container, Section, etc.)
- Form components
- Typography components

### `/components/luna/`

Public-facing components for the portfolio website:

- Hero components
- Gallery displays
- Blog components
- Testimonials
- Client-facing interfaces

### `/components/sol/`

Admin-specific components for the CMS:

- Dashboard widgets
- Data tables
- Admin forms
- Status indicators
- Management interfaces

## Quick Links

- [Design Patterns](./patterns.md) - Component patterns and best practices
- [Testing Guidelines](./testing.md) - How to test components
- [Linting & Code Quality](./linting.md) - Code standards and formatting
- [Contributing](./contributing.md) - How to add new components

## Design Tokens

All design tokens are centralized in:

- `/app/globals.css` - CSS custom properties
- `/tailwind.config.ts` - Tailwind configuration

### Key Tokens

**Spacing**:

- `--gutter`: 1.5rem (24px) - Consistent horizontal padding
- `--section-spacing`: 6rem (96px) - Vertical section spacing
- `--section-spacing-sm`: 4rem (64px) - Smaller section spacing
- `--header-height`: 7rem (112px) - Fixed header height

**Typography**:

- Display sizes: XL (80px) → SM (40px)
- Heading sizes: XL (32px) → SM (20px)
- Body sizes: LG (18px) → SM (14px)

**Colors**:

- Semantic colors via HSL custom properties
- Primary, secondary, accent, muted, destructive
- Full dark mode support

## Component Development

### Creating a New Component

1. Determine which system it belongs to (commons/luna/sol)
2. Create component file in appropriate directory
3. Add TypeScript types
4. Include ABOUTME comments
5. Add to Storybook
6. Write tests
7. Document in design system page

### Example Component Structure

```typescript
// ABOUTME: Component description
// ABOUTME: Usage context and purpose

import type { ComponentProps } from 'react'

export interface MyComponentProps {
  variant?: 'default' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function MyComponent({
  variant = 'default',
  size = 'md',
  children
}: MyComponentProps) {
  return (
    <div className={/* ... */}>
      {children}
    </div>
  )
}
```

## Viewing the Design System

- **Sol (Admin)**: Visit `/admin/design-system-admin` when logged in as admin
- **Luna (Public)**: Visit `/admin/design-system` when logged in as admin

Both pages feature:

- Sticky navigation sidebar
- Live component examples
- Code snippets
- Dark mode toggle
- Responsive preview

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + CSS Custom Properties
- **TypeScript**: Strict mode enabled
- **Testing**: Playwright for E2E
- **Documentation**: Storybook
- **Linting**: ESLint + Prettier

## Philosophy

1. **Consistency**: Reuse primitives, avoid one-offs
2. **Composability**: Build complex from simple
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Performance**: Optimize for speed
5. **Maintainability**: Clear, documented code
