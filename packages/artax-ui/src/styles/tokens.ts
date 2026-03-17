// ABOUTME: Type-safe Tailwind class constants derived from theme.css CSS custom properties.
// ABOUTME: Organized by utility prefix (bg, text, border, ring, font) to match real component usage.

export const tokens = {
  bg: {
    background: 'bg-background',
    card: 'bg-card',
    popover: 'bg-popover',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    muted: 'bg-muted',
    accent: 'bg-accent',
    destructive: 'bg-destructive',
    surfaceInfo: 'bg-surface-info',
    surfaceWarning: 'bg-surface-warning',
    surfaceSuccess: 'bg-surface-success',
  },
  text: {
    foreground: 'text-foreground',
    primary: 'text-primary',
    primaryForeground: 'text-primary-foreground',
    secondary: 'text-secondary',
    secondaryForeground: 'text-secondary-foreground',
    card: 'text-card',
    cardForeground: 'text-card-foreground',
    popover: 'text-popover',
    popoverForeground: 'text-popover-foreground',
    muted: 'text-muted',
    mutedForeground: 'text-muted-foreground',
    accent: 'text-accent',
    accentForeground: 'text-accent-foreground',
    destructive: 'text-destructive',
    destructiveForeground: 'text-destructive-foreground',
    success: 'text-success',
    info: 'text-info',
    warning: 'text-warning',
  },
  border: {
    border: 'border-border',
    input: 'border-input',
    primary: 'border-primary',
    destructive: 'border-destructive',
    ring: 'border-ring',
  },
  ring: {
    ring: 'ring-ring',
    primary: 'ring-primary',
  },
  font: {
    mono: 'font-mono',
    monoAlt: 'font-mono-alt',
    sans: 'font-sans',
  },
} as const

export type BgToken = keyof typeof tokens.bg
export type TextToken = keyof typeof tokens.text
export type BorderToken = keyof typeof tokens.border
export type RingToken = keyof typeof tokens.ring
export type FontToken = keyof typeof tokens.font
