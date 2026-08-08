// ABOUTME: Unit tests for dependency graph computation, layout, and SVG rendering.
// ABOUTME: Covers adjacency building, local subgraphs, dagre layout, and terminal-styled SVG output.

import {
  buildGraph,
  getLocalGraph,
  computeLayout,
  renderGraphSvg
} from '@/lib/graph'
import type { ContentNode } from '@/lib/graph'

const testNodes: ContentNode[] = [
  {
    slug: 'configs/eslint',
    title: 'ESLint Config',
    category: 'configs',
    dependencies: []
  },
  {
    slug: 'hooks/use-lint',
    title: 'useLint Hook',
    category: 'hooks',
    dependencies: ['configs/eslint']
  },
  {
    slug: 'skills/linting',
    title: 'Linting Skill',
    category: 'skills',
    dependencies: ['configs/eslint', 'hooks/use-lint']
  }
]

const circularNodes: ContentNode[] = [
  {
    slug: 'configs/a',
    title: 'Config A',
    category: 'configs',
    dependencies: ['configs/b']
  },
  {
    slug: 'configs/b',
    title: 'Config B',
    category: 'configs',
    dependencies: ['configs/a']
  }
]

describe('buildGraph', () => {
  it('builds adjacency list from content items with dependencies', () => {
    const graph = buildGraph(testNodes)

    expect(graph.nodes.size).toBe(3)
    expect(graph.edges).toHaveLength(3)
    expect(graph.edges).toContainEqual({
      from: 'hooks/use-lint',
      to: 'configs/eslint'
    })
    expect(graph.edges).toContainEqual({
      from: 'skills/linting',
      to: 'configs/eslint'
    })
    expect(graph.edges).toContainEqual({
      from: 'skills/linting',
      to: 'hooks/use-lint'
    })
  })

  it('computes reverse edges (required_by) automatically', () => {
    const graph = buildGraph(testNodes)

    expect(graph.reverseEdges.get('configs/eslint')).toEqual(
      expect.arrayContaining(['hooks/use-lint', 'skills/linting'])
    )
    expect(graph.reverseEdges.get('hooks/use-lint')).toEqual(
      expect.arrayContaining(['skills/linting'])
    )
  })

  it('handles empty dependencies gracefully', () => {
    const graph = buildGraph([
      {
        slug: 'configs/solo',
        title: 'Solo',
        category: 'configs',
        dependencies: []
      }
    ])

    expect(graph.nodes.size).toBe(1)
    expect(graph.edges).toHaveLength(0)
    expect(graph.reverseEdges.get('configs/solo')).toBeUndefined()
  })

  it('handles circular dependencies without crashing', () => {
    expect(() => buildGraph(circularNodes)).not.toThrow()
    const graph = buildGraph(circularNodes)

    expect(graph.edges).toHaveLength(2)
    expect(graph.nodes.size).toBe(2)
  })
})

describe('getLocalGraph', () => {
  it('returns 1-hop neighbors in both directions for a given slug', () => {
    const graph = buildGraph(testNodes)
    const local = getLocalGraph(graph, 'hooks/use-lint')

    // Should include: self, configs/eslint (dependency), skills/linting (dependent)
    expect(local.nodes.size).toBe(3)
    expect(local.nodes.has('hooks/use-lint')).toBe(true)
    expect(local.nodes.has('configs/eslint')).toBe(true)
    expect(local.nodes.has('skills/linting')).toBe(true)
  })

  it('includes the current node itself', () => {
    const graph = buildGraph(testNodes)
    const local = getLocalGraph(graph, 'configs/eslint')

    expect(local.nodes.has('configs/eslint')).toBe(true)
  })

  it('returns empty graph for content with no dependencies and no dependents', () => {
    const graph = buildGraph([
      {
        slug: 'configs/solo',
        title: 'Solo',
        category: 'configs',
        dependencies: []
      }
    ])
    const local = getLocalGraph(graph, 'configs/solo')

    expect(local.nodes.size).toBe(1)
    expect(local.edges).toHaveLength(0)
  })
})

describe('computeLayout', () => {
  it('returns node positions with x, y coordinates for all nodes', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)

    expect(layout.nodes).toHaveLength(3)
    for (const node of layout.nodes) {
      expect(typeof node.x).toBe('number')
      expect(typeof node.y).toBe('number')
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeGreaterThanOrEqual(0)
    }
  })

  it('returns edge data connecting nodes', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)

    expect(layout.edges).toHaveLength(3)
    for (const edge of layout.edges) {
      expect(edge.points.length).toBeGreaterThan(0)
      for (const point of edge.points) {
        expect(typeof point.x).toBe('number')
        expect(typeof point.y).toBe('number')
      }
    }
  })

  it('produces valid width and height dimensions', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)

    expect(layout.width).toBeGreaterThan(0)
    expect(layout.height).toBeGreaterThan(0)
  })
})

describe('renderGraphSvg', () => {
  it('produces valid SVG string with viewBox matching graph dimensions', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout)

    expect(svg).toContain('<svg')
    expect(svg).toContain('viewBox=')
    expect(svg).toContain('</svg>')
  })

  it('each node contains the content title text', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout)

    expect(svg).toContain('ESLint Config')
    expect(svg).toContain('useLint Hook')
    expect(svg).toContain('Linting Skill')
  })

  it('each node contains a category badge', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout)

    expect(svg).toContain('[configs]')
    expect(svg).toContain('[hooks]')
    expect(svg).toContain('[skills]')
  })

  it('nodes are wrapped in anchor tags (clickable links)', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout, { basePath: '/dx' })

    expect(svg).toContain('<a ')
    expect(svg).toContain('/dx/configs/eslint')
    expect(svg).toContain('/dx/hooks/use-lint')
  })

  it('current page node has > prefix', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout, { currentSlug: 'configs/eslint' })

    expect(svg).toContain('&gt; ESLint Config')
  })

  it('edges are amber-colored', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout)

    expect(svg).toContain('#F59E0B')
  })

  it('node fills are grayscale', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout)

    expect(svg).toContain('#1a1a1a')
  })

  it('uses monospace font', () => {
    const graph = buildGraph(testNodes)
    const layout = computeLayout(graph)
    const svg = renderGraphSvg(layout)

    expect(svg).toContain('monospace')
  })
})
