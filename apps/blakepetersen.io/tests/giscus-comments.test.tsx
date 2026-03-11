/**
 * @jest-environment jest-environment-jsdom
 */

// ABOUTME: Tests for the GiscusComments client component.
// ABOUTME: Validates COMM-01/02: lazy-load via IntersectionObserver, script attributes, and postMessage metadata.

import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock IntersectionObserver
let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void
const mockDisconnect = jest.fn()

class MockIntersectionObserver {
  constructor(
    callback: (entries: Partial<IntersectionObserverEntry>[]) => void,
  ) {
    observerCallback = callback
  }
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = mockDisconnect
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

import { GiscusComments } from '@/components/giscus-comments'

describe('GiscusComments (COMM-01, COMM-02)', () => {
  beforeEach(() => {
    mockDisconnect.mockClear()
  })

  test('renders a container div with class "giscus"', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    const giscusDiv = container.querySelector('.giscus')
    expect(giscusDiv).toBeInTheDocument()
  })

  test('injects giscus script when IntersectionObserver triggers', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    const giscusDiv = container.querySelector('.giscus')!

    // Simulate intersection
    observerCallback([{ isIntersecting: true }])

    const script = giscusDiv.querySelector('script')
    expect(script).not.toBeNull()
  })

  test('script tag has src="https://giscus.app/client.js"', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    observerCallback([{ isIntersecting: true }])

    const script = container.querySelector('.giscus script')!
    expect(script.getAttribute('src')).toBe('https://giscus.app/client.js')
  })

  test('script tag has data-mapping="specific"', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    observerCallback([{ isIntersecting: true }])

    const script = container.querySelector('.giscus script')!
    expect(script.getAttribute('data-mapping')).toBe('specific')
  })

  test('script tag has data-term matching the provided term prop', () => {
    const { container } = render(<GiscusComments term="hooks/use-effect" />)
    observerCallback([{ isIntersecting: true }])

    const script = container.querySelector('.giscus script')!
    expect(script.getAttribute('data-term')).toBe('hooks/use-effect')
  })

  test('script tag has data-strict="1"', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    observerCallback([{ isIntersecting: true }])

    const script = container.querySelector('.giscus script')!
    expect(script.getAttribute('data-strict')).toBe('1')
  })

  test('script tag has data-emit-metadata="1"', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    observerCallback([{ isIntersecting: true }])

    const script = container.querySelector('.giscus script')!
    expect(script.getAttribute('data-emit-metadata')).toBe('1')
  })

  test('script tag has data-reactions-enabled="1"', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    observerCallback([{ isIntersecting: true }])

    const script = container.querySelector('.giscus script')!
    expect(script.getAttribute('data-reactions-enabled')).toBe('1')
  })

  test('script tag has data-theme containing "giscus-theme.css"', () => {
    const { container } = render(<GiscusComments term="skills/test-skill" />)
    observerCallback([{ isIntersecting: true }])

    const script = container.querySelector('.giscus script')!
    expect(script.getAttribute('data-theme')).toContain('giscus-theme.css')
  })

  test('postMessage handler calls onMetadata with reactionCount', () => {
    const onMetadata = jest.fn()
    render(
      <GiscusComments term="skills/test-skill" onMetadata={onMetadata} />,
    )

    // Dispatch a MessageEvent from giscus origin
    const event = new MessageEvent('message', {
      origin: 'https://giscus.app',
      data: {
        giscus: {
          discussion: {
            reactionCount: 5,
            reactions: { THUMBS_UP: { count: 3 } },
          },
        },
      },
    })
    window.dispatchEvent(event)

    expect(onMetadata).toHaveBeenCalledWith({ reactionCount: 3 })
  })

  test('postMessage handler uses reactionCount as fallback when THUMBS_UP not available', () => {
    const onMetadata = jest.fn()
    render(
      <GiscusComments term="skills/test-skill" onMetadata={onMetadata} />,
    )

    const event = new MessageEvent('message', {
      origin: 'https://giscus.app',
      data: {
        giscus: {
          discussion: {
            reactionCount: 7,
          },
        },
      },
    })
    window.dispatchEvent(event)

    expect(onMetadata).toHaveBeenCalledWith({ reactionCount: 7 })
  })
})
