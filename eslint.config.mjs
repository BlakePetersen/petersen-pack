// ABOUTME: ESLint flat config for the petersen-group monorepo
// ABOUTME: Configures linting rules for Next.js apps with TypeScript

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintReact from '@eslint-react/eslint-plugin'
import importPlugin from 'eslint-plugin-import-x'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ...eslintReact.configs['recommended-typescript'],
    languageOptions: {
      ...eslintReact.configs['recommended-typescript'].languageOptions,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...eslintReact.configs['recommended-typescript'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',
    },
  },
  {
    files: ['packages/artax-ui/src/**/*.ts', 'packages/artax-ui/src/**/*.tsx'],
    plugins: {
      'import-x': importPlugin,
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import-x/no-cycle': ['error', { maxDepth: 3, ignoreExternal: true }],
    },
  },
  {
    files: ['**/tests/**/*.ts', '**/tests/**/*.tsx'],
    rules: {
      '@eslint-react/component-hook-factories': 'off',
    },
  },
  {
    ignores: [
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/public/**',
      '**/dist/**',
      '.trash/**',
    ],
  },
)
