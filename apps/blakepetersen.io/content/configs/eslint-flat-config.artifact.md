---
name: ESLint Flat Config
description: Modern ESLint flat config with TypeScript and strict rules
type: config
merge: replace
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
},
{
ignores: ['dist/', 'node_modules/', '*.config.*'],
},
)
