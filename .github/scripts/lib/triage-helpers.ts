// ABOUTME: Pure helper functions for issue triage logic.
// ABOUTME: Prompt building, response parsing, and label validation with no external deps.

import { LABELS } from './labels';

export interface TriageResponse {
  type: string;
  priority: string;
  area: string;
  is_duplicate: boolean;
  tldr: string;
}

const FALLBACK: TriageResponse = {
  type: 'bug',
  priority: 'P2',
  area: 'area:infra',
  is_duplicate: false,
  tldr: 'Unable to parse issue',
};

export function buildTriagePrompt(title: string, body: string): string {
  return [
    '<issue_title>' + title + '</issue_title>',
    '',
    '<issue_body>' + body + '</issue_body>',
  ].join('\n');
}

export function parseTriageResponse(text: string): TriageResponse {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const jsonText = codeBlockMatch ? codeBlockMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonText);
    const result: TriageResponse = {
      type: parsed.type ?? FALLBACK.type,
      priority: parsed.priority ?? FALLBACK.priority,
      area: parsed.area ?? FALLBACK.area,
      is_duplicate: parsed.is_duplicate ?? FALLBACK.is_duplicate,
      tldr: parsed.tldr ?? FALLBACK.tldr,
    };

    if (!validateLabels(result)) {
      return { ...FALLBACK };
    }

    return result;
  } catch {
    return { ...FALLBACK };
  }
}

export function validateLabels(parsed: TriageResponse): boolean {
  if (!(parsed.type in LABELS.type)) return false;
  if (!(parsed.priority in LABELS.priority)) return false;
  if (!(parsed.area in LABELS.area)) return false;
  return true;
}
