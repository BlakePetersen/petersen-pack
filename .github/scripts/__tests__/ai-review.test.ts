// ABOUTME: Unit tests for AI review helper functions.
// ABOUTME: Tests isLockfileOnlyPR, buildReviewPrompt, and parseReviewResponse.

import {
  isLockfileOnlyPR,
  buildReviewPrompt,
  parseReviewResponse,
} from '../ai-review';

describe('isLockfileOnlyPR', () => {
  it('returns true when all files are lockfiles', () => {
    expect(isLockfileOnlyPR([{ filename: 'pnpm-lock.yaml' }])).toBe(true);
  });

  it('returns false when non-lockfile files are present', () => {
    expect(
      isLockfileOnlyPR([
        { filename: 'src/index.ts' },
        { filename: 'pnpm-lock.yaml' },
      ])
    ).toBe(false);
  });

  it('returns true for empty file list', () => {
    expect(isLockfileOnlyPR([])).toBe(true);
  });

  it('recognizes multiple lockfile types', () => {
    expect(
      isLockfileOnlyPR([
        { filename: 'pnpm-lock.yaml' },
        { filename: 'package-lock.json' },
        { filename: 'yarn.lock' },
      ])
    ).toBe(true);
  });
});

describe('buildReviewPrompt', () => {
  it('returns string containing title, body, and diff in XML tags', () => {
    const result = buildReviewPrompt('my title', 'my body', 'my diff');
    expect(result).toContain('<pr_title>my title</pr_title>');
    expect(result).toContain('<pr_description>my body</pr_description>');
    expect(result).toContain('<diff>my diff</diff>');
  });
});

describe('parseReviewResponse', () => {
  it('parses valid JSON with summary, verdict, and comments', () => {
    const json = JSON.stringify({
      summary: 'Looks good',
      verdict: 'APPROVE',
      comments: [{ file: 'src/index.ts', line: 1, body: 'Nice' }],
    });
    const result = parseReviewResponse(json);
    expect(result.summary).toBe('Looks good');
    expect(result.verdict).toBe('APPROVE');
    expect(result.comments).toHaveLength(1);
  });

  it('returns fallback object with verdict COMMENT for invalid JSON', () => {
    const result = parseReviewResponse('This is not JSON at all');
    expect(result.verdict).toBe('COMMENT');
    expect(result.summary).toBeDefined();
    expect(result.comments).toEqual([]);
  });

  it('extracts JSON from markdown code block', () => {
    const text = 'Here is my review:\n```json\n{"summary":"Good","verdict":"APPROVE","comments":[]}\n```';
    const result = parseReviewResponse(text);
    expect(result.verdict).toBe('APPROVE');
    expect(result.summary).toBe('Good');
  });
});
