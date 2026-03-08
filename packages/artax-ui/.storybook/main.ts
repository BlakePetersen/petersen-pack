// ABOUTME: Storybook configuration for the artax-ui design system.
// ABOUTME: Uses react-vite framework with stories from src directory.
import type { StorybookConfig } from '@storybook/react-vite'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
  ],
  framework: getAbsolutePath('@storybook/react-vite'),
}

export default config
