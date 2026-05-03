// ABOUTME: Lint-staged config — runs eslint on app TS/TSX, prettier on JSON/MD,
// ABOUTME: and fallow dead-code (observability only) scoped to staged files.

// Fallow runs in report-mode here (no --fail-on-issues) — warn-rated findings
// surface in pre-commit output but don't block the commit. CI gating is via
// `pnpm fallow:ci` which honors the rule severities in .fallowrc.json.
const fileFlags = (files) => files.map((f) => `--file ${f}`).join(' ')

export default {
  'apps/**/*.{js,jsx,ts,tsx}': ['pnpm eslint --quiet --fix'],
  '*.{json,md}': ['prettier --write'],
  '**/*.{ts,tsx}': (files) => `fallow dead-code --quiet ${fileFlags(files)}`,
}
