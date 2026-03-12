// ABOUTME: Pure helper functions for PR review logic.
// ABOUTME: Lockfile detection, prompt building, and response parsing with no external deps.

const LOCKFILE_PATTERNS = [
  /pnpm-lock\.yaml$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
];

export interface ReviewComment {
  file: string;
  line: number;
  body: string;
}

export interface ReviewResponse {
  summary: string;
  verdict: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  comments: ReviewComment[];
}

export function isLockfileOnlyPR(files: { filename: string }[]): boolean {
  return files.every((f) =>
    LOCKFILE_PATTERNS.some((p) => p.test(f.filename))
  );
}

export function buildReviewPrompt(
  title: string,
  body: string,
  diff: string
): string {
  return [
    'Review the following pull request.',
    '',
    `<pr_title>${title}</pr_title>`,
    '',
    `<pr_description>${body}</pr_description>`,
    '',
    `<diff>${diff}</diff>`,
  ].join('\n');
}

export function parseReviewResponse(text: string): ReviewResponse {
  // Try to extract JSON from a markdown code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const jsonText = codeBlockMatch ? codeBlockMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonText);
    return {
      summary: parsed.summary ?? '',
      verdict: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'].includes(
        parsed.verdict
      )
        ? parsed.verdict
        : 'COMMENT',
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    };
  } catch {
    return {
      summary: text,
      verdict: 'COMMENT',
      comments: [],
    };
  }
}
