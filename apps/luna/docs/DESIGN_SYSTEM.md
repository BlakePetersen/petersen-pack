# Design System

This document describes the design system primitives for consistent styling across the Luna photography website.

## Spacing

Use semantic spacing tokens instead of arbitrary values for consistency.

### Spacing Scale

| Token        | Value         | Usage                                    |
| ------------ | ------------- | ---------------------------------------- |
| `gutter`     | 24px (1.5rem) | Standard horizontal and vertical padding |
| `section`    | 96px (6rem)   | Vertical spacing between major sections  |
| `section-sm` | 64px (4rem)   | Smaller vertical section spacing         |

### Usage Examples

```tsx
// Consistent gutters
<div className="p-gutter">Content</div>

// Section spacing
<section className="py-section">
  <div className="p-gutter">Content</div>
</section>

// Smaller sections
<section className="py-section-sm">
  <div className="p-gutter">Content</div>
</section>
```

## Typography

Use semantic typography tokens for consistent text sizing and line heights.

### Display Text

Large, impactful text for hero sections and major headings.

| Token        | Size          | Line Height | Letter Spacing | Usage                |
| ------------ | ------------- | ----------- | -------------- | -------------------- |
| `display-xl` | 80px (5rem)   | 1.0         | -0.02em        | Extra large displays |
| `display-lg` | 64px (4rem)   | 1.0         | -0.02em        | Large displays       |
| `display-md` | 48px (3rem)   | 1.1         | -0.01em        | Medium displays      |
| `display-sm` | 40px (2.5rem) | 1.1         | -0.01em        | Small displays       |

### Headings

Standard heading hierarchy for content sections.

| Token        | Size           | Line Height | Letter Spacing | HTML |
| ------------ | -------------- | ----------- | -------------- | ---- |
| `heading-xl` | 32px (2rem)    | 1.2         | -0.01em        | h1   |
| `heading-lg` | 28px (1.75rem) | 1.2         | -0.01em        | h2   |
| `heading-md` | 24px (1.5rem)  | 1.3         | 0              | h3   |
| `heading-sm` | 20px (1.25rem) | 1.4         | 0              | h4   |

### Body Text

Standard body copy and UI text.

| Token     | Size            | Line Height | Letter Spacing | Usage                          |
| --------- | --------------- | ----------- | -------------- | ------------------------------ |
| `body-lg` | 18px (1.125rem) | 1.6         | 0              | Large body text, introductions |
| `body-md` | 16px (1rem)     | 1.6         | 0              | Standard body text             |
| `body-sm` | 14px (0.875rem) | 1.5         | 0              | Small body text, captions      |
| `caption` | 12px (0.75rem)  | 1.4         | 0.02em         | Tiny text, labels              |

### Usage Examples

```tsx
// Hero section
<h1 className="text-display-lg">
  Ashley Petersen Photography
</h1>

// Section heading
<h2 className="text-heading-xl">
  Portfolio
</h2>

// Body text
<p className="text-body-md">
  Professional photography services...
</p>

// Caption
<span className="text-caption">
  Photo by Ashley Petersen
</span>
```

## Colors

The design system uses HSL color values for flexibility with opacity and dark mode.

### Usage

Colors are defined as CSS custom properties and accessed through Tailwind utility classes:

- `bg-background` - Page background
- `text-foreground` - Primary text color
- `bg-primary` / `text-primary-foreground` - Primary brand colors
- `bg-accent` / `text-accent-foreground` - Accent colors
- `border-border` - Border colors

All color tokens automatically support dark mode through the `.dark` class.

## Border Radius

| Token        | Value                     | Usage                |
| ------------ | ------------------------- | -------------------- |
| `rounded-sm` | calc(var(--radius) - 4px) | Small radius (~2px)  |
| `rounded-md` | calc(var(--radius) - 2px) | Medium radius (~6px) |
| `rounded-lg` | var(--radius)             | Large radius (8px)   |

Default `--radius` is 0.5rem (8px).

## Animations

Custom animations for consistent motion design:

- `animate-fade-in` - Simple fade in
- `animate-fade-in-up` - Fade in with upward motion
- `animate-slide-in` - Slide in from left
- `animate-shimmer` - Shimmer effect for highlights
- `animate-ken-burns` - Slow zoom for images

## Implementation Notes

### CSS Custom Properties

All design tokens are defined as CSS custom properties in `/app/globals.css`:

```css
:root {
  --gutter: 1.5rem;
  --section-spacing: 6rem;
  --section-spacing-sm: 4rem;
  --radius: 0.5rem;
}
```

### Tailwind Configuration

Tokens are extended in Tailwind config at `/tailwind.config.ts` to be used with Tailwind utilities:

```typescript
theme: {
  extend: {
    spacing: {
      'gutter': 'var(--gutter, 1.5rem)',
      'section': 'var(--section-spacing, 6rem)',
      'section-sm': 'var(--section-spacing-sm, 4rem)',
    },
    fontSize: {
      'display-xl': ['5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      // ... etc
    }
  }
}
```

### Design System Kitchen Sink

The design system showcase is available at `/admin/design-system` (admin authentication required). This page displays all design primitives, components, and tokens in an interactive format with dark mode support.

## Migration Checklist

When updating existing components to use the design system:

- [ ] Replace hardcoded padding values (`p-6`, `px-12`, etc.) with `p-gutter`
- [ ] Replace section spacing (`py-12`, `py-16`) with `py-section` or `py-section-sm`
- [ ] Update typography sizes to use semantic tokens (`text-display-lg`, `text-heading-xl`, etc.)
- [ ] Ensure consistent use of color tokens instead of arbitrary colors
- [ ] Use border radius tokens (`rounded-lg`, etc.) instead of arbitrary values
