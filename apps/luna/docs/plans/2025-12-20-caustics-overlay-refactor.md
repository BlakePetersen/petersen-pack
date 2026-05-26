# CausticsOverlay Refactor Design

## Goals

- **Performance:** Reduce from 16+ blurred elements to 4-5
- **Visual:** Ethereal, dreamy effect — soft, diffuse, slow-drifting
- **Code quality:** Extract magic numbers, consistent styling, maintainable

## Architecture

### Element Structure

```
<div class="caustics-container">
  <div class="ambient-glow" />      <!-- soft top gradient -->
  <div class="ray ray-1" />         <!-- wide, slow -->
  <div class="ray ray-2" />         <!-- medium, offset timing -->
  <div class="ray ray-3" />         <!-- narrow, different phase -->
  <div class="ray ray-4" />         <!-- accent, subtle -->
</div>
```

4 rays total (down from 16+), plus 1 ambient glow layer. Heavy blur and slow movement means fewer overlapping elements create the same diffuse effect.

### Styling Approach

- All styles via Tailwind classes + CSS custom properties
- Keyframe animation in `globals.css`
- No inline styles, no styled-jsx
- z-index passed via className, not hardcoded

## Animation

### Keyframe Definition (globals.css)

```css
@keyframes caustic-drift {
  0%,
  100% {
    transform: translateX(0) rotate(var(--ray-angle));
    opacity: var(--ray-opacity);
  }
  50% {
    transform: translateX(var(--ray-drift)) rotate(var(--ray-angle));
    opacity: calc(var(--ray-opacity) * 1.3);
  }
}
```

### Per-Ray Variation

Each ray gets different CSS custom property values:

- `--ray-drift`: How far it moves (15px, 25px, -20px, etc.)
- `--ray-opacity`: Base opacity (0.4, 0.6, etc.)
- `--ray-angle`: Rotation angle (15deg, 20deg, etc.)
- Duration via Tailwind's `duration-[Xs]` (20s, 26s, 22s, 28s)

### Reduced Motion

When `prefers-reduced-motion: reduce`, animation is `none`. Rays stay visible at starting position — atmospheric but frozen.

### Timing

All rays use `ease-in-out` with staggered `animation-delay` so they don't pulse in sync.

## Color System

### Intensity Scale

```tsx
const INTENSITY = {
  ambient: 0.12, // base glow
  primary: 0.5, // main rays
  accent: 0.35, // secondary rays
  fade: 1.3, // multiplier for pulse peak
} as const
```

### Color Palettes

```tsx
const PALETTE = {
  light: {
    glow: 'rgb(255, 240, 220)', // warm cream
    ray: 'rgb(255, 248, 235)', // soft white-gold
    rayEnd: 'rgb(255, 220, 180)', // warm fade
  },
  dark: {
    glow: 'rgb(56, 189, 248)', // sky-400
    ray: 'rgb(186, 230, 253)', // sky-200
    rayEnd: 'rgb(34, 211, 238)', // cyan-400
  },
} as const
```

### Gradient Helper

```tsx
function rayGradient(palette: typeof PALETTE.light, opacity: number) {
  return `linear-gradient(180deg,
    ${withAlpha(palette.ray, opacity)} 0%,
    ${withAlpha(palette.rayEnd, opacity * 0.5)} 50%,
    transparent 100%
  )`
}
```

### Theme Switching

Two sibling containers with `dark:hidden` and `hidden dark:block`.

## Component API

```tsx
interface CausticsOverlayProps {
  /** Overall intensity multiplier (0-1), default 0.5 */
  intensity?: number
  /** Additional CSS classes (including z-index if needed) */
  className?: string
}
```

### Usage

```tsx
// Default subtle effect
<CausticsOverlay />

// More pronounced
<CausticsOverlay intensity={0.7} />

// With z-index control
<CausticsOverlay className="z-10" />
```

### Decisions

- `intensity` prop instead of `opacity` — clearer intent
- Ray configuration stays internal (YAGNI)
- Bottom fade removed — belongs in parent layout if needed

## Implementation Tasks

1. Add `caustic-drift` keyframe to `globals.css` with reduced-motion support
2. Create constants for INTENSITY and PALETTE
3. Create `withAlpha` and `rayGradient` helper functions
4. Rewrite component with 4-ray structure
5. Apply Tailwind classes for animation timing/delays
6. Test light/dark modes
7. Test reduced motion behavior
8. Remove old styled-jsx and inline styles
