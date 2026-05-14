// ABOUTME: Lint-staged config — runs eslint on app TS/TSX, prettier on JSON/MD,
// ABOUTME: and fallow dead-code (observability only) scoped to staged files.

import path from 'node:path'

// Fallow runs in report-mode here (no --fail-on-issues) — warn-rated findings
// surface in pre-commit output but don't block the commit. CI gating is via
// `pnpm fallow:ci` which honors the rule severities in .fallowrc.json.
const fileFlags = (files) => files.map((f) => `--file ${f}`).join(' ')

// `blink lint --files` expects paths relative to the app root (e.g.
// `content/skills/convex-patterns.mdx`). lint-staged v10+ passes absolute paths,
// so rebase each path onto `apps/blakepetersen.io/` before joining.
const APP_ROOT = path.resolve('apps/blakepetersen.io')

export default {
  'apps/**/*.{js,jsx,ts,tsx}': ['pnpm eslint --quiet --fix'],
  // Exclude .artifact.md bodies — they carry language-specific payloads
  // (JS / JSON / shell) that prettier mangles when treated as Markdown prose.
  '*.{json,md}': (files) => {
    const filtered = files.filter((f) => !f.endsWith('.artifact.md'))
    return filtered.length ? [`prettier --write ${filtered.join(' ')}`] : []
  },
  '**/*.{ts,tsx}': (files) => `fallow dead-code --quiet ${fileFlags(files)}`,
  // Only lint entry MDX (not `.artifact.md` companions — those use a different
  // frontmatter schema and are validated transitively by the artifact-pair rule
  // when the parent `.mdx` is linted).
  'apps/blakepetersen.io/content/**/*.mdx': (files) => {
    const relative = files.map((f) => path.relative(APP_ROOT, f)).join(',')
    return `pnpm --filter blakepetersen.io exec blink lint --files ${relative}`
  },
}
