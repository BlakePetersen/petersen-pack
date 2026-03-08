// ABOUTME: Tests for the terminal-styled CodeBlock component.
// ABOUTME: Validates terminal surface bg, filename label, $ prompt, and monospace font.
import { render, screen } from '@testing-library/react'
import { CodeBlock } from '../../src/components/code-block'

describe('CodeBlock', () => {
  it('renders children content', () => {
    render(<CodeBlock>console.log('hello')</CodeBlock>)
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument()
  })

  it('applies terminal surface background', () => {
    render(<CodeBlock data-testid="codeblock">code</CodeBlock>)
    expect(screen.getByTestId('codeblock').className).toContain(
      'terminal-surface'
    )
  })

  it('uses monospace font', () => {
    render(<CodeBlock data-testid="codeblock">code</CodeBlock>)
    expect(screen.getByTestId('codeblock').className).toContain('font-mono')
  })

  it('renders filename label when provided', () => {
    render(<CodeBlock filename="app.ts">code</CodeBlock>)
    expect(screen.getByText('app.ts')).toBeInTheDocument()
  })

  it('renders $ prompt', () => {
    render(<CodeBlock>code</CodeBlock>)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('renders filename in muted color', () => {
    render(<CodeBlock filename="test.ts">code</CodeBlock>)
    const filenameEl = screen.getByText('test.ts')
    expect(filenameEl.className).toContain('terminal-muted')
  })

  it('passes custom className', () => {
    render(
      <CodeBlock className="custom" data-testid="codeblock">
        code
      </CodeBlock>
    )
    expect(screen.getByTestId('codeblock').className).toContain('custom')
  })
})
