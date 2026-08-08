// ABOUTME: Side-by-side light/dark color swatch for token reference display.
// ABOUTME: Renders two small squares with L/D labels showing both theme values.

interface TokenSwatchProps {
  lightValue: string
  darkValue: string
  label: string
}

export function TokenSwatch({
  lightValue,
  darkValue,
  label
}: TokenSwatchProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-0.5">
        <div
          className="relative h-8 w-8 border border-border"
          style={{ backgroundColor: lightValue }}
        >
          <span className="absolute bottom-0.5 right-0.5 font-mono text-[10px] leading-none text-neutral-500 mix-blend-difference">
            L
          </span>
        </div>
        <div
          className="relative h-8 w-8 border border-border"
          style={{ backgroundColor: darkValue }}
        >
          <span className="absolute bottom-0.5 right-0.5 font-mono text-[10px] leading-none text-neutral-400 mix-blend-difference">
            D
          </span>
        </div>
      </div>
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
