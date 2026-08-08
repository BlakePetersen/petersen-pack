// ABOUTME: Set-based parity guard between the artax-ui barrel and the showcase registry.
// ABOUTME: Fails if any tier's documented slugs drift from the barrel's source folder names.

import { getBarrelComponentSlugs } from '@/lib/component-counts'
import { getComponentsByTier } from '@/lib/component-registry'

for (const tier of ['atoms', 'molecules', 'organisms'] as const) {
  it(`${tier}: registry slugs equal barrel folder names`, () => {
    const registrySlugs = new Set(getComponentsByTier(tier).map(c => c.slug))
    expect(registrySlugs).toEqual(getBarrelComponentSlugs()[tier])
  })
}
