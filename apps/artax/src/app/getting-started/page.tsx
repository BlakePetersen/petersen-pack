// ABOUTME: Getting Started guide for installing, configuring, and using artax-ui in a Next.js app.
// ABOUTME: Server component that uses artax-ui CodeBlock and Separator for terminal-styled documentation.

import type { Metadata } from 'next'
import Link from 'next/link'
import { CodeBlock, Separator } from 'artax-ui'

export const metadata: Metadata = {
  title: 'Getting Started'
}

const installCommand = `pnpm add artax-ui
# or: npm install artax-ui
# or: yarn add artax-ui`

const setupGlobals = `/* app/globals.css */
@import 'artax-ui/styles/globals.css';
@source '../node_modules/artax-ui/dist/**/*.{js,mjs}';`

const setupProvider = `// app/layout.tsx
import { ThemeProvider } from 'artax-ui'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}`

const usageExample = `// app/page.tsx
import { Button } from 'artax-ui'

export default function Page() {
  return <Button>Run</Button>
}`

const themingExample = `// Toggle light/dark via the data-theme attribute
<html data-theme="dark">…</html>

// Or use the useTheme() hook from artax-ui
import { useTheme } from 'artax-ui'

const { theme, setTheme } = useTheme()`

export default function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Getting Started</h1>
        <p className="text-muted-foreground">
          Install artax-ui, wire up the stylesheet and theme provider, and start
          rendering terminal-styled components.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-mono text-xs text-muted-foreground">
          {'// installation'}
        </h2>
        <p className="text-sm text-foreground">
          artax-ui is distributed as a workspace package. Install it like any
          other dependency:
        </p>
        <CodeBlock filename="terminal" language="bash" rawCode={installCommand}>
          <pre>
            <code>{installCommand}</code>
          </pre>
        </CodeBlock>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="font-mono text-xs text-muted-foreground">
          {'// setup'}
        </h2>
        <p className="text-sm text-foreground">
          Import the global stylesheet and add a Tailwind source directive so
          the artax-ui class names are scanned during build. artax-ui ships a
          Tailwind v4 stylesheet with the design tokens already wired up.
        </p>
        <CodeBlock
          filename="app/globals.css"
          language="css"
          rawCode={setupGlobals}
        >
          <pre>
            <code>{setupGlobals}</code>
          </pre>
        </CodeBlock>
        <p className="text-sm text-foreground">
          Wrap your root layout with the ThemeProvider so light/dark switching
          and the <code className="font-mono text-xs">data-theme</code>{' '}
          attribute work correctly:
        </p>
        <CodeBlock
          filename="app/layout.tsx"
          language="tsx"
          rawCode={setupProvider}
        >
          <pre>
            <code>{setupProvider}</code>
          </pre>
        </CodeBlock>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="font-mono text-xs text-muted-foreground">
          {'// usage'}
        </h2>
        <p className="text-sm text-foreground">
          Import components directly from the package barrel and render them
          like any React component:
        </p>
        <CodeBlock
          filename="app/page.tsx"
          language="tsx"
          rawCode={usageExample}
        >
          <pre>
            <code>{usageExample}</code>
          </pre>
        </CodeBlock>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="font-mono text-xs text-muted-foreground">
          {'// theming'}
        </h2>
        <p className="text-sm text-foreground">
          artax-ui supports light and dark modes via a single{' '}
          <code className="font-mono text-xs">data-theme</code> attribute on the
          root element. The ThemeProvider manages the attribute for you and
          exposes a <code className="font-mono text-xs">useTheme()</code> hook
          for programmatic toggles.
        </p>
        <CodeBlock
          filename="theming.tsx"
          language="tsx"
          rawCode={themingExample}
        >
          <pre>
            <code>{themingExample}</code>
          </pre>
        </CodeBlock>
        <p className="text-sm text-foreground">
          For the full list of color, typography, and spacing tokens, see the{' '}
          <Link href="/tokens" className="text-primary underline">
            Tokens
          </Link>{' '}
          reference.
        </p>
      </section>
    </div>
  )
}
