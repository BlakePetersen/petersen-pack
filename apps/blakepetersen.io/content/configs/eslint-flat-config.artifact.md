---
name: ESLint Flat Config
description: Modern ESLint flat config with TypeScript and strict rules
type: config
merge: section
destination: eslint.config.js
devDependencies:
  eslint: '^9.0.0'
  typescript-eslint: '^8.0.0'
  '@eslint/js': '^9.0.0'
---

import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
js.configs.recommended,
...tseslint.configs.strictTypeChecked,
{
languageOptions: {
parserOptions: {
projectService: true,
tsconfigRootDir: import.meta.dirname,
},
},
rules: {
'@typescript-eslint/no-floating-promises': 'error',
'@typescript-eslint/consistent-type-imports': 'error',
'@typescript-eslint/no-unused-vars': [
'error',
{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
],
},
},
{
ignores: ['dist/', 'node_modules/', '*.config.*'],
},
)
