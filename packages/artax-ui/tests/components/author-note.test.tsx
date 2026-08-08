// ABOUTME: Tests for AuthorNote molecule — structure, byline rendering, D-05 source-grep guard.
// ABOUTME: Source-grep assertion enforces no hardcoded editorial voice at CI time.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { render, screen } from '@testing-library/react'
import { AuthorNote } from '../../src/components/molecules/author-note/author-note'

describe('AuthorNote', () => {
  it('renders with role="note" and aria-label', () => {
    render(<AuthorNote>body text</AuthorNote>)
    const aside = screen.getByRole('note')
    expect(aside).toHaveAttribute('aria-label', "Author's note")
  })

  it('renders the // author_note caption', () => {
    render(<AuthorNote>body</AuthorNote>)
    expect(screen.getByText('// author_note')).toBeInTheDocument()
  })

  it('renders children body content', () => {
    render(<AuthorNote>my body content</AuthorNote>)
    expect(screen.getByText('my body content')).toBeInTheDocument()
  })

  it('renders byline when author prop provided', () => {
    render(
      <AuthorNote author={{ name: 'Jane Doe' }} date="2026-01-01">
        body
      </AuthorNote>
    )
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument()
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument()
  })

  it('renders date alone without author', () => {
    render(<AuthorNote date="2026-02-02">body</AuthorNote>)
    expect(screen.getByText(/2026-02-02/)).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <AuthorNote className="custom-class">body</AuthorNote>
    )
    expect(container.querySelector('aside')?.className).toContain(
      'custom-class'
    )
  })

  // D-05 editorial-voice gate guard — source-grep assertion.
  it('source file contains no hardcoded editorial first-person voice', () => {
    const source = readFileSync(
      resolve(
        __dirname,
        '../../src/components/molecules/author-note/author-note.tsx'
      ),
      'utf-8'
    )
    expect(source).not.toMatch(/Blake'?s note/i)
    expect(source).not.toMatch(/blakepetersen/i)
  })
})
