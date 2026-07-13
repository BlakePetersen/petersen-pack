// ABOUTME: Phase 31 fixture velite config — schema-parity valid (should-pass) scenario.
// ABOUTME: Reuses the base config schemas; roots at this fixture's content/ tree.

import { defineConfig } from 'velite'
import baseConfig from '../../../velite.config'

export default defineConfig({
  ...baseConfig,
  root: './content',
  output: {
    ...baseConfig.output,
    data: '.velite-fixture',
    clean: true,
  },
})
