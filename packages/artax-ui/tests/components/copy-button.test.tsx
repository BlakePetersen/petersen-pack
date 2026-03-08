// ABOUTME: Tests for the CopyButton client component with clipboard interaction.
// ABOUTME: Validates CONT-04e: copy button copies text and shows checkmark confirmation.
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyButton } from '../../src/components/copy-button'

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
})

describe('CopyButton', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders a button with "Copy code" aria-label', () => {
    render(<CopyButton text="hello" />)
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  it('calls navigator.clipboard.writeText with provided text on click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CopyButton text="const x = 1" />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(mockWriteText).toHaveBeenCalledWith('const x = 1')
  })

  it('shows checkmark icon after successful copy', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CopyButton text="hello" />)
    const button = screen.getByRole('button', { name: 'Copy code' })
    await user.click(button)
    expect(button.textContent).toContain('\u2713')
  })

  it('reverts to copy icon after timeout', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CopyButton text="hello" />)
    const button = screen.getByRole('button', { name: 'Copy code' })
    await user.click(button)
    expect(button.textContent).toContain('\u2713')
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(button.textContent).not.toContain('\u2713')
  })
})
