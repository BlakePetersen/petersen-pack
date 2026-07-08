// ABOUTME: Lint-staged config — runs eslint on app TS/TSX, prettier on JSON/MD,
// ABOUTME: and fallow dead-code (observability only) scoped to staged files.

// Fallow runs in report-mode here (no --fail-on-issues) — warn-rated findings
// surface in pre-commit output but don't block the commit. CI gating is via
// `pnpm fallow:ci` which honors the rule severities in .fallowrc.json.
const fileFlags = (files) => files.map((f) => `--file ${f}`).join(' ')

export default {
  // apps/luna is excluded from CI gates (see root package.json `--filter=!Luna`)
  // and from the eslint pre-commit hook here. Its eslint plugins are incompatible
  // with the monorepo's eslint 10 (eslint-plugin-react 7.37.5 crashes), and luna
  // isn't CI-integrated yet — lint it locally inside apps/luna when needed.
  'apps/**/*.{js,jsx,ts,tsx}': (files) => {
    const filtered = files.filter((f) => !f.includes('/apps/luna/'))
    return filtered.length
      ? [`pnpm eslint --quiet --fix ${filtered.join(' ')}`]
      : []
  },
  '*.{json,md}': ['prettier --write'],
  '**/*.{ts,tsx}': (files) => {
    // apps/luna is excluded — fallow doesn't honor its `// fallow-ignore-file
    // circular-dependencies` directives on those files, and luna isn't CI-gated.
    const filtered = files.filter((f) => !f.includes('/apps/luna/'))
    return filtered.length ? `fallow dead-code --quiet ${fileFlags(filtered)}` : []
  },
  // Staged-only content lint (LINT-05). The runner dispatches by collection,
  // so posts and .artifact.md siblings passed here are filtered, not
  // mis-validated against the DX schema (the old "phantom errors").
  // The CLI bin resolves to packages/blink-cli/dist/, which doesn't exist on
  // a fresh clone — build it first (tsup, sub-second when warm) so the hook
  // fails on real lint errors rather than a missing binary.
  'apps/blakepetersen.io/content/**/*.{mdx,md}': (files) => [
    'pnpm --filter @blink/cli build',
    `pnpm --filter blakepetersen.io exec blink lint --files ${files.join(',')}`,
  ],
}
