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
  outExtension: () => ({ js: '.mjs' }),
  banner: { js: '#!/usr/bin/env node' },
})
