/**
 * @jest-environment jest-environment-jsdom
 */

// ABOUTME: Unit tests for ArtifactBody component rendering.
// ABOUTME: Validates single-file CodeBlock, multi-file Tabs, error on missing slug, and language inference.

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock artax-ui components as simple div wrappers that pass through props
jest.mock('artax-ui', () => ({
  CodeBlock: ({ filename, language, rawCode, children, ...props }: Record<string, unknown>) => (
    <div data-testid="code-block" data-filename={filename} data-language={language} data-raw-code={rawCode} {...props}>
      {children as React.ReactNode}
    </div>
  ),
  Tabs: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="tabs" {...props}>{children as React.ReactNode}</div>
  ),
  TabsList: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="tabs-list" {...props}>{children as React.ReactNode}</div>
  ),
  TabsTrigger: ({ children, value, ...props }: Record<string, unknown>) => (
    <button data-testid="tabs-trigger" data-value={value} {...props}>{children as React.ReactNode}</button>
  ),
  TabsContent: ({ children, value, ...props }: Record<string, unknown>) => (
    <div data-testid="tabs-content" data-value={value} {...props}>{children as React.ReactNode}</div>
  ),
}))

import { ArtifactBody, ArtifactDataProvider, inferLanguage } from '@/components/mdx/artifact-body'

const singleFileArtifact = {
  slug: 'eslint-flat-config',
  name: 'ESLint Flat Config',
  type: 'config',
  files: [{ path: 'eslint.config.ts', content: 'export default []' }],
}

const multiFileArtifact = {
  slug: 'prettier-setup',
  name: 'Prettier Setup',
  type: 'config',
  files: [
    { path: '.prettierrc', content: '{ "semi": false }' },
    { path: '.prettierignore', content: 'node_modules' },
    { path: 'prettier.config.ts', content: 'export default {}' },
  ],
}

describe('ArtifactBody', () => {
  it('renders a CodeBlock for single-file artifact with correct filename and language', () => {
    render(
      <ArtifactDataProvider artifacts={[singleFileArtifact]}>
        <ArtifactBody slug="eslint-flat-config" />
      </ArtifactDataProvider>,
    )

    const codeBlock = screen.getByTestId('code-block')
    expect(codeBlock).toHaveAttribute('data-filename', 'eslint.config.ts')
    expect(codeBlock).toHaveAttribute('data-language', 'typescript')
  })

  it('renders Tabs + CodeBlock for multi-file artifact with one tab per file', () => {
    render(
      <ArtifactDataProvider artifacts={[multiFileArtifact]}>
        <ArtifactBody slug="prettier-setup" />
      </ArtifactDataProvider>,
    )

    const tabs = screen.getByTestId('tabs')
    expect(tabs).toBeInTheDocument()

    const triggers = screen.getAllByTestId('tabs-trigger')
    expect(triggers).toHaveLength(3)

    const codeBlocks = screen.getAllByTestId('code-block')
    expect(codeBlocks).toHaveLength(3)
  })

  it('throws an error in development when slug not found', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    // Suppress React error boundary console output during this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <ArtifactDataProvider artifacts={[singleFileArtifact]}>
          <ArtifactBody slug="nonexistent-slug" />
        </ArtifactDataProvider>,
      ),
    ).toThrow(
      'ArtifactBody: artifact "nonexistent-slug" not found. Ensure the artifact exists and data is provided via ArtifactDataProvider.',
    )

    spy.mockRestore()
    process.env.NODE_ENV = originalEnv
  })

  it('renders fallback UI in production when slug not found', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ArtifactDataProvider artifacts={[singleFileArtifact]}>
        <ArtifactBody slug="nonexistent-slug" />
      </ArtifactDataProvider>,
    )

    expect(screen.getByText(/not found/)).toBeInTheDocument()
    expect(screen.getByText('pnpm velite')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('detects language from file extension correctly', () => {
    expect(inferLanguage('file.ts')).toBe('typescript')
    expect(inferLanguage('file.tsx')).toBe('typescript')
    expect(inferLanguage('file.json')).toBe('json')
    expect(inferLanguage('file.yaml')).toBe('yaml')
    expect(inferLanguage('file.yml')).toBe('yaml')
    expect(inferLanguage('file.sh')).toBe('bash')
    expect(inferLanguage('file.css')).toBe('css')
  })

  it('includes rawCode prop for copy button functionality', () => {
    render(
      <ArtifactDataProvider artifacts={[singleFileArtifact]}>
        <ArtifactBody slug="eslint-flat-config" />
      </ArtifactDataProvider>,
    )

    const codeBlock = screen.getByTestId('code-block')
    expect(codeBlock).toHaveAttribute('data-raw-code', 'export default []')
  })

  it('multi-file artifact tab labels match file names from artifact data', () => {
    render(
      <ArtifactDataProvider artifacts={[multiFileArtifact]}>
        <ArtifactBody slug="prettier-setup" />
      </ArtifactDataProvider>,
    )

    const triggers = screen.getAllByTestId('tabs-trigger')
    expect(triggers[0]).toHaveTextContent('.prettierrc')
    expect(triggers[1]).toHaveTextContent('.prettierignore')
    expect(triggers[2]).toHaveTextContent('prettier.config.ts')
  })
})
