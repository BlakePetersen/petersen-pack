---
name: verify-linting
description: Use before claiming work is complete - runs linting checks and verifies code quality
---

<EXTREMELY_IMPORTANT>
This skill MUST be used before claiming any work is complete, fixed, or passing.
Evidence before assertions. Always.
</EXTREMELY_IMPORTANT>

# When to Use This Skill

Use this skill:

- Before claiming a task is complete
- Before creating a commit or pull request
- Before marking the final todo in a feature as completed
- When Blake explicitly asks to verify linting

# Verification Steps

## 1. Run All Linting Checks

Execute ALL of these commands and capture their output:

```bash
pnpm lint
pnpm type-check
pnpm format:check
```

## 2. Analyze Results

For EACH command:

- ✅ **PASS**: Exit code 0, no errors or warnings
- ❌ **FAIL**: Exit code non-zero, OR any errors/warnings present

## 3. Handle Failures

If ANY check fails:

1. **DO NOT claim work is complete**
2. Show Blake the full error output
3. Ask if you should:
   - Auto-fix with `pnpm lint --fix` and `pnpm format:write`
   - Investigate and manually fix the issues
   - Skip linting for this specific case (Blake must explicitly approve)

## 4. Re-verify After Fixes

After auto-fixing or manual fixes:

- Run ALL three commands again
- Verify ALL pass before proceeding
- Update todos to reflect completion only after verification succeeds

# Critical Rules

- **NEVER skip verification** - Always run all three commands
- **NEVER claim completion without verification** - Evidence required
- **NEVER ignore warnings** - Treat warnings as failures unless Blake explicitly approves
- **NEVER batch multiple verifications** - Verify after each logical change

# Example Workflow

```
[After completing feature implementation]
Claude: "Let me verify linting before marking this complete..."
Claude: [Runs pnpm lint, pnpm type-check, pnpm format:check]
Claude: [Analyzes output]
Claude: [If all pass] "All linting checks passed. Feature is complete."
Claude: [If any fail] "Found 3 ESLint errors. Should I auto-fix with --fix?"
```

# Integration with Todos

Before marking ANY todo as completed:

1. Run this skill
2. Verify all checks pass
3. ONLY THEN mark todo as completed

This ensures every completed task meets code quality standards.
