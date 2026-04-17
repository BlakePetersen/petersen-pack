// ABOUTME: Tests for generateStaticParams on the dynamic component route.
// ABOUTME: Verifies that all 15 registered components produce buildable static params.

import { getAllComponents } from '@/lib/component-registry'

// Pull the named export directly from the route module to exercise what Next will call at build time.
// The route file lives at src/app/components/[tier]/[component]/page.tsx.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { generateStaticParams } from '@/app/components/[tier]/[component]/page'

describe('component dynamic route generateStaticParams', () => {
  it('returns exactly 15 entries (one per registered component)', () => {
    const params = generateStaticParams()
    expect(params).toHaveLength(15)
    expect(params).toHaveLength(getAllComponents().length)
  })

  it('covers every registered component by tier/slug', () => {
    const params = generateStaticParams()
    const expected = getAllComponents().map((c) => ({ tier: c.tier, component: c.slug }))

    expected.forEach((pair) => {
      expect(params).toContainEqual(pair)
    })
  })

  it('every entry has a valid tier and non-empty slug', () => {
    const params = generateStaticParams()
    const validTiers = ['atoms', 'molecules', 'organisms']
    params.forEach((p) => {
      expect(validTiers).toContain(p.tier)
      expect(typeof p.component).toBe('string')
      expect(p.component.length).toBeGreaterThan(0)
    })
  })
})
