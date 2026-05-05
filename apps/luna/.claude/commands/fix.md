Quick bugfix workflow with verification:

1. Run tests to identify failing tests: `pnpm test`
2. For each failure:
   - Investigate the root cause using systematic debugging
   - Implement the minimal fix needed
   - Re-run the specific test to verify the fix
3. After all fixes, run the full test suite to ensure no regressions
4. Run linting and type checking: `pnpm lint && pnpm type-check`
5. Fix any lint or type errors
6. Confirm all checks pass before completing

This workflow ensures a systematic approach to fixing bugs with proper verification at each step.
