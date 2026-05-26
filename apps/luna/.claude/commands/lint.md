Run comprehensive linting checks on the codebase:

1. Run ESLint: `pnpm lint`
2. Run TypeScript type checking: `pnpm type-check`
3. Check Prettier formatting: `pnpm format:check`

If any checks fail:

- Show the full output of each failed check
- Offer to auto-fix issues with `pnpm lint --fix` and `pnpm format:write`
- For type errors, investigate and suggest fixes

Do NOT claim the linting passed unless all three checks succeed with zero errors or warnings.
