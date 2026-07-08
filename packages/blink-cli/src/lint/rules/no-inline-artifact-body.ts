// ABOUTME: LINT-06 — forbids direct <ArtifactBody> invocation in MDX bodies.
// ABOUTME: The install route is the sole render path (Variant 3); inline use silently renders nothing.

import type { LintDiagnostic, LintRule, LintContext } from '@/lint/types'

const INLINE_ARTIFACT_BODY_PATTERN = /<ArtifactBody[\s/>]/

export const noInlineArtifactBodyRule: LintRule = {
  name: 'no-inline-artifact-body',

  check(ctx: LintContext): LintDiagnostic[] {
    if (!INLINE_ARTIFACT_BODY_PATTERN.test(ctx.body)) return []

    return [
      {
        file: ctx.file,
        severity: 'error',
        rule: 'no-inline-artifact-body',
        message:
          '<ArtifactBody> is not registered in mdxComponents and renders nothing from MDX — link to the /install route instead',
      },
    ]
  },
}
