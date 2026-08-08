// ABOUTME: Next.js configuration for blakepetersen.io with Velite content pipeline integration.
// ABOUTME: Uses webpack plugin to build Velite content before Next.js compilation.

import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['artax-ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      }
    ]
  },
  turbopack: {},
  webpack(config, { dev }) {
    // `dev` comes from Next's webpack context — checking process.argv for
    // 'dev' breaks in Next 16, where the config runs in a forked next-server
    // worker with a rewritten argv (watch mode silently never started).
    config.plugins.push(new VeliteWebpackPlugin(dev))
    return config
  }
}

class VeliteWebpackPlugin {
  static started = false
  constructor(private readonly dev: boolean) {}
  apply(compiler: {
    hooks: {
      beforeCompile: {
        tapPromise: (name: string, fn: () => Promise<void>) => void
      }
    }
  }) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const { build } = await import('velite')
      try {
        await build({ watch: this.dev, clean: !this.dev })
      } catch (err) {
        // tapPromise rejections only surface when a page compiles — in dev
        // that can be never, leaving a silent half-dead server. Log eagerly.
        console.error('[VELITE] build failed:', err)
        throw err
      }
    })
  }
}

export default config
