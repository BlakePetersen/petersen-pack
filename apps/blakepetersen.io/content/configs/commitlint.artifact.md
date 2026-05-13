---
name: Commitlint + Husky commit-msg
description: Commitlint config (Conventional Commits + scope-enum) and the Husky commit-msg hook that runs it
type: config
merge: replace
destination: commitlint.config.js
devDependencies:
  '@commitlint/cli': '^19.6.0'
  '@commitlint/config-conventional': '^19.6.0'
  husky: '^9.1.7'
---

// ABOUTME: Conventional Commits enforcement with scoped vocabulary and body-line-length warning.
// ABOUTME: Paired with .husky/commit-msg — `pnpm exec commitlint --edit "$1"`.

export default {
extends: ['@commitlint/config-conventional'],
rules: {
'scope-enum': [
2,
'always',
[
'site',
'ui',
'cli',
'registry',
'docs',
'deps',
'config',
'release',
],
],
'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
'subject-empty': [2, 'never'],
'subject-full-stop': [2, 'never', '.'],
'type-enum': [
2,
'always',
[
'feat',
'fix',
'docs',
'style',
'refactor',
'perf',
'test',
'build',
'ci',
'chore',
'revert',
],
],
'body-max-line-length': [1, 'always', 100],
'footer-max-line-length': [1, 'always', 100],
},
}
