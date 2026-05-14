// ABOUTME: MDX component that renders artifact code from Velite build output.
// ABOUTME: Supports single-file (CodeBlock) and multi-file (Tabs + CodeBlock) artifacts.

'use client'

import { createContext, useContext } from 'react'
import { CodeBlock, Tabs, TabsList, TabsTrigger, TabsContent } from 'artax-ui'

interface ArtifactData {
  slug: string
  name: string
  type: string
  files: Array<{ path: string; content: string }>
}

const ArtifactMapContext = createContext<Map<string, ArtifactData>>(new Map())

export function ArtifactDataProvider({
  artifacts,
  children,
}: {
  artifacts: ArtifactData[]
  children: React.ReactNode
}) {
  const map = new Map(artifacts.map((a) => [a.slug, a]))
  return <ArtifactMapContext.Provider value={map}>{children}</ArtifactMapContext.Provider>
}

const EXTENSION_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.css': 'css',
  '.sh': 'bash',
  '.toml': 'toml',
}

export function inferLanguage(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) return 'text'
  const ext = filename.slice(dotIndex)
  return EXTENSION_MAP[ext] ?? ext.slice(1)
}

export function ArtifactBody({ slug }: { slug: string }) {
  const artifactMap = useContext(ArtifactMapContext)
  const artifact = artifactMap.get(slug)

  if (!artifact) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        `ArtifactBody: artifact "${slug}" not found. Ensure the artifact exists and data is provided via ArtifactDataProvider.`,
      )
    }
    return (
      <div className="rounded border border-destructive p-4 text-sm text-destructive">
        Artifact &quot;{slug}&quot; not found. Run <code>pnpm velite</code> to rebuild.
      </div>
    )
  }

  const { files } = artifact

  if (files.length === 1) {
    const file = files[0]
    return (
      <CodeBlock filename={file.path} language={inferLanguage(file.path)} rawCode={file.content}>
        <pre className="overflow-x-auto p-4 m-0">
          <code>{file.content}</code>
        </pre>
      </CodeBlock>
    )
  }

  return (
    <Tabs defaultValue={files[0].path}>
      <TabsList>
        {files.map((file) => (
          <TabsTrigger key={file.path} value={file.path}>
            {file.path}
          </TabsTrigger>
        ))}
      </TabsList>
      {files.map((file) => (
        <TabsContent key={file.path} value={file.path}>
          <CodeBlock filename={file.path} language={inferLanguage(file.path)} rawCode={file.content}>
            <pre>
              <code>{file.content}</code>
            </pre>
          </CodeBlock>
        </TabsContent>
      ))}
    </Tabs>
  )
}
