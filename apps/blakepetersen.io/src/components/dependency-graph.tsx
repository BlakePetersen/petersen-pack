// ABOUTME: Server component that renders a pre-built SVG dependency graph.
// ABOUTME: Displays content prerequisite relationships with terminal-styled labels.

type DependencyGraphProps = {
  svgContent: string
  label?: string
}

export function DependencyGraph({
  svgContent,
  label = 'dependency_graph'
}: DependencyGraphProps) {
  return (
    <section className="mt-8">
      <h3 className="mb-4 font-mono text-sm text-muted-foreground">
        {'// '}
        {label}
      </h3>
      <div
        className="overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </section>
  )
}
