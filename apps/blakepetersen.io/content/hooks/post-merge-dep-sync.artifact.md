---
name: Post-merge Dependency Sync Hook
description: Husky v9 post-merge hook that re-runs pnpm install whenever pnpm-lock.yaml changed in the merge diff
type: hook
merge: replace
destination: .husky/post-merge
devDependencies:
  husky: '^9.1.7'
---

set -e

# Files changed by this merge (ORIG_HEAD = pre-merge tip, HEAD = post-merge tip).
changed=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD 2>/dev/null || echo "")

# grep -q instead of a case-glob — the literal asterisks in `*pnpm-lock.yaml*`
# get mangled into italics if a prettier pass ever touches this file.
if printf '%s\n' "$changed" | grep -q 'pnpm-lock\.yaml'; then
  echo "→ pnpm-lock.yaml changed — running pnpm install"
  if ! pnpm install; then
    echo "" >&2
    echo "✘ post-merge: pnpm install failed" >&2
    echo "  Your working tree is up-to-date, but node_modules is stale." >&2
    echo "  Run 'pnpm install' manually after fixing the error above." >&2
    exit 1
  fi
  echo "✓ post-merge: dependencies in sync"
fi
