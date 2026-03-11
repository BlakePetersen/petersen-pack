/**
 * @jest-environment jest-environment-jsdom
 */

// ABOUTME: Tests for ReactionCount component and DiscussionWithReactions wrapper.
// ABOUTME: Validates COMM-05: reaction count display and state lifting from giscus metadata.

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock GiscusComments to capture onMetadata callback
let capturedOnMetadata: ((data: { reactionCount: number }) => void) | undefined
jest.mock('@/components/giscus-comments', () => ({
  GiscusComments: ({
    term,
    onMetadata,
  }: {
    term: string
    onMetadata?: (data: { reactionCount: number }) => void
  }) => {
    capturedOnMetadata = onMetadata
    return <div data-testid="giscus-comments" data-term={term} />
  },
}))

// Mock ReportProblemLink
jest.mock('@/components/report-problem-link', () => ({
  ReportProblemLink: ({
    title,
    pageUrl,
  }: {
    title: string
    pageUrl: string
  }) => (
    <a data-testid="report-problem-link" href={pageUrl}>
      {title}
    </a>
  ),
}))

import {
  ReactionCount,
  ReactionCountProvider,
  useReactionCount,
} from '@/components/reaction-count'
import { DiscussionWithReactions } from '@/components/content-with-discussion'

describe('ReactionCount', () => {
  test('renders thumbs-up emoji and count number', () => {
    render(
      <ReactionCountProvider>
        <ReactionCount />
      </ReactionCountProvider>,
    )
    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  test('with count=0 renders "0" (does not hide)', () => {
    render(
      <ReactionCountProvider>
        <ReactionCount />
      </ReactionCountProvider>,
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  test('with count=42 renders "42"', () => {
    function TestWrapper() {
      const ctx = useReactionCount()
      React.useEffect(() => {
        ctx.setCount(42)
      }, [ctx])
      return <ReactionCount />
    }

    render(
      <ReactionCountProvider>
        <TestWrapper />
      </ReactionCountProvider>,
    )
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  test('inside ReactionCountProvider renders initial count of 0', () => {
    render(
      <ReactionCountProvider>
        <ReactionCount />
      </ReactionCountProvider>,
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

describe('DiscussionWithReactions', () => {
  beforeEach(() => {
    capturedOnMetadata = undefined
  })

  test('renders the discussion section header ("// discussion")', () => {
    render(
      <ReactionCountProvider>
        <DiscussionWithReactions
          slug="skills/test"
          title="Test Skill"
          pageUrl="https://blakepetersen.io/skills/test"
        />
      </ReactionCountProvider>,
    )
    expect(screen.getByText('// discussion')).toBeInTheDocument()
  })

  test('renders ReportProblemLink', () => {
    render(
      <ReactionCountProvider>
        <DiscussionWithReactions
          slug="skills/test"
          title="Test Skill"
          pageUrl="https://blakepetersen.io/skills/test"
        />
      </ReactionCountProvider>,
    )
    expect(screen.getByTestId('report-problem-link')).toBeInTheDocument()
  })

  test('renders GiscusComments with correct term', () => {
    render(
      <ReactionCountProvider>
        <DiscussionWithReactions
          slug="skills/test"
          title="Test Skill"
          pageUrl="https://blakepetersen.io/skills/test"
        />
      </ReactionCountProvider>,
    )
    const giscus = screen.getByTestId('giscus-comments')
    expect(giscus).toBeInTheDocument()
    expect(giscus).toHaveAttribute('data-term', 'skills/test')
  })

  test('when giscus postMessage fires, ReactionCount updates to the new value', () => {
    render(
      <ReactionCountProvider>
        <ReactionCount />
        <DiscussionWithReactions
          slug="skills/test"
          title="Test Skill"
          pageUrl="https://blakepetersen.io/skills/test"
        />
      </ReactionCountProvider>,
    )

    // Initially 0
    expect(screen.getByText('0')).toBeInTheDocument()

    // Simulate giscus metadata callback
    act(() => {
      capturedOnMetadata?.({ reactionCount: 15 })
    })

    expect(screen.getByText('15')).toBeInTheDocument()
  })
})
