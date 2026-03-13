// ABOUTME: Label constants and auto-create helper for GitHub issue/PR labels.
// ABOUTME: Defines type, priority, area, and special label dimensions.

import { Octokit } from '@octokit/rest';

interface LabelDef {
  color: string;
  description: string;
}

export const LABELS = {
  type: {
    bug: { color: 'd73a4a', description: 'Something is broken' },
    feature: { color: 'a2eeef', description: 'New feature request' },
    content: { color: '0075ca', description: 'Content improvement' },
  } as Record<string, LabelDef>,

  priority: {
    P1: { color: 'b60205', description: 'Critical priority' },
    P2: { color: 'fbca04', description: 'Medium priority' },
    P3: { color: '0e8a16', description: 'Low priority' },
  } as Record<string, LabelDef>,

  area: {
    'area:content': { color: 'c5def5', description: 'Content pages' },
    'area:ui': { color: 'bfdadc', description: 'UI components' },
    'area:ci': { color: 'f9d0c4', description: 'CI/CD pipeline' },
    'area:design-system': {
      color: 'd4c5f9',
      description: 'Design system (artax-ui)',
    },
    'area:infra': { color: 'e4e669', description: 'Infrastructure' },
  } as Record<string, LabelDef>,

  special: {
    'skip-ai': { color: 'eeeeee', description: 'Skip AI review/triage' },
    'suspected-duplicate': {
      color: 'cfd3d7',
      description: 'Possible duplicate issue',
    },
  } as Record<string, LabelDef>,
} as const;

export async function ensureLabelsExist(
  octokit: Octokit,
  owner: string,
  repo: string,
  labelNames: string[]
): Promise<void> {
  const allLabels: Record<string, LabelDef> = {
    ...LABELS.type,
    ...LABELS.priority,
    ...LABELS.area,
    ...LABELS.special,
  };

  for (const name of labelNames) {
    const def = allLabels[name];
    if (!def) continue;

    try {
      await octokit.rest.issues.createLabel({
        owner,
        repo,
        name,
        color: def.color,
        description: def.description,
      });
    } catch (error: unknown) {
      const status = (error as { status?: number }).status;
      if (status === 422) {
        // Label already exists
        continue;
      }
      throw error;
    }
  }
}
