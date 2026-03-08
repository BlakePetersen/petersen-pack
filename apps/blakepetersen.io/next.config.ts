// ABOUTME: Next.js configuration for blakepetersen.io with Velite content pipeline integration.
// ABOUTME: Uses webpack plugin to build Velite content before Next.js compilation.

import type { NextConfig } from 'next'

const isDev = process.argv.indexOf('dev') !== -1

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['artax-ui'],
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
}

class VeliteWebpackPlugin {
  static started = false
  apply(compiler: { hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } } }) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const { build } = await import('velite')
      await build({ watch: isDev, clean: !isDev })
    })
  }
}

export default config
