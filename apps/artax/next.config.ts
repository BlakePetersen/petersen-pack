// ABOUTME: Next.js configuration for the Artax UI reference site.
// ABOUTME: Transpiles the artax-ui workspace package for component rendering.

import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['artax-ui'],
  turbopack: {},
}

export default config
