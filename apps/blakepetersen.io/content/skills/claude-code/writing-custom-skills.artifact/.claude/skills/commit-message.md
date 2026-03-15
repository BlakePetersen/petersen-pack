# Commit Message

Write clear, conventional commit messages that make git history useful.

## When to Use

Activate this skill when creating git commits. Apply the format consistently across all commits in the project.

## Process

### 1. Determine the Type

| Type       | When                                |
| ---------- | ----------------------------------- |
| `feat`     | New feature or capability           |
| `fix`      | Bug fix                             |
| `refactor` | Code change with no behavior change |
| `test`     | Adding or updating tests            |
| `docs`     | Documentation only                  |
| `chore`    | Build, config, or tooling changes   |

### 2. Write the Message

Format: `type(scope): concise description`

- Scope is the module, package, or feature area affected
- Description is imperative mood, lowercase, no period
- Keep the first line under 72 characters
- Add a body paragraph for non-obvious changes

### 3. Validate

- The message explains _why_, not just _what_
- Someone reading `git log --oneline` can understand the change
- The scope is consistent with previous commits in the repo

## Success Criteria

- Every commit follows `type(scope): description` format
- First line is under 72 characters
- Body is present for changes that need explanation
