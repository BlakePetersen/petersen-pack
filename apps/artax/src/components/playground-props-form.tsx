// ABOUTME: Typed props form driven by PropDef[] for the Playground tab.
// ABOUTME: Renders one control per prop (toggle/select/number/text) based on type coercion.
'use client'

import { Toggle, Input } from 'artax-ui'
import type { PropDef } from '@/lib/component-registry'
import { parsePropType } from '@/lib/playground-prop-coercion'

export interface PlaygroundPropsFormProps {
  props: PropDef[]
  values: Record<string, string>
  onChange: (next: Record<string, string>) => void
}

export function PlaygroundPropsForm({
  props,
  values,
  onChange,
}: PlaygroundPropsFormProps) {
  const visibleProps = props.filter(
    (p) => p.name !== 'children' && !p.type.includes('=>')
  )

  if (visibleProps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No props documented</p>
    )
  }

  const update = (name: string, value: string) =>
    onChange({ ...values, [name]: value })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {visibleProps.map((prop) => {
        const control = parsePropType(prop.type)
        const current = values[prop.name] ?? prop.default ?? ''

        switch (control.kind) {
          case 'boolean':
            return (
              <label
                key={prop.name}
                className="flex items-center gap-2 font-mono text-xs"
              >
                <Toggle
                  pressed={current === 'true'}
                  onPressedChange={(v) => update(prop.name, String(v))}
                >
                  {prop.name}
                </Toggle>
              </label>
            )
          case 'select':
            return (
              <label
                key={prop.name}
                className="flex flex-col gap-1 font-mono text-xs"
              >
                <span>{prop.name}</span>
                <select
                  name={prop.name}
                  value={current}
                  onChange={(e) => update(prop.name, e.target.value)}
                  className="bg-card border border-border px-2 py-1"
                >
                  {control.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            )
          case 'number':
            return (
              <label
                key={prop.name}
                className="flex flex-col gap-1 font-mono text-xs"
              >
                <span>{prop.name}</span>
                <Input
                  type="number"
                  name={prop.name}
                  value={current}
                  onChange={(e) => update(prop.name, e.target.value)}
                />
              </label>
            )
          case 'text':
          default:
            return (
              <label
                key={prop.name}
                className="flex flex-col gap-1 font-mono text-xs"
              >
                <span>{prop.name}</span>
                <Input
                  type="text"
                  name={prop.name}
                  value={current}
                  onChange={(e) => update(prop.name, e.target.value)}
                />
              </label>
            )
        }
      })}
    </div>
  )
}
