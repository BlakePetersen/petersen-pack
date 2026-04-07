// ABOUTME: Shared utility for ensuring .blink/ is in the project's .gitignore.
// ABOUTME: Used by both apply (auto-init) and init commands.

import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

export async function addToGitignore(cwd: string): Promise<void> {
  const gitignorePath = join(cwd, '.gitignore')
  let content: string

  try {
    content = await readFile(gitignorePath, 'utf-8')
  } catch {
    content = ''
  }

  if (content.includes('.blink/')) return

  if (content.length > 0 && !content.endsWith('\n')) {
    content += '\n'
  }

  content += '.blink/\n'
  await writeFile(gitignorePath, content)
}
