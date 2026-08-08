// ABOUTME: Shared Anthropic client factory with model and token limit configuration.
// ABOUTME: Provides createAnthropicClient() and constants for AI workflow scripts.

import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_MODEL = 'claude-sonnet-5'
export const DEFAULT_TRIAGE_MAX_TOKENS = 1024

export function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }
  return new Anthropic({ apiKey })
}
