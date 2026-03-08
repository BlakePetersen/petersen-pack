// ABOUTME: Tests for the CodeBlock component with Shiki integration and terminal chrome.
// ABOUTME: Validates CONT-04d: header bar with filename, language badge, and terminal styling.
import { render, screen } from '@testing-library/react'
import { CodeBlock } from '../../src/components/code-block'

describe('CodeBlock', () => {
  it('renders children (Shiki HTML output) inside the code container', () => {
    render(
      <CodeBlock>
        <pre className="shiki">
          <code>
            <span className="line">const x = 1</span>
          </code>
        </pre>
      </CodeBlock>,
    )
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })

  it('shows header bar with "// filename" when filename prop provided', () => {
    render(<CodeBlock filename="app.ts">code</CodeBlock>)
    expect(screen.getByText('// app.ts')).toBeInTheDocument()
  })

  it('shows language badge when language prop provided', () => {
    render(<CodeBlock language="typescript">code</CodeBlock>)
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('header bar hidden when no filename and no language', () => {
    const { container } = render(
      <CodeBlock data-testid="codeblock">code</CodeBlock>,
    )
    // No header bar element should exist
    const headerBar = container.querySelector('[data-testid="code-header"]')
    expect(headerBar).toBeNull()
  })

  it('has terminal-surface background and terminal-border styling', () => {
    render(<CodeBlock data-testid="codeblock">code</CodeBlock>)
    const wrapper = screen.getByTestId('codeblock')
    expect(wrapper.className).toContain('terminal-surface')
    expect(wrapper.className).toContain('terminal-border')
  })

  it('passes custom className', () => {
    render(
      <CodeBlock className="custom" data-testid="codeblock">
        code
      </CodeBlock>,
    )
    expect(screen.getByTestId('codeblock').className).toContain('custom')
  })
})
