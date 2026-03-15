---
name: Global CLAUDE.md
description: Starter template for ~/.claude/CLAUDE.md with coding and communication preferences
type: config
merge: section
destination: .claude/CLAUDE.md
---

<!-- blink:start claude-global -->

## Coding Style

- Prefer simple, readable code over clever abstractions
- Use descriptive names that reveal intent — avoid abbreviations
- Handle errors explicitly; never silently swallow exceptions
- Keep functions small and focused on a single responsibility
- Delete dead code rather than commenting it out

## Communication

- Be direct and concise — skip preamble and filler
- Ask clarifying questions when requirements are ambiguous
- Push back on approaches you disagree with, citing specific reasons
- Proceed without asking when the path forward is clear
- When unsure, say so honestly rather than guessing

## Version Control

- Write commit messages that explain why, not just what
- Keep commits atomic — one logical change per commit
- Never force-push to shared branches
- Review your own diff before committing

## Testing

- Write tests for behavior, not implementation details
- Test edge cases and error paths, not just the happy path
- Keep tests independent — no shared mutable state between tests
- Name tests to describe the expected behavior

<!-- blink:end claude-global -->
