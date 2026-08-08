// ABOUTME: Live font specimen renderer for the token reference page.
// ABOUTME: Shows sample text at multiple sizes with size labels for each font family.

interface TypographySpecimenProps {
  fontFamily: string
  fontClass: string
  sizes: { label: string; className: string; cssValue: string }[]
}

export function TypographySpecimen({
  fontFamily,
  fontClass,
  sizes
}: TypographySpecimenProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-sm text-muted-foreground">{fontFamily}</h3>
      <div className="space-y-3">
        {sizes.map(size => (
          <div key={size.label} className="flex items-baseline gap-4">
            <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {size.label}
            </span>
            <span className={`${fontClass} ${size.className} text-foreground`}>
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
