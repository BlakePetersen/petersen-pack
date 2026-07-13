// ABOUTME: Phase 31 fixture velite config — malformed updated_context (should-fail) scenario.
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
