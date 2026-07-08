// ABOUTME: GitHub Actions adapter for Claude-powered issue triage.
// ABOUTME: Thin entry point that wires deps into TriageEngine and runs classify → apply.

import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import {
  createAnthropicClient,
  CLAUDE_MODEL,
  DEFAULT_TRIAGE_MAX_TOKENS,
} from './lib/anthropic';
import { createTriageEngine, type AiPort } from './lib/triage-engine';

function buildAiPort(): AiPort {
  const anthropic = createAnthropicClient();

  return {
    async classify(systemPrompt: string, userMessage: string): Promise<string> {
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: DEFAULT_TRIAGE_MAX_TOKENS,
        // Sonnet 5 runs adaptive thinking when `thinking` is omitted; thinking
        // tokens count against max_tokens, which would starve the 1024-token
        // classification budget. Keep the pre-migration thinking-off behavior.
        thinking: { type: 'disabled' },
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    },
  };
}

async function main(): Promise<void> {
  const { context } = github;
  const issue = context.payload.issue;

  if (!issue) {
    core.setFailed('No issue found in event payload');
    return;
  }

  const existingLabels: string[] = (issue.labels ?? []).map(
    (l: { name?: string }) => l.name ?? ''
  );

  if (existingLabels.includes('skip-ai')) {
    core.info('Issue has skip-ai label, skipping triage');
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    core.setFailed('GITHUB_TOKEN environment variable is required');
    return;
  }

  const engine = createTriageEngine({
    ai: buildAiPort(),
    github: {
      octokit: new Octokit({ auth: token }),
      owner: context.repo.owner,
      repo: context.repo.repo,
    },
  });

  try {
    const issueInput = {
      title: issue.title ?? '',
      body: issue.body ?? '',
      number: issue.number,
      existingLabels,
    };

    const result = await engine.classify(issueInput);
    await engine.apply(result, issueInput);

    core.info(
      `Triaged issue #${issue.number}: ${result.type}/${result.priority}/${result.area}`
    );
  } catch (error) {
    core.setFailed(
      `Issue triage failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

main();

export { buildTriagePrompt, parseTriageResponse, validateLabels } from './lib/triage-helpers';
