// ABOUTME: Dot-grid preview container with variant selector for component demos.
// ABOUTME: Renders components on a CSS dot-grid background with clickable variant buttons.

'use client'

import { useState, type ReactNode } from 'react'

export function ComponentPreview({
  variants,
  renderPreview
}: {
  variants?: string[]
  renderPreview: (values?: Record<string, string>) => ReactNode
}) {
  const [activeVariant, setActiveVariant] = useState(variants?.[0])

  return (
    <div
      data-testid="preview-area"
      className="bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-[length:16px_16px] border border-border"
    >
      {variants && variants.length > 0 && (
        <div className="flex gap-2 border-b border-border px-4 py-2">
          {variants.map(variant => (
            <button
              key={variant}
              type="button"
              data-testid="variant-button"
              onClick={() => setActiveVariant(variant)}
              className={
                variant === activeVariant
                  ? 'px-2 py-1 font-mono text-xs bg-primary text-primary-foreground'
                  : 'px-2 py-1 font-mono text-xs text-muted-foreground hover:text-foreground border border-border'
              }
            >
              {variant}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-center min-h-[120px] p-6">
        {renderPreview(activeVariant ? { variant: activeVariant } : undefined)}
      </div>
    </div>
  )
}
