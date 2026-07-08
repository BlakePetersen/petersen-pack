/**
 * @jest-environment jest-environment-jsdom
 */

// ABOUTME: Tests for CopyCommandBlock clipboard interaction (WR-03).
// ABOUTME: Covers success feedback and the denied-clipboard failure path.

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CopyCommandBlock } from '@/app/install/[type]/[slug]/copy-command-block'

function mockClipboard(writeText: jest.Mock) {
  Object.assign(navigator, { clipboard: { writeText } })
}

describe('CopyCommandBlock', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows copied feedback when the clipboard write succeeds', async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined))
    render(<CopyCommandBlock command="blink apply skill/foo" />)

    await act(async () => {
      screen.getByRole('button').click()
    })

    expect(screen.getByRole('button')).toHaveTextContent('copied!')

    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button')).toHaveTextContent('copy')
  })

  it('shows failure feedback when the clipboard write is rejected', async () => {
    mockClipboard(jest.fn().mockRejectedValue(new DOMException('denied')))
    render(<CopyCommandBlock command="blink apply skill/foo" />)

    await act(async () => {
      screen.getByRole('button').click()
    })

    expect(screen.getByRole('button')).toHaveTextContent('copy failed')
    expect(screen.getByRole('button')).not.toHaveTextContent('copied!')

    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button')).toHaveTextContent('copy')
  })
})
