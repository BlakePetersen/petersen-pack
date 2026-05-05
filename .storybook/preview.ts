import type { Preview } from '@storybook/nextjs'
import React from 'react'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '../components/commons'
import '../app/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: 'hsl(0 0% 100%)',
        },
        {
          name: 'dark',
          value: 'hsl(0 0% 3.9%)',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light'

      // Apply font CSS variables to Storybook root
      React.useEffect(() => {
        const root = document.documentElement
        root.className = `${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`
      }, [])

      return React.createElement(
        ThemeProvider,
        {
          attribute: 'class',
          defaultTheme: theme,
          forcedTheme: theme,
        },
        React.createElement(Story)
      )
    },
  ],
}

export default preview
