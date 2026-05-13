---
name: Commit-msg AI Assist Hook
description: Husky v9 commit-msg hook that detects non-conventional commit messages and offers an AI-generated Conventional Commits rewrite — accept, edit, or reject
type: hook
merge: replace
destination: .husky/commit-msg
devDependencies:
  husky: '^9.1.7'
---

# ABOUTME: Commit-msg AI assist — suggests a Conventional Commits rewrite via a local CLI.

# ABOUTME: AI_COMMIT_CMD env var picks the CLI (default: claude). Never silently rewrites.

set -e

msg_file="$1"
[ -f "$msg_file" ] || exit 0

# Strip git's comment lines (lines starting with #) — those are scaffolding.

msg=$(grep -v '^#' "$msg_file" | sed '/^$/d')
first_line=$(printf '%s' "$msg" | head -1)

# Conventional Commits regex — type(scope)?: subject

conventional_regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: '

if printf '%s' "$first_line" | grep -qE "$conventional_regex"; then

# Already conventional — nothing to do.

exit 0
fi

# Skip empty messages (git already rejects these elsewhere).

if [ -z "$first_line" ]; then
exit 0
fi

# Pick the AI CLI. Default to `claude`; reader can swap via env var.

ai_cmd="${AI_COMMIT_CMD:-claude}"

if ! command -v "$ai_cmd" >/dev/null 2>&1; then

# AI CLI not installed — fall through silently.

exit 0
fi

# Bundle the staged diff so the AI can infer scope from file paths.

diff=$( (git diff --cached --stat; echo "---"; git diff --cached) 2>/dev/null || echo "")

prompt=$(cat <<PROMPT
Rewrite this commit message in Conventional Commits format.
Type prefixes: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert.
Optional scope in parens (derive from file paths in the diff).
Subject under 70 chars. Output the message only, no commentary.

Original message:
$msg

Staged diff:
$diff
PROMPT
)

suggestion=$(printf '%s' "$prompt" | "$ai_cmd" 2>/dev/null || echo "")

if [ -z "$suggestion" ]; then

# AI call failed or returned empty — let the commit proceed unchanged.

# Commitlint downstream will catch it if it's non-conformant.

exit 0
fi

suggestion_first=$(printf '%s' "$suggestion" | head -1)

echo "" >&2
echo "── commit-msg-ai-assist ──" >&2
echo "Original: $first_line" >&2
echo "Suggestion: $suggestion_first" >&2
echo "" >&2

# Force the read from /dev/tty — commit-msg runs with stdin closed.

if [ -e /dev/tty ]; then
printf "Use suggestion? [y]es / [e]dit / [n]o: " >&2
read answer </dev/tty || answer="n"
else

# No TTY available (e.g. CI, rebase) — never overwrite without confirmation.

exit 0
fi

case "$answer" in
  y|Y|yes|YES)
    printf '%s\n' "$suggestion" > "$msg_file"
    echo "✓ message replaced with suggestion" >&2
    ;;
  e|E|edit|EDIT)
    printf '%s\n' "$suggestion" > "$msg_file"
    "${EDITOR:-vi}" "$msg_file" </dev/tty
;;
\*) # Decline — original message stays in place.
;;
esac
