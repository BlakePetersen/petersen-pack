// ABOUTME: Tests for the Modal organism composing Dialog with mounted-flag SSR gate.
// ABOUTME: Covers controlled open, trigger, Esc-to-close, Title slot, and SSR no-radix-id.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { Modal } from '../../src/components/organisms/modal/modal'

describe('Modal', () => {
  it('renders children when open is true (controlled)', () => {
    render(
      <Modal open={true} onOpenChange={() => {}}>
        <Modal.Title>modal title</Modal.Title>
        <p>modal body content</p>
      </Modal>
    )
    expect(screen.getByText('modal body content')).toBeInTheDocument()
  })

  it('invokes onOpenChange(true) when trigger is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <Modal
        open={false}
        onOpenChange={handleChange}
        trigger={<button>open modal</button>}
      >
        <Modal.Title>t</Modal.Title>
        <p>body</p>
      </Modal>
    )
    await user.click(screen.getByRole('button', { name: 'open modal' }))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('invokes onOpenChange(false) when Escape is pressed while open', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <Modal open={true} onOpenChange={handleChange}>
        <Modal.Title>t</Modal.Title>
        <p>body</p>
      </Modal>
    )
    await user.keyboard('{Escape}')
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('renders Modal.Title inside the content subtree', () => {
    render(
      <Modal open={true} onOpenChange={() => {}}>
        <Modal.Title>slot title</Modal.Title>
        <p>body</p>
      </Modal>
    )
    expect(screen.getByText('slot title')).toBeInTheDocument()
  })

  it('SSR output carries trigger without Radix-managed aria-controls', () => {
    const ssrHtml = renderToString(
      <Modal trigger={<button>open</button>}>
        <Modal.Title>t</Modal.Title>
        body
      </Modal>
    )
    // Trigger survives SSR for layout + a11y stability.
    expect(ssrHtml).toContain('open')
    // Radix Dialog trigger adds aria-controls="radix-..." keyed off useId.
    // The mounted-flag gate must omit that attribute on SSR.
    expect(ssrHtml).not.toMatch(/aria-controls="radix-/)
  })
})
