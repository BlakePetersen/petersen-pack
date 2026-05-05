// ABOUTME: Storybook stories for form input patterns
// ABOUTME: Demonstrates input fields, textareas, selects with various states

import type { Meta, StoryObj } from '@storybook/nextjs'

const meta = {
  title: 'Design System/Forms',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const InputStates: Story = {
  render: () => (
    <div className="max-w-2xl space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Input States</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Form inputs with different states for various interactions and
          validations.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">Default State</h3>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Success State</h3>
          <input
            type="email"
            placeholder="email@example.com"
            value="john@example.com"
            readOnly
            className="w-full rounded-lg border border-green-400 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-green-100 dark:border-green-500 dark:bg-gray-800 dark:text-white dark:focus:ring-green-900"
          />
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            Email address is valid
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Error State</h3>
          <input
            type="email"
            placeholder="email@example.com"
            value="invalid-email"
            readOnly
            className="w-full rounded-lg border border-red-400 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-red-100 dark:border-red-500 dark:bg-gray-800 dark:text-white dark:focus:ring-red-900"
          />
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Please enter a valid email address
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Disabled State</h3>
          <input
            type="text"
            placeholder="Disabled input"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-600"
          />
        </div>
      </div>
    </div>
  ),
}

export const FormElements: Story = {
  render: () => (
    <div className="max-w-2xl space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Form Elements</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          All standard form elements styled consistently.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Text Input
          </label>
          <input
            type="text"
            placeholder="Enter text"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Email Input
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Select Dropdown
          </label>
          <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900">
            <option>Select a service...</option>
            <option>Portrait Photography</option>
            <option>Wedding Photography</option>
            <option>Commercial Photography</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Textarea
          </label>
          <textarea
            rows={4}
            placeholder="Enter your message..."
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-900 dark:text-white">
              I agree to the terms and conditions
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="session-type"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-900 dark:text-white">
              Family Session
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="session-type"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-900 dark:text-white">
              Wedding Session
            </span>
          </label>
        </div>
      </div>
    </div>
  ),
}

export const CompleteForm: Story = {
  render: () => (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">
          Complete Form Example
        </h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          A realistic contact form showcasing all patterns together.
        </p>
      </div>

      <form className="rounded-lg border bg-card p-gutter">
        <h3 className="mb-6 font-serif text-heading-md">Contact Us</h3>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Session Type
            </label>
            <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900">
              <option>Select a service...</option>
              <option>Family Portrait</option>
              <option>Wedding Photography</option>
              <option>Maternity Session</option>
              <option>Engagement Photos</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about your photography needs..."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
              />
              <span className="text-sm text-gray-900 dark:text-white">
                I would like to receive email updates about availability
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400 px-6 py-3 font-sans text-body-md text-white transition-transform hover:scale-105"
            >
              Send Message
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  ),
}
