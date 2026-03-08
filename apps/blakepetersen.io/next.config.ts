// ABOUTME: Next.js configuration for blakepetersen.io.
// ABOUTME: Transpiles artax-ui workspace package for proper module resolution.

import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['artax-ui'],
}

export default config
