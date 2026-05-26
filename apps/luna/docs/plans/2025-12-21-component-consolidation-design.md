# Component Consolidation Design

## Goal

Reduce component count and consolidate shared styling into single-source-of-truth components. When changing styles like rounded corners, only one file should need updating.

## Decisions

- **Buttons**: Keep thin convenience wrappers, all styling in `Button.tsx` via variants
- **Cards**: Single unified `Card` component with layout props
- **Skeletons**: Remove entirely - no loading skeletons

## Button Consolidation

### Current State

- `Button.tsx` - Core button with primary/secondary/etc variants
- `ButtonLink.tsx` - Link version (already in Button.tsx)
- `BookSessionButton.tsx` - Wrapper that sets href="/book" + primary variant
- `SecondaryButton.tsx` - Wrapper with optional arrow icon
- `IconButton.tsx` - Circular icon-only button with own styles

### Target State

- `Button.tsx` - Add `variant="icon"` for circular icon buttons
- `BookSessionButton.tsx` - Keep as one-liner convenience wrapper
- `SecondaryButton.tsx` - Keep, but remove any local styling
- Delete `IconButton.tsx` - Use `Button variant="icon"` instead

## Card Consolidation

### Current State

- `Card.tsx` - shadcn-style static container
- `ContentCard.tsx` - Blog/gallery cards with image, hover effects
- `PricingCard.tsx` - Pricing packages with gradient borders
- `ServiceCard.tsx` - Service listing cards
- `GalleryImageCard.tsx` - Image thumbnails with action buttons
- `OrderSummaryCards.tsx` - Static info display

### Target State

Single `Card.tsx` with:

```tsx
interface CardProps {
  // Layout variants
  variant?: 'default' | 'interactive' | 'pricing' | 'image'

  // For interactive cards
  href?: string

  // Visual options
  bordered?: boolean
  elevated?: boolean
  popular?: boolean // For pricing highlight

  // Image options (for content/image variants)
  image?: { src: string; alt: string; focalX?: number; focalY?: number }

  // Standard props
  children: ReactNode
  className?: string
}
```

All styling (shadows, borders, hover effects) defined once in Card.tsx.

## Skeleton Removal

Delete:

- `components/commons/Skeleton.tsx`
- `components/commons/Skeleton.stories.tsx`
- All `app/**/loading.tsx` files
- Any imports/usages of skeleton components

## Files to Delete

1. `components/commons/IconButton.tsx`
2. `components/commons/Skeleton.tsx`
3. `components/commons/Skeleton.stories.tsx`
4. `app/loading.tsx`
5. `app/blog/loading.tsx`
6. `app/portfolio/loading.tsx`
7. `app/portfolio/[slug]/loading.tsx`
8. `app/faq/loading.tsx`
9. `app/services/loading.tsx`
10. `app/services/[slug]/loading.tsx`

## Files to Consolidate

1. Merge `ContentCard`, `ServiceCard`, `GalleryImageCard`, `PricingCard` → `Card.tsx`
2. Merge `IconButton` functionality → `Button.tsx`
3. Update `OrderSummaryCards` to use new `Card`

## Storybook Updates

- Update `Card.stories.tsx` with all variants
- Update `Button.stories.tsx` with icon variant
- Delete `Skeleton.stories.tsx`
- Delete `ContentCard.stories.tsx`
