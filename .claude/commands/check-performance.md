Check bundle sizes and performance budgets for the production build:

1. Run `pnpm check:performance` to analyze the build
2. If no build exists, it will automatically run `pnpm build` first
3. Review the output showing:
   - Top 10 largest JavaScript bundles
   - Total bundle size
   - Number of pages
   - Budget violations and warnings

Performance budgets:

- Max bundle size: 500KB per file
- Max page size: 300KB for page-specific JS
- Max first load JS: 200KB

The check will:

- ✅ Pass if all bundles are within budget
- ⚠️ Warn if bundles are at 80%+ of budget
- ❌ Fail if any bundle exceeds budget limits

If budgets are exceeded:

- Review recommendations for code splitting
- Consider dynamic imports for large components
- Check for unused dependencies
- Optimize images and assets
- Use lazy loading where appropriate

Run this before commits to catch performance regressions early.
