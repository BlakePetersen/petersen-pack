// ABOUTME: Next.js configuration for blakepetersen.io with Velite content pipeline integration.
// ABOUTME: Triggers Velite build programmatically for Turbopack compatibility.

import type { NextConfig } from 'next'

const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then((m) => m.build({ watch: isDev, clean: !isDev }))
}

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['artax-ui'],
}

export default config
