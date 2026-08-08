// ABOUTME: DecisionRationale — decision card with rationale body + optional alternatives list.
// ABOUTME: Collapsed variant uses <details>/<summary>; otherwise renders as plain <section>.
import type { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

type Alternative = { name: string; reason: string }

type DecisionRationaleProps = {
  decision: string
  rationale: ReactNode
  alternatives?: Alternative[]
  collapsed?: boolean
  className?: string
}

function DecisionRationale({
  decision,
  rationale,
  alternatives,
  collapsed,
  className
}: DecisionRationaleProps) {
  const containerClass = cn(
    'my-6 bg-card p-6 border-l-4 border-l-primary font-mono text-base text-foreground',
    className
  )

  if (collapsed) {
    return (
      <details className={containerClass}>
        <summary className="cursor-pointer text-base font-medium text-foreground">
          <span className="mr-2 font-mono text-xs text-muted-foreground">
            {'// decision'}
          </span>
          {decision}
        </summary>
        <div className="mt-4 leading-relaxed">{rationale}</div>
        {alternatives && alternatives.length > 0 && (
          <ul className="mt-4 space-y-1">
            {alternatives.map(alt => (
              <li key={alt.name} className="text-muted-foreground">
                <span className="text-foreground">{alt.name}</span>
                {': '}
                {alt.reason}
              </li>
            ))}
          </ul>
        )}
      </details>
    )
  }

  return (
    <section className={containerClass}>
      <p className="mb-2 font-mono text-xs text-muted-foreground">
        {'// decision'}
      </p>
      <h3 className="mb-4 text-base font-medium text-foreground">{decision}</h3>
      <div className="leading-relaxed">{rationale}</div>
      {alternatives && alternatives.length > 0 && (
        <ul className="mt-4 space-y-1">
          {alternatives.map(alt => (
            <li key={alt.name} className="text-muted-foreground">
              <span className="text-foreground">{alt.name}</span>
              {': '}
              {alt.reason}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { DecisionRationale }
export type { DecisionRationaleProps, Alternative }
