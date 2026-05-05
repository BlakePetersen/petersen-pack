Run comprehensive tests for the current changes:

1. Identify which tests are relevant to recent file changes
2. Run the relevant test suites: `pnpm test`
3. If tests fail, show the full failure output
4. For test failures:
   - Analyze the failure reason
   - Suggest fixes or investigate the root cause
   - Re-run tests after fixes to confirm they pass

Do NOT claim tests passed unless all test suites complete successfully with zero failures.
