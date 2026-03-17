// ABOUTME: Shared interactive prompt utilities for blink-cli commands.
// ABOUTME: Provides confirmation dialogs with skip-prompt bypass and cancellation handling.
import { consola } from 'consola'

export async function confirmAction(
  message: string,
  skipPrompt: boolean
): Promise<boolean> {
  if (skipPrompt) return true
  const result = await consola.prompt(message, { type: 'confirm' })
  if (typeof result === 'symbol') {
    consola.info('Cancelled.')
    process.exit(0)
    return false // unreachable, satisfies control-flow analysis
  }
  return result as boolean
}
