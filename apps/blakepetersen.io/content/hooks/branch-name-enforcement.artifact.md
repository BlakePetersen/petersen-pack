---
name: Branch Name Enforcement Hook
description: Husky v9 pre-push hook that rejects branches not matching feat/|fix/|chore/|docs/|refactor/|test/|perf/|build/|ci/|revert/|gsd/ — protected branches pass
type: hook
merge: replace
destination: .husky/pre-push
devDependencies:
  husky: '^9.1.7'
---

set -e

branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

# Detached HEAD pushes — let them through (rare, but `git push origin <sha>:refs/...` is valid).
if [ -z "$branch" ]; then
  exit 0
fi

# grep -qE against an anchored regex — equivalent to a case-glob, but the
# pattern lives inside a single-quoted string that survives any markdown
# formatter pass intact.
protected_regex='^(main|master|develop|staging|production)$'
prefix_regex='^(feat|fix|chore|docs|refactor|test|perf|build|ci|revert|gsd)/.+'

if printf '%s' "$branch" | grep -qE "$protected_regex"; then
  exit 0
fi

if printf '%s' "$branch" | grep -qE "$prefix_regex"; then
  exit 0
fi

# Branch didn't match. Reject with a helpful message.
echo "" >&2
echo "✘ branch-name-enforcement: '$branch' violates the convention" >&2
echo "" >&2
echo "  Allowed prefixes: feat/, fix/, chore/, docs/, refactor/," >&2
echo "                    test/, perf/, build/, ci/, revert/, gsd/" >&2
echo "  Protected:        main, master, develop, staging, production" >&2
echo "" >&2
echo "  Rename with:  git branch -m $branch <new-name>" >&2
echo "  Then re-push: git push -u origin <new-name>" >&2
echo "" >&2
exit 1
