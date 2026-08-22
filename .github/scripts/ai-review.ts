// ABOUTME: GitHub Actions adapter for Claude-powered pull request review.
// ABOUTME: Thin entry point that wires deps into ReviewEngine and runs collect → review → submit.

import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import {
  createAnthropicClient,
  CLAUDE_MODEL,
  DEFAULT_REVIEW_MAX_TOKENS
} from './lib/anthropic'
import { createReviewEngine, type AiPort } from './lib/review-engine'

function buildAiPort(): AiPort {
  const anthropic = createAnthropicClient()

  return {
    async review(systemPrompt: string, userMessage: string): Promise<string> {
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: DEFAULT_REVIEW_MAX_TOKENS,
        // Mirrors ai-triage: thinking tokens count against max_tokens, and the
        // budget here is sized for the JSON verdict, not for reasoning.
        thinking: { type: 'disabled' },
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })

      return response.content[0].type === 'text' ? response.content[0].text : ''
    }
  }
}

async function main(): Promise<void> {
  const { context } = github
  const pr = context.payload.pull_request

  if (!pr) {
    core.setFailed('No pull request found in event payload')
    return
  }

  const labels: string[] = (pr.labels ?? []).map(
    (l: { name?: string }) => l.name ?? ''
  )

  if (labels.includes('skip-ai')) {
    core.info('PR has skip-ai label, skipping review')
    return
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    core.setFailed('GITHUB_TOKEN environment variable is required')
    return
  }

  const engine = createReviewEngine({
    ai: buildAiPort(),
    github: {
      octokit: new Octokit({ auth: token }),
      owner: context.repo.owner,
      repo: context.repo.repo
    }
  })

  try {
    const { files, diff } = await engine.collect(pr.number)

    const result = await engine.review({
      title: pr.title ?? '',
      body: pr.body ?? '',
      files,
      diff
    })

    if (!result) {
      core.info(`PR #${pr.number} is lockfile-only, skipping review`)
      return
    }

    const outcome = await engine.submit(pr.number, result)

    core.info(
      `Reviewed PR #${pr.number}: ${result.verdict}, ${result.comments.length} comment(s), inline=${outcome.inlineCommentsPosted}`
    )
  } catch (error) {
    core.setFailed(
      `PR review failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

main()
