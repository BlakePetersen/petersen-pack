// ABOUTME: Dependency graph computation from content frontmatter relationships.
// ABOUTME: Builds adjacency, computes dagre layout, and renders terminal-styled SVG.
// theme-static: graph SVG is generated server-side as a string and shipped as an inline image;
// hardcoded fill/stroke values render the same in both light and dark site modes by design.

import dagre from '@dagrejs/dagre'

export type ContentNode = {
  slug: string
  title: string
  category: string
  dependencies: string[]
}

export type GraphData = {
  nodes: Map<string, ContentNode>
  edges: { from: string; to: string }[]
  reverseEdges: Map<string, string[]>
}

export type LayoutNode = {
  slug: string
  title: string
  category: string
  x: number
  y: number
  width: number
  height: number
}

export type LayoutEdge = {
  from: string
  to: string
  points: { x: number; y: number }[]
}

export type LayoutResult = {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  width: number
  height: number
}

/**
 * Build a dependency graph from content items.
 * Edges point from dependent to dependency (A depends on B => edge A->B).
 * Circular dependencies are detected and logged but don't crash.
 */
export function buildGraph(items: ContentNode[]): GraphData {
  const nodes = new Map<string, ContentNode>()
  const edges: { from: string; to: string }[] = []
  const reverseEdges = new Map<string, string[]>()

  for (const item of items) {
    nodes.set(item.slug, item)
  }

  for (const item of items) {
    for (const dep of item.dependencies) {
      if (nodes.has(dep)) {
        edges.push({ from: item.slug, to: dep })

        const existing = reverseEdges.get(dep)
        if (existing) {
          existing.push(item.slug)
        } else {
          reverseEdges.set(dep, [item.slug])
        }
      }
    }
  }

  // Detect cycles via DFS
  const visited = new Set<string>()
  const inStack = new Set<string>()

  function dfs(slug: string): void {
    if (inStack.has(slug)) {
      console.warn(`[graph] Circular dependency detected involving: ${slug}`)
      return
    }
    if (visited.has(slug)) return

    visited.add(slug)
    inStack.add(slug)

    const node = nodes.get(slug)
    if (node) {
      for (const dep of node.dependencies) {
        if (nodes.has(dep)) {
          dfs(dep)
        }
      }
    }

    inStack.delete(slug)
  }

  // Use items array for iteration instead of Map iterator
  for (const item of items) {
    dfs(item.slug)
  }

  return { nodes, edges, reverseEdges }
}

/**
 * Extract a local subgraph containing the target node and its 1-hop neighbors
 * in both directions (dependencies and dependents).
 */
export function getLocalGraph(graph: GraphData, slug: string): GraphData {
  const targetNode = graph.nodes.get(slug)
  if (!targetNode) {
    return { nodes: new Map(), edges: [], reverseEdges: new Map() }
  }

  const localSlugs = new Set<string>()
  localSlugs.add(slug)

  // Add dependencies (nodes this one depends on)
  for (const dep of targetNode.dependencies) {
    if (graph.nodes.has(dep)) {
      localSlugs.add(dep)
    }
  }

  // Add dependents (nodes that depend on this one)
  const dependents = graph.reverseEdges.get(slug) || []
  for (const dep of dependents) {
    localSlugs.add(dep)
  }

  // Build subgraph using forEach for Map iteration compatibility
  const nodes = new Map<string, ContentNode>()
  localSlugs.forEach((s) => {
    const node = graph.nodes.get(s)
    if (node) nodes.set(s, node)
  })

  const edges = graph.edges.filter(
    (e) => localSlugs.has(e.from) && localSlugs.has(e.to),
  )

  const reverseEdges = new Map<string, string[]>()
  graph.reverseEdges.forEach((values, key) => {
    if (localSlugs.has(key)) {
      const filtered = values.filter((v) => localSlugs.has(v))
      if (filtered.length > 0) {
        reverseEdges.set(key, filtered)
      }
    }
  })

  return { nodes, edges, reverseEdges }
}

/**
 * Compute node positions using dagre layout engine with top-down direction.
 */
export function computeLayout(graph: GraphData): LayoutResult {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 60 })
  g.setDefaultEdgeLabel(() => ({}))

  graph.nodes.forEach((node, slug) => {
    g.setNode(slug, {
      label: node.title,
      width: 200,
      height: 40,
      slug: node.slug,
      title: node.title,
      category: node.category,
    })
  })

  for (const edge of graph.edges) {
    g.setEdge(edge.from, edge.to)
  }

  dagre.layout(g)

  const nodes: LayoutNode[] = []
  for (const slug of g.nodes()) {
    const n = g.node(slug)
    if (n) {
      nodes.push({
        slug,
        title: n.title || n.label || slug,
        category: n.category || 'uncategorized',
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
      })
    }
  }

  const edges: LayoutEdge[] = []
  for (const e of g.edges()) {
    const edgeData = g.edge(e)
    if (edgeData) {
      edges.push({
        from: e.v,
        to: e.w,
        points: edgeData.points || [],
      })
    }
  }

  const graphLabel = g.graph()
  const width = graphLabel?.width ?? 0
  const height = graphLabel?.height ?? 0

  return { nodes, edges, width, height }
}

/**
 * Render a dependency graph layout as an SVG string with terminal styling.
 */
export function renderGraphSvg(
  layout: LayoutResult,
  options?: { currentSlug?: string; basePath?: string },
): string {
  const padding = 40
  const viewWidth = layout.width + padding * 2
  const viewHeight = layout.height + padding * 2
  const basePath = options?.basePath ?? ''
  const currentSlug = options?.currentSlug

  const parts: string[] = []

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${viewWidth} ${viewHeight}" width="${viewWidth}" height="${viewHeight}" style="font-family: monospace;">`,
  )

  // Section label
  parts.push(
    `<text x="${padding}" y="${padding - 10}" fill="#71717a" font-size="12" font-family="monospace">// dependency_graph</text>`,
  )

  // Render edges first (behind nodes)
  for (const edge of layout.edges) {
    if (edge.points.length > 0) {
      const pathData = edge.points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x + padding} ${p.y + padding}`)
        .join(' ')
      parts.push(
        `<path d="${pathData}" fill="none" stroke="#F59E0B" stroke-width="1.5" />`,
      )
    }
  }

  // Render nodes
  for (const node of layout.nodes) {
    const isCurrent = currentSlug === node.slug
    const fill = isCurrent ? '#262626' : '#1a1a1a'
    const titleText = isCurrent ? `&gt; ${node.title}` : node.title
    const href = basePath ? `${basePath}/${node.slug}` : `/${node.slug}`

    const nx = node.x - node.width / 2 + padding
    const ny = node.y - node.height / 2 + padding

    parts.push(`<a xlink:href="${href}">`)
    parts.push(
      `<rect x="${nx}" y="${ny}" width="${node.width}" height="${node.height}" fill="${fill}" stroke="#27272a" stroke-width="1" rx="2" />`,
    )
    // Title text
    parts.push(
      `<text x="${nx + 8}" y="${ny + 16}" fill="#e4e4e7" font-size="11" font-family="monospace">${titleText}</text>`,
    )
    // Category badge
    parts.push(
      `<text x="${nx + 8}" y="${ny + 30}" fill="#71717a" font-size="9" font-family="monospace">[${node.category}]</text>`,
    )
    parts.push('</a>')
  }

  parts.push('</svg>')

  return parts.join('\n')
}
