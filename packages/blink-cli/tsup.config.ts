// ABOUTME: Build configuration for the blink CLI tool.
// ABOUTME: Produces a single-file ESM binary with shebang for direct execution.
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  noExternal: [/.*/],
  splitting: false,
  outExtension: () => ({ js: '.mjs' }),
  banner: {
    js: [
      '#!/usr/bin/env node',
      // gray-matter uses CJS require('fs') internally; esbuild's ESM __require shim',
      // does not resolve Node builtins. Provide a real createRequire-based shim.',
      'import { createRequire as __gm_createRequire } from "node:module";',
      'const require = __gm_createRequire(import.meta.url);'
    ].join('\n')
  }
})
