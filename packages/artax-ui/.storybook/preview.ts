// ABOUTME: Storybook preview configuration for artax-ui.
// ABOUTME: Loads terminal theme CSS and sets dark background as default.
import type { Preview } from '@storybook/react-vite'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'terminal',
      values: [
        { name: 'terminal', value: '#0A0A0A' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
