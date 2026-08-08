// ABOUTME: Topological dependency resolution using Kahn's algorithm.
// ABOUTME: Sorts artifacts by dependency order and detects missing or circular dependencies.

export function topologicalSort(nodes: Map<string, string[]>): string[] {
  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()

  for (const [slug, deps] of nodes) {
    if (!inDegree.has(slug)) inDegree.set(slug, 0)
    if (!adjList.has(slug)) adjList.set(slug, [])

    for (const dep of deps) {
      if (!inDegree.has(dep)) inDegree.set(dep, 0)
      if (!adjList.has(dep)) adjList.set(dep, [])

      inDegree.set(slug, (inDegree.get(slug) || 0) + 1)
      adjList.get(dep)!.push(slug)
    }
  }

  const queue = [...inDegree.entries()]
    .filter(([, d]) => d === 0)
    .map(([s]) => s)
  const result: string[] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)

    for (const neighbor of adjList.get(node) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) queue.push(neighbor)
    }
  }

  if (result.length !== inDegree.size) {
    throw new Error('Circular dependency detected')
  }

  return result
}

export function findMissingDeps(
  artifactDeps: string[],
  installedSlugs: string[]
): string[] {
  return artifactDeps.filter(dep => !installedSlugs.includes(dep))
}
