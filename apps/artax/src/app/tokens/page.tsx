// ABOUTME: Design token reference page showing color, typography, and spacing values.
// ABOUTME: Renders live swatches, specimens, and naming formats from the artax-ui theme system.

import type { Metadata } from 'next'
import {
  Separator,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'artax-ui'
import {
  getTokensByCategory,
  getTypographyTokens,
  getSpacingTokens,
} from '@/lib/token-registry'
import { TokenSwatch } from '@/components/token-swatch'
import { TypographySpecimen } from '@/components/typography-specimen'

export const metadata: Metadata = {
  title: 'Design Tokens',
}

const typographySizes = [
  { label: 'text-xs', className: 'text-xs', cssValue: '0.75rem / 1rem' },
  { label: 'text-sm', className: 'text-sm', cssValue: '0.875rem / 1.25rem' },
  {
    label: 'text-base',
    className: 'text-base',
    cssValue: '1rem / 1.5rem',
  },
  { label: 'text-lg', className: 'text-lg', cssValue: '1.125rem / 1.75rem' },
  { label: 'text-xl', className: 'text-xl', cssValue: '1.25rem / 1.75rem' },
]

export default function TokensPage() {
  const categories = getTokensByCategory()
  const typography = getTypographyTokens()
  const spacing = getSpacingTokens()

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {/* Colors Section */}
      <section className="space-y-8">
        <h2 className="font-mono text-sm text-muted-foreground">{'// colors'}</h2>

        {categories.map((category) => (
          <div key={category.name} className="space-y-4">
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Swatch</TableHead>
                  <TableHead>CSS Variable</TableHead>
                  <TableHead>Tailwind</TableHead>
                  <TableHead className="hidden md:table-cell">
                    TypeScript
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.tokens.map((token) => (
                  <TableRow key={token.cssVar}>
                    <TableCell>
                      <TokenSwatch
                        lightValue={token.lightValue}
                        darkValue={token.darkValue}
                        label={token.cssVar.replace('--', '')}
                      />
                    </TableCell>
                    <TableCell>
                      <code className="font-mono text-xs">
                        {token.cssProperty}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <span className="font-mono text-xs">
                          {token.tailwind}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="font-mono text-xs">
                        {token.tsConstant}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </section>

      <Separator />

      {/* Typography Section */}
      <section className="space-y-8">
        <h2 className="font-mono text-sm text-muted-foreground">
          {'// typography'}
        </h2>

        {typography.map((font) => {
          const fontClass =
            font.name === 'mono'
              ? 'font-mono'
              : font.name === 'mono-alt'
                ? 'font-mono-alt'
                : 'font-sans'

          return (
            <div key={font.name} className="space-y-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-semibold">{font.value}</h3>
                <Badge variant="secondary">
                  <span className="font-mono text-xs">{fontClass}</span>
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {font.cssVar}: {font.value}
              </p>
              <TypographySpecimen
                fontFamily={font.value}
                fontClass={fontClass}
                sizes={typographySizes}
              />
            </div>
          )
        })}
      </section>

      <Separator />

      {/* Spacing & Radii Section */}
      <section className="space-y-4">
        <h2 className="font-mono text-sm text-muted-foreground">
          {'// spacing & radii'}
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">Border Radius</span>
            <Badge variant="secondary">
              <span className="font-mono text-xs">{spacing.radius}</span>
            </Badge>
          </div>

          <div className="font-mono text-xs text-muted-foreground">
            <p>--radius: {spacing.radius}</p>
            <p>--radius-sm: 0px</p>
            <p>--radius-md: 0px</p>
            <p>--radius-lg: 0px</p>
            <p>--radius-xl: 0px</p>
          </div>

          <p className="text-sm text-muted-foreground">{spacing.note}</p>
        </div>
      </section>
    </div>
  )
}
