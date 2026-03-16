// ABOUTME: ESLint flat config for the petersen-group monorepo
// ABOUTME: Configures linting rules for Next.js apps with TypeScript

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import-x'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
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
