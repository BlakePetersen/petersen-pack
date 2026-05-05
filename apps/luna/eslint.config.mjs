import nextPlugin from 'eslint-config-next'

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.worktrees/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '**/.next/**',
    ],
  },
  ...nextPlugin,
  // P1.6 / TYP-03: no-console rule on browser-reachable app + component subtrees.
  // Also covers lib/** so server modules must flow through pino (Phase 01-02).
  // Excludes test files and lib/logger.edge.ts (the shim intentionally calls
  // console.log to emit JSON).
  {
    files: [
      'app/**/*.ts',
      'app/**/*.tsx',
      'components/sol/**/*.ts',
      'components/sol/**/*.tsx',
      'components/luna/**/*.ts',
      'components/luna/**/*.tsx',
      'lib/**/*.ts',
    ],
    ignores: [
      '**/*.test.ts',
      '**/*.test.tsx',
      'lib/logger.edge.ts',
      // TODO(phase-2): migrate lib/email.ts console.* to pino logger and
      // remove this exemption. Deferred to avoid mixing a ~20-site migration
      // into a lint-rule expansion.
      'lib/email.ts',
    ],
    rules: {
      'no-console': 'error',
    },
  },
]

export default eslintConfig
