/** @jest-environment jsdom */
// ABOUTME: Tests for PlaygroundPropsForm dispatch and exclusion.
// ABOUTME: Validates control type selection, onChange wiring, and exclusion rules.

import { render, screen, fireEvent } from '@testing-library/react'

import { PlaygroundPropsForm } from '@/components/playground-props-form'
import type { PropDef } from '@/lib/component-registry'

const variantProp: PropDef = {
  name: 'variant',
  type: "'default' | 'outline'",
  default: 'default',
  description: 'Visual style',
}

const disabledProp: PropDef = {
  name: 'disabled',
  type: 'boolean',
  default: 'false',
  description: 'Disabled state',
}

const sizeProp: PropDef = {
  name: 'size',
  type: 'number',
  default: '0',
  description: 'Size in px',
}

const placeholderProp: PropDef = {
  name: 'placeholder',
  type: 'string',
  default: '',
  description: 'Placeholder text',
}

const childrenProp: PropDef = {
  name: 'children',
  type: 'ReactNode',
  default: '',
  description: 'Children content',
}

const onClickProp: PropDef = {
  name: 'onClick',
  type: '(e: MouseEvent) => void',
  default: '',
  description: 'Click handler',
}

describe('PlaygroundPropsForm', () => {
  it('renders a native <select> for literal-union props with the parsed options', () => {
    render(
      <PlaygroundPropsForm
        props={[variantProp]}
        values={{ variant: 'default' }}
        onChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('default')

    const options = Array.from(select.querySelectorAll('option')).map(
      (o) => o.value
    )
    expect(options).toEqual(['default', 'outline'])
  })

  it('renders a Toggle (role=button with aria-pressed) for boolean props', () => {
    render(
      <PlaygroundPropsForm
        props={[disabledProp]}
        values={{ disabled: 'false' }}
        onChange={() => {}}
      />
    )

    const toggle = screen.getByRole('button', { name: /disabled/i })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders <input type="number"> for number props', () => {
    const { container } = render(
      <PlaygroundPropsForm
        props={[sizeProp]}
        values={{ size: '12' }}
        onChange={() => {}}
      />
    )

    const input = container.querySelector('input[name="size"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveValue(12)
  })

  it('renders <input type="text"> for string/text-fallback props', () => {
    const { container } = render(
      <PlaygroundPropsForm
        props={[placeholderProp]}
        values={{ placeholder: 'Type here' }}
        onChange={() => {}}
      />
    )

    const input = container.querySelector(
      'input[name="placeholder"]'
    ) as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('Type here')
  })

  it('excludes props named "children"', () => {
    const { container } = render(
      <PlaygroundPropsForm
        props={[childrenProp]}
        values={{}}
        onChange={() => {}}
      />
    )

    expect(container.querySelector('input[name="children"]')).toBeNull()
    expect(container.querySelector('select[name="children"]')).toBeNull()
  })

  it('excludes props whose type contains "=>" (callback signatures)', () => {
    const { container } = render(
      <PlaygroundPropsForm
        props={[onClickProp]}
        values={{}}
        onChange={() => {}}
      />
    )

    expect(container.querySelector('input[name="onClick"]')).toBeNull()
    expect(container.querySelector('select[name="onClick"]')).toBeNull()
  })

  it('renders the "No props documented" empty state when props=[]', () => {
    render(
      <PlaygroundPropsForm props={[]} values={{}} onChange={() => {}} />
    )

    expect(screen.getByText('No props documented')).toBeInTheDocument()
  })

  it('calls onChange with merged values when a <select> changes', () => {
    const onChange = jest.fn()
    render(
      <PlaygroundPropsForm
        props={[variantProp]}
        values={{ variant: 'default' }}
        onChange={onChange}
      />
    )

    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'outline' } })

    expect(onChange).toHaveBeenCalledWith({ variant: 'outline' })
  })

  it('calls onChange with string-serialized boolean when Toggle is clicked', () => {
    const onChange = jest.fn()
    render(
      <PlaygroundPropsForm
        props={[disabledProp]}
        values={{ disabled: 'false' }}
        onChange={onChange}
      />
    )

    const toggle = screen.getByRole('button', { name: /disabled/i })
    fireEvent.click(toggle)

    expect(onChange).toHaveBeenCalledWith({ disabled: 'true' })
  })
})
