// ABOUTME: Lint-staged config — runs eslint on app TS/TSX, prettier on every
// ABOUTME: staged TS/JSON/MD file, and fallow dead-code (observability only).

// Fallow runs in report-mode here (no --fail-on-issues) — warn-rated findings
// surface in pre-commit output but don't block the commit. CI gating is via
// `pnpm fallow:ci` which honors the rule severities in .fallowrc.json.
const fileFlags = (files) => files.map((f) => `--file ${f}`).join(' ')

// eslint --fix and prettier --write both rewrite the same staged files, so the
// hook invokes lint-staged with `--concurrent false` (see .husky/pre-commit) —
// glob groups otherwise run in parallel and can clobber each other's writes.
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
  '**/*.{json,md}': ['prettier --write'],
  '**/*.{ts,tsx}': (files) => {
    // apps/luna is excluded — fallow doesn't honor its `// fallow-ignore-file
    // circular-dependencies` directives on those files, and luna isn't CI-gated.
    const filtered = files.filter((f) => !f.includes('/apps/luna/'))
    // prettier runs over every staged TS file — CI's repo-wide `format:check`
    // gate covers `**/*.{ts,tsx,md}`, so a hook that skips them can green-light
    // a commit the gate then rejects.
    return [
      ...(filtered.length
        ? [`fallow dead-code --quiet ${fileFlags(filtered)}`]
        : []),
      `prettier --write ${files.join(' ')}`,
    ]
  },
  // Staged-only content lint (LINT-05). The runner dispatches by collection,
  // so posts and .artifact.md siblings passed here are filtered, not
  // mis-validated against the DX schema (the old "phantom errors").
  // Invoked by node path, not the `blink` bin: pnpm only links workspace bins
  // whose dist/ exists at install time, so the bin is absent in CI and fresh
  // clones (install runs before build). Build first — tsup, sub-second warm.
  'apps/blakepetersen.io/content/**/*.{mdx,md}': (files) => [
    'pnpm --filter @blink/cli build',
    `node packages/blink-cli/dist/cli.mjs lint --files ${files.join(',')}`,
  ],
}
