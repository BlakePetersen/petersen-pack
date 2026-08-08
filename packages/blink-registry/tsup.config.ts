// ABOUTME: Build configuration for the blink-registry library.
// ABOUTME: Emits ESM + CJS + types so consumers don't depend on a TS-aware Node loader.
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node20',
  platform: 'neutral',
  outDir: 'dist',
  clean: true,
  dts: true,
  splitting: false,
  sourcemap: true
})
