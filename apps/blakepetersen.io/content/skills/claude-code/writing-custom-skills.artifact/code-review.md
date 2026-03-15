# Code Review

Perform thorough code reviews that catch bugs, enforce patterns, and provide actionable feedback.

## When to Use

Activate this skill when asked to review a pull request, diff, or set of changes. Apply it to both staged changes and complete feature branches.

## Process

### 1. Understand the Change

Read the PR description or commit messages to understand intent. Identify which files changed and categorize them: new features, bug fixes, refactors, tests, or configuration.

### 2. Check for Correctness

- Verify the code does what the description claims
- Look for off-by-one errors, null/undefined access, and unhandled edge cases
- Confirm error handling covers failure modes
- Check that async operations handle rejection and cancellation
- Verify database queries use parameterized inputs

### 3. Evaluate Patterns and Conventions

- Naming follows project conventions (check CLAUDE.md or existing code)
- File organization matches the project structure
- Import paths use the project's alias system
- Types are specific, not `any` or overly broad unions
- Functions have clear single responsibilities

### 4. Assess Test Coverage

- New behavior has corresponding tests
- Edge cases are tested, not just the happy path
- Tests verify behavior, not implementation details
- Mocks are minimal and justified

### 5. Review for Security

- User input is validated before use
- Authentication and authorization checks are present on protected paths
- Sensitive data is not logged or exposed in error messages
- Dependencies are from trusted sources

## Output Format

Structure your review as:

```
## Summary
One paragraph describing what the change does and your overall assessment.

## Issues
- **[severity]** file:line — description and suggested fix

## Suggestions
- Optional improvements that are not blocking

## Verdict
APPROVE, REQUEST_CHANGES, or COMMENT with reasoning
```

Severity levels: `critical` (must fix), `warning` (should fix), `nit` (optional).

## Success Criteria

- Every issue includes a specific file and line reference
- Suggestions include concrete code examples when possible
- The review is completable in under 10 minutes for changes under 500 lines
- No false positives from pattern-matching without understanding context
