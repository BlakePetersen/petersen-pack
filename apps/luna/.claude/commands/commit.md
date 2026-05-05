Create a well-formatted git commit following Blake's standards:

1. Run `git status` to see untracked and modified files
2. Run `git diff` to review all changes
3. Run `git log --oneline -10` to understand commit message style
4. Analyze the changes and draft a commit message that:
   - Uses active voice (e.g., "Add feature" not "Added feature")
   - Focuses on WHY the change was made, not just WHAT changed
   - Follows the repository's commit message conventions
   - Is concise (1-2 sentences)
5. Add relevant files to staging with `git add`
6. Create the commit with the message ending with:

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>

Do NOT commit files that likely contain secrets (.env, credentials.json, etc).
