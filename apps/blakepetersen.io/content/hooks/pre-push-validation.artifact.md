---
name: Pre-push Validation Hook
description: Husky v9 pre-push hook running typecheck, lint, and Jest related-tests scoped to files changed between upstream and HEAD
type: hook
merge: replace
destination: .husky/pre-push
devDependencies:
  husky: '^9.1.7'
---

# ABOUTME: Pre-push validation — typecheck + lint + related-tests scoped to changed files.

# ABOUTME: Aborts the push if any check fails; bypass with `git push --no-verify` (rare).

set -e

# Resolve the comparison base — prefer upstream, fall back to origin/main,

# then to the repo's root commit for fresh clones without a remote.

upstream=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
if [ -z "$upstream" ]; then
base=$(git merge-base HEAD origin/main 2>/dev/null || git rev-list --max-parents=0 HEAD | tail -1)
else
  base="$upstream"
fi

changed=$(git diff --name-only "$base"...HEAD)

if [ -z "$changed" ]; then
echo "pre-push: no changed files vs $base — skipping checks"
exit 0
fi

fail() {
echo "" >&2
echo "✘ pre-push: $1 failed" >&2
echo " Fix the errors above, or push with --no-verify if you" >&2
echo " have a reason (the hook is here to help, not block)." >&2
exit 1
}

ts_files=$(echo "$changed" | grep -E '\.(ts|tsx)$' || true)
src_files=$(echo "$changed" | grep -E '\.(ts|tsx|js|jsx)$' || true)

# Typecheck: per-package, not per-file (TS needs the package context).

# pnpm --filter "...[origin/main]" picks packages that contain a changed

# file plus their dependents.

if [ -n "$ts_files" ]; then
echo "→ typecheck (affected packages)"
pnpm -r --filter "...[origin/main]" typecheck || fail "typecheck"
fi

# Lint: file-scoped via ESLint's positional file list.

if [ -n "$src_files" ]; then
echo "→ lint"
pnpm exec eslint $src_files --max-warnings=0 || fail "lint"
fi

# Tests: related-tests mode walks Jest's import graph and runs only the

# tests whose code-under-test transitively touches a changed file.

if [ -n "$src_files" ]; then
echo "→ tests (related)"
pnpm exec jest --findRelatedTests $src_files --passWithNoTests || fail "tests"
fi

echo "✓ pre-push: all checks passed"
