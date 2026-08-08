// ABOUTME: PrismTheme mapping artax design tokens to prism-react-renderer syntax classes.
// ABOUTME: Used by the Playground JSX editor to match the terminal aesthetic.

import type { PrismTheme } from 'prism-react-renderer'

// NOTE: Hex values mirror packages/artax-ui/src/styles/theme.css at the time of
// writing. PrismTheme requires concrete values (no CSS-var resolution), so if
// tokens shift these literals must be swept by hand. Font family and size are
// applied via `font-mono text-sm` Tailwind classes on the editor wrapper —
// PrismThemeEntry (prism-react-renderer 2.4.1) does not accept fontFamily /
// fontSize, so they are intentionally omitted from `plain`.
export const artaxTerminalTheme: PrismTheme = {
  plain: {
    backgroundColor: '#0A0A0A',
    color: '#D4D4D4'
  },
  styles: [
    { types: ['keyword', 'operator'], style: { color: '#F59E0B' } },
    { types: ['string', 'attr-value'], style: { color: '#86EFAC' } },
    { types: ['comment'], style: { color: '#6B7280', fontStyle: 'italic' } },
    { types: ['punctuation'], style: { color: '#9CA3AF' } },
    { types: ['tag', 'attr-name'], style: { color: '#93C5FD' } },
    { types: ['number', 'boolean'], style: { color: '#F59E0B' } },
    { types: ['function'], style: { color: '#D4D4D4' } },
    { types: ['class-name', 'maybe-class-name'], style: { color: '#FBBF24' } }
  ]
}
