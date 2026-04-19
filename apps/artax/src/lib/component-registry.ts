// ABOUTME: Registry types, navigation data, and component definitions for the catalog.
// ABOUTME: Provides lookup functions, sidebar section structure, and preview renderers for all 15 artax-ui components.

import { createElement, type ReactNode } from 'react'
import {
  Button,
  Input,
  Badge,
  Separator,
  CopyButton,
  Toggle,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Callout,
  CodeBlock,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from 'artax-ui'

export interface PropDef {
  name: string
  type: string
  default: string
  description: string
}

export interface CodeExample {
  label: string
  code: string
}

export interface ComponentDef {
  name: string
  slug: string
  tier: 'atoms' | 'molecules' | 'organisms'
  description: string
  imports: string
  props: PropDef[]
  variants?: string[]
  codeExamples: CodeExample[]
  a11y: string[]
  preview: (variant?: string) => ReactNode
  playground?: {
    enabled: boolean
    defaultExampleIndex?: number
  }
}

// Short helper to keep the registry data dense and readable.
const h = createElement

const components: ComponentDef[] = [
  // ─────────────────────────────────────────────────────────── Atoms ──
  {
    name: 'Button',
    slug: 'button',
    tier: 'atoms',
    description:
      'Terminal-styled action trigger with $ command prefix on the default variant and [bracket] ghost variant.',
    imports: "import { Button } from 'artax-ui'",
    props: [
      {
        name: 'variant',
        type: "'default' | 'outline' | 'ghost'",
        default: "'default'",
        description: 'Visual style variant.',
      },
      {
        name: 'size',
        type: "'default' | 'sm' | 'lg'",
        default: "'default'",
        description: 'Button size.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the button and reduces opacity.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn().',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '-',
        description: 'Button label content.',
      },
    ],
    variants: ['default', 'outline', 'ghost'],
    codeExamples: [
      { label: 'Basic', code: '<Button>Run</Button>' },
      {
        label: 'Variants',
        code: '<Button variant="default">Run</Button>\n<Button variant="outline">Run</Button>\n<Button variant="ghost">Run</Button>',
      },
      {
        label: 'Sizes',
        code: '<Button size="sm">Small</Button>\n<Button size="default">Default</Button>\n<Button size="lg">Large</Button>',
      },
    ],
    a11y: [
      'Renders a native <button> element with full keyboard support.',
      'Tab moves focus; Enter and Space activate the button.',
      'Focus ring uses the amber accent ring for high-contrast visibility.',
      'disabled removes pointer events and reduces opacity but retains the role.',
    ],
    preview: (variant) =>
      h(
        Button,
        { variant: (variant as 'default' | 'outline' | 'ghost') ?? 'default' },
        'Run',
      ),
    playground: { enabled: true },
  },
  {
    name: 'Input',
    slug: 'input',
    tier: 'atoms',
    description:
      'Monospace text input with terminal border, amber focus ring, and placeholder styling.',
    imports: "import { Input } from 'artax-ui'",
    props: [
      {
        name: 'type',
        type: "'text' | 'email' | 'password' | 'number' | 'search' | ...",
        default: "'text'",
        description: 'Any native HTML input type.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: '-',
        description: 'Placeholder text rendered in muted color.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the input with reduced opacity.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn().',
      },
    ],
    codeExamples: [
      { label: 'Basic', code: '<Input placeholder="username" />' },
      {
        label: 'Variants',
        code: '<Input type="text" placeholder="username" />\n<Input type="password" placeholder="password" />\n<Input disabled placeholder="disabled" />',
      },
    ],
    a11y: [
      'Uses a native <input> element, so it supports all native form semantics.',
      'Focus ring uses the amber accent ring for high-contrast visibility.',
      'Associate with a <label htmlFor> or aria-label for assistive-tech access.',
      'Disabled state sets cursor-not-allowed and reduces opacity.',
    ],
    preview: () => h(Input, { placeholder: 'username', className: 'max-w-xs' }),
    playground: { enabled: true },
  },
  {
    name: 'Badge',
    slug: 'badge',
    tier: 'atoms',
    description:
      'Compact inline label for metadata, counts, and status indicators.',
    imports: "import { Badge } from 'artax-ui'",
    props: [
      {
        name: 'variant',
        type: "'default' | 'outline' | 'secondary'",
        default: "'default'",
        description: 'Visual style variant.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn().',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '-',
        description: 'Badge label content.',
      },
    ],
    variants: ['default', 'outline', 'secondary'],
    codeExamples: [
      { label: 'Basic', code: '<Badge>NEW</Badge>' },
      {
        label: 'Variants',
        code: '<Badge variant="default">default</Badge>\n<Badge variant="outline">outline</Badge>\n<Badge variant="secondary">secondary</Badge>',
      },
    ],
    a11y: [
      'Renders as a <span>, so it does not interrupt the tab order.',
      'Decorative by default; wrap with aria-label on the parent if it conveys status.',
      'Pair with role="status" on a live region when the badge reflects dynamic state.',
    ],
    preview: (variant) =>
      h(
        Badge,
        { variant: (variant as 'default' | 'outline' | 'secondary') ?? 'default' },
        'NEW',
      ),
    playground: { enabled: true },
  },
  {
    name: 'Separator',
    slug: 'separator',
    tier: 'atoms',
    description:
      'Horizontal or vertical rule used to divide sections with the terminal border color.',
    imports: "import { Separator } from 'artax-ui'",
    props: [
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: 'Axis along which the separator is drawn.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn().',
      },
    ],
    codeExamples: [
      { label: 'Basic', code: '<Separator />' },
      {
        label: 'Variants',
        code: '<Separator orientation="horizontal" />\n<Separator orientation="vertical" className="h-4" />',
      },
    ],
    a11y: [
      'Renders a div with role="separator" and aria-orientation set correctly.',
      'Not focusable; purely presentational but announced as a divider by screen readers.',
    ],
    preview: () =>
      h(
        'div',
        { className: 'w-full max-w-sm space-y-2' },
        h('p', { className: 'font-mono text-xs text-muted-foreground' }, 'above'),
        h(Separator, null),
        h('p', { className: 'font-mono text-xs text-muted-foreground' }, 'below'),
      ),
    playground: { enabled: true },
  },
  {
    name: 'CopyButton',
    slug: 'copy-button',
    tier: 'atoms',
    description:
      'Client-side clipboard trigger that briefly flips to a checkmark after copying.',
    imports: "import { CopyButton } from 'artax-ui'",
    props: [
      {
        name: 'text',
        type: 'string',
        default: '-',
        description: 'Text copied to the clipboard when the button is pressed.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn().',
      },
    ],
    codeExamples: [
      { label: 'Basic', code: '<CopyButton text="echo hello" />' },
      {
        label: 'Variants',
        code: '<CopyButton text="short" />\n<CopyButton text={longSnippet} className="text-primary" />',
      },
    ],
    a11y: [
      'Renders a native <button> with aria-label="Copy code".',
      'Uses the async Clipboard API; requires a user-gesture to succeed in browsers.',
      'State revert after 2s is purely visual; announce copy success with a live region if needed.',
    ],
    preview: () => h(CopyButton, { text: 'echo "hello, artax"' }),
    playground: { enabled: true },
  },
  {
    name: 'Toggle',
    slug: 'toggle',
    tier: 'atoms',
    description:
      'Two-state pressed/unpressed button backed by the Radix Toggle primitive.',
    imports: "import { Toggle } from 'artax-ui'",
    props: [
      {
        name: 'pressed',
        type: 'boolean',
        default: 'false',
        description: 'Controlled pressed state.',
      },
      {
        name: 'defaultPressed',
        type: 'boolean',
        default: 'false',
        description: 'Uncontrolled initial pressed state.',
      },
      {
        name: 'onPressedChange',
        type: '(pressed: boolean) => void',
        default: '-',
        description: 'Called when the pressed state changes.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the toggle.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn().',
      },
    ],
    variants: ['default', 'pressed'],
    codeExamples: [
      { label: 'Basic', code: '<Toggle aria-label="bold">B</Toggle>' },
      {
        label: 'Variants',
        code: '<Toggle defaultPressed={false} aria-label="bold">B</Toggle>\n<Toggle defaultPressed aria-label="italic">I</Toggle>',
      },
    ],
    a11y: [
      'Built on Radix Toggle; exposes role="button" with aria-pressed.',
      'Space and Enter toggle the state; keyboard focus ring is visible.',
      'Always provide an aria-label when the child content is an icon or glyph.',
    ],
    preview: (variant) =>
      h(
        Toggle,
        {
          'aria-label': 'bold',
          defaultPressed: variant === 'pressed',
        },
        'B',
      ),
    playground: { enabled: true },
  },
  // ─────────────────────────────────────────────────────── Molecules ──
  {
    name: 'Card',
    slug: 'card',
    tier: 'molecules',
    description:
      'Surface container for grouping related content with terminal-style header, title, description, content, and footer slots.',
    imports:
      "import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'artax-ui'",
    props: [
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn() on the root <div>.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '-',
        description: 'Typically CardHeader, CardContent, and CardFooter.',
      },
    ],
    codeExamples: [
      { label: 'Basic', code: '<Card>\n  <CardContent>Simple card body.</CardContent>\n</Card>' },
      {
        label: 'Composition',
        code: `<Card>
  <CardHeader>
    <CardTitle>session</CardTitle>
    <CardDescription>ssh user@artax</CardDescription>
  </CardHeader>
  <CardContent>Last login at 14:22</CardContent>
  <CardFooter>connected</CardFooter>
</Card>`,
      },
    ],
    a11y: [
      'Composed of semantic <div> elements; add a landmark role (e.g. region) when meaningful.',
      'CardTitle renders terminal-style text with a // prefix; pair with heading levels if the card is a true section.',
    ],
    preview: () =>
      h(
        Card,
        { className: 'w-72' },
        h(
          CardHeader,
          null,
          h(CardTitle, null, 'session'),
          h(CardDescription, null, 'ssh user@artax'),
        ),
        h(CardContent, null, 'Last login at 14:22'),
        h(
          CardFooter,
          { className: 'font-mono text-xs text-muted-foreground' },
          'connected',
        ),
      ),
    playground: { enabled: true },
  },
  {
    name: 'Table',
    slug: 'table',
    tier: 'molecules',
    description:
      'Monospace data table with box-drawing borders and hover row highlighting.',
    imports:
      "import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from 'artax-ui'",
    props: [
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn() on the root <table>.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '-',
        description: 'Composed sub-components (TableHeader, TableBody, TableRow, etc.).',
      },
    ],
    codeExamples: [
      {
        label: 'Basic',
        code: `<Table>
  <TableBody>
    <TableRow>
      <TableCell>build</TableCell>
      <TableCell>ok</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
      {
        label: 'Composition',
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>stage</TableHead>
      <TableHead>status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>lint</TableCell>
      <TableCell>ok</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>test</TableCell>
      <TableCell>ok</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    ],
    a11y: [
      'Renders native <table> / <thead> / <tbody> / <tr> / <th> / <td>; screen readers announce row/column headers.',
      'Use <TableHead> inside <TableHeader> so the <th> elements have scope="col" by convention.',
      'Wrap dense tables in a scroll container that keeps the header visible when needed.',
    ],
    preview: () =>
      h(
        Table,
        { className: 'max-w-sm' },
        h(
          TableHeader,
          null,
          h(
            TableRow,
            null,
            h(TableHead, null, 'stage'),
            h(TableHead, null, 'status'),
          ),
        ),
        h(
          TableBody,
          null,
          h(
            TableRow,
            null,
            h(TableCell, null, 'lint'),
            h(TableCell, null, 'ok'),
          ),
          h(
            TableRow,
            null,
            h(TableCell, null, 'test'),
            h(TableCell, null, 'ok'),
          ),
        ),
      ),
    playground: { enabled: true },
  },
  {
    name: 'Callout',
    slug: 'callout',
    tier: 'molecules',
    description:
      'Admonition block with a colored left border accent for info, warning, error, and success messages.',
    imports: "import { Callout } from 'artax-ui'",
    props: [
      {
        name: 'variant',
        type: "'info' | 'warning' | 'error' | 'success'",
        default: "'info'",
        description: 'Semantic variant that sets the left border accent color.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn().',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '-',
        description: 'Callout body content.',
      },
    ],
    variants: ['info', 'warning', 'error', 'success'],
    codeExamples: [
      {
        label: 'Basic',
        code: '<Callout>Shells close automatically after 15 minutes of inactivity.</Callout>',
      },
      {
        label: 'Variants',
        code: `<Callout variant="info">Informational message.</Callout>
<Callout variant="warning">Approach with care.</Callout>
<Callout variant="error">Something went wrong.</Callout>
<Callout variant="success">Deploy complete.</Callout>`,
      },
      {
        label: 'Composition',
        code: `<Callout variant="warning">
  <strong className="font-mono">warning:</strong>
  Writes outside the sandbox require confirmation.
</Callout>`,
      },
    ],
    a11y: [
      'Rendered as a plain <div>; add role="note" or role="status" when the callout conveys semantic meaning.',
      'Color alone distinguishes variants — always pair with a text prefix (e.g. "warning:") for users who cannot perceive the accent.',
    ],
    preview: (variant) =>
      h(
        Callout,
        {
          variant: (variant as 'info' | 'warning' | 'error' | 'success') ?? 'info',
          className: 'max-w-md',
        },
        'Shells close automatically after 15 minutes of inactivity.',
      ),
    playground: { enabled: true },
  },
  {
    name: 'CodeBlock',
    slug: 'code-block',
    tier: 'molecules',
    description:
      'Terminal-chrome container for syntax-highlighted code with filename, language badge, and built-in copy button.',
    imports: "import { CodeBlock } from 'artax-ui'",
    props: [
      {
        name: 'filename',
        type: 'string',
        default: '-',
        description: 'Optional filename shown in the header with a // prefix.',
      },
      {
        name: 'language',
        type: 'string',
        default: '-',
        description: 'Optional language label shown as a small pill in the header.',
      },
      {
        name: 'rawCode',
        type: 'string',
        default: '-',
        description: 'Raw code copied to the clipboard when the copy button is pressed.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn() on the root.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '-',
        description: 'Highlighted <pre><code> output (typically from Shiki).',
      },
    ],
    codeExamples: [
      {
        label: 'Basic',
        code: `<CodeBlock rawCode="pnpm install">
  <pre><code>pnpm install</code></pre>
</CodeBlock>`,
      },
      {
        label: 'Composition',
        code: `<CodeBlock
  filename="artax.config.ts"
  language="ts"
  rawCode={configSource}
>
  {highlightedNodes}
</CodeBlock>`,
      },
    ],
    a11y: [
      'The copy button exposes aria-label="Copy code" via the underlying CopyButton.',
      'Wrap highlighted output in <pre><code>; screen readers announce the code region correctly.',
      'Language pill is decorative — convey language elsewhere if critical.',
    ],
    preview: () =>
      h(
        CodeBlock,
        {
          filename: 'install.sh',
          language: 'bash',
          rawCode: 'pnpm install\npnpm -F artax build',
          className: 'max-w-lg my-0',
        },
        h(
          'pre',
          null,
          h('code', null, 'pnpm install\npnpm -F artax build'),
        ),
      ),
    playground: { enabled: true },
  },
  {
    name: 'Tabs',
    slug: 'tabs',
    tier: 'molecules',
    description:
      'Horizontal tab group backed by the Radix Tabs primitive with a terminal-style active indicator.',
    imports:
      "import { Tabs, TabsList, TabsTrigger, TabsContent } from 'artax-ui'",
    props: [
      {
        name: 'defaultValue',
        type: 'string',
        default: '-',
        description: 'Uncontrolled initial tab value.',
      },
      {
        name: 'value',
        type: 'string',
        default: '-',
        description: 'Controlled active tab value.',
      },
      {
        name: 'onValueChange',
        type: '(value: string) => void',
        default: '-',
        description: 'Called when the active tab changes.',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn() on the root.',
      },
    ],
    codeExamples: [
      {
        label: 'Basic',
        code: `<Tabs defaultValue="code">
  <TabsList>
    <TabsTrigger value="code">code</TabsTrigger>
    <TabsTrigger value="props">props</TabsTrigger>
  </TabsList>
  <TabsContent value="code">…</TabsContent>
  <TabsContent value="props">…</TabsContent>
</Tabs>`,
      },
      {
        label: 'Composition',
        code: `<Tabs defaultValue="code">
  <TabsList>
    <TabsTrigger value="code">code</TabsTrigger>
    <TabsTrigger value="props">props</TabsTrigger>
    <TabsTrigger value="a11y">a11y</TabsTrigger>
  </TabsList>
  <TabsContent value="code"><CodeExamples /></TabsContent>
  <TabsContent value="props"><PropsTable /></TabsContent>
  <TabsContent value="a11y"><A11yNotes /></TabsContent>
</Tabs>`,
      },
    ],
    a11y: [
      'Built on Radix Tabs; triggers expose role="tab", content exposes role="tabpanel", list exposes role="tablist".',
      'ArrowLeft/ArrowRight cycle focus between tabs; Home/End jump to first/last.',
      'Active tab is indicated by aria-selected and a visible amber underline.',
    ],
    preview: () =>
      h(
        Tabs,
        { defaultValue: 'code', className: 'w-full max-w-md' },
        h(
          TabsList,
          null,
          h(TabsTrigger, { value: 'code' }, 'code'),
          h(TabsTrigger, { value: 'props' }, 'props'),
        ),
        h(TabsContent, { value: 'code' }, 'Code examples live here.'),
        h(TabsContent, { value: 'props' }, 'Props reference lives here.'),
      ),
    playground: { enabled: true },
  },
  {
    name: 'Tooltip',
    slug: 'tooltip',
    tier: 'molecules',
    description:
      'Hover/focus-triggered helper text backed by the Radix Tooltip primitive; must be wrapped in a TooltipProvider.',
    imports:
      "import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from 'artax-ui'",
    props: [
      {
        name: 'side',
        type: "'top' | 'right' | 'bottom' | 'left'",
        default: "'top'",
        description: 'Placement of the tooltip relative to the trigger (TooltipContent).',
      },
      {
        name: 'sideOffset',
        type: 'number',
        default: '4',
        description: 'Distance in pixels from the trigger (TooltipContent).',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn() on TooltipContent.',
      },
    ],
    codeExamples: [
      {
        label: 'Basic',
        code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button>hover me</button>
    </TooltipTrigger>
    <TooltipContent>tip</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
      },
      {
        label: 'Composition',
        code: `<TooltipProvider delayDuration={150}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost">?</Button>
    </TooltipTrigger>
    <TooltipContent side="right">
      Press ⌘K to open the palette
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
      },
    ],
    a11y: [
      'Radix Tooltip exposes role="tooltip" and associates it with the trigger via aria-describedby.',
      'Shows on hover and on keyboard focus; dismisses on blur and on Escape.',
      'Provide a real accessible label on the trigger — tooltip text is supplementary, not primary.',
    ],
    preview: () =>
      h(TooltipProvider, {
        delayDuration: 100,
        children: h(Tooltip, {
          open: true,
          children: [
            h(
              TooltipTrigger,
              { asChild: true, key: 'trigger' },
              h(Button, { variant: 'outline' }, 'hover'),
            ),
            h(
              TooltipContent,
              { side: 'right', key: 'content' },
              'keyboard shortcut: ⌘K',
            ),
          ],
        }),
      }),
  },
  // ─────────────────────────────────────────────────────── Organisms ──
  {
    name: 'Accordion',
    slug: 'accordion',
    tier: 'organisms',
    description:
      'Vertical stack of expandable sections backed by the Radix Accordion primitive.',
    imports:
      "import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from 'artax-ui'",
    props: [
      {
        name: 'type',
        type: "'single' | 'multiple'",
        default: "'single'",
        description: 'Whether one or many items can be expanded at a time.',
      },
      {
        name: 'collapsible',
        type: 'boolean',
        default: 'false',
        description: 'When type="single", allow closing the currently open item.',
      },
      {
        name: 'defaultValue',
        type: 'string | string[]',
        default: '-',
        description: 'Uncontrolled initial open item(s).',
      },
      {
        name: 'value',
        type: 'string | string[]',
        default: '-',
        description: 'Controlled open item(s).',
      },
      {
        name: 'className',
        type: 'string',
        default: '-',
        description: 'Additional classes merged via cn() on the root.',
      },
    ],
    codeExamples: [
      {
        label: 'Basic',
        code: `<Accordion type="single" collapsible>
  <AccordionItem value="one">
    <AccordionTrigger>open</AccordionTrigger>
    <AccordionContent>content</AccordionContent>
  </AccordionItem>
</Accordion>`,
      },
      {
        label: 'Composition',
        code: `<Accordion type="multiple">
  <AccordionItem value="install">
    <AccordionTrigger>installation</AccordionTrigger>
    <AccordionContent>pnpm add artax-ui</AccordionContent>
  </AccordionItem>
  <AccordionItem value="theme">
    <AccordionTrigger>theming</AccordionTrigger>
    <AccordionContent>Wrap with ThemeProvider.</AccordionContent>
  </AccordionItem>
</Accordion>`,
      },
    ],
    a11y: [
      'Triggers render as <button> children of an <h3>-equivalent header; they expose aria-expanded and aria-controls.',
      'ArrowDown/ArrowUp move focus between triggers; Home/End jump to first/last.',
      'Enter or Space on a focused trigger expands or collapses the item.',
    ],
    preview: () =>
      h(
        Accordion,
        {
          type: 'single',
          collapsible: true,
          defaultValue: 'install',
          className: 'w-full max-w-md',
        },
        h(
          AccordionItem,
          { value: 'install' },
          h(AccordionTrigger, null, 'installation'),
          h(AccordionContent, null, 'pnpm add artax-ui'),
        ),
        h(
          AccordionItem,
          { value: 'theme' },
          h(AccordionTrigger, null, 'theming'),
          h(AccordionContent, null, 'Wrap your tree with ThemeProvider.'),
        ),
      ),
  },
  {
    name: 'Dialog',
    slug: 'dialog',
    tier: 'organisms',
    description:
      'Modal dialog backed by the Radix Dialog primitive with overlay, title, description, and close action.',
    imports:
      "import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'artax-ui'",
    props: [
      {
        name: 'open',
        type: 'boolean',
        default: '-',
        description: 'Controlled open state.',
      },
      {
        name: 'defaultOpen',
        type: 'boolean',
        default: 'false',
        description: 'Uncontrolled initial open state.',
      },
      {
        name: 'onOpenChange',
        type: '(open: boolean) => void',
        default: '-',
        description: 'Called when the dialog opens or closes.',
      },
      {
        name: 'modal',
        type: 'boolean',
        default: 'true',
        description: 'When true, interactions outside the dialog are blocked.',
      },
    ],
    codeExamples: [
      {
        label: 'Basic',
        code: `<Dialog>
  <DialogTrigger asChild>
    <Button>open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>confirm</DialogTitle>
  </DialogContent>
</Dialog>`,
      },
      {
        label: 'Composition',
        code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">delete</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>destroy sandbox?</DialogTitle>
    <DialogDescription>
      This cannot be undone.
    </DialogDescription>
    <div className="mt-4 flex justify-end gap-2">
      <DialogClose asChild>
        <Button variant="ghost">cancel</Button>
      </DialogClose>
      <DialogClose asChild>
        <Button>destroy</Button>
      </DialogClose>
    </div>
  </DialogContent>
</Dialog>`,
      },
    ],
    a11y: [
      'Radix Dialog exposes role="dialog" with aria-modal="true" and labels the dialog via DialogTitle.',
      'Focus is trapped inside the dialog while open and restored to the trigger on close.',
      'Escape closes the dialog; clicking the overlay dismisses modal dialogs.',
      'Always include a DialogTitle so assistive tech can announce the dialog purpose.',
    ],
    preview: () =>
      h(
        Dialog,
        { defaultOpen: false },
        h(
          DialogTrigger,
          { asChild: true },
          h(Button, { variant: 'outline' }, 'open dialog'),
        ),
        h(
          DialogContent,
          { className: 'max-w-sm' },
          h(DialogTitle, null, 'confirm'),
          h(DialogDescription, null, 'This is a Dialog preview.'),
          h(
            'div',
            { className: 'mt-4 flex justify-end' },
            h(
              DialogClose,
              { asChild: true },
              h(Button, { variant: 'ghost' }, 'close'),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Dropdown',
    slug: 'dropdown',
    tier: 'organisms',
    description:
      'Menu of actions backed by the Radix DropdownMenu primitive with items, separators, and labels.',
    imports:
      "import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from 'artax-ui'",
    props: [
      {
        name: 'open',
        type: 'boolean',
        default: '-',
        description: 'Controlled open state.',
      },
      {
        name: 'defaultOpen',
        type: 'boolean',
        default: 'false',
        description: 'Uncontrolled initial open state.',
      },
      {
        name: 'onOpenChange',
        type: '(open: boolean) => void',
        default: '-',
        description: 'Called when the menu opens or closes.',
      },
      {
        name: 'modal',
        type: 'boolean',
        default: 'true',
        description: 'Whether the menu blocks outside interactions while open.',
      },
    ],
    codeExamples: [
      {
        label: 'Basic',
        code: `<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="outline">menu</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>new</DropdownItem>
    <DropdownItem>open</DropdownItem>
  </DropdownContent>
</Dropdown>`,
      },
      {
        label: 'Composition',
        code: `<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="outline">actions</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownLabel>file</DropdownLabel>
    <DropdownItem>new</DropdownItem>
    <DropdownItem>open</DropdownItem>
    <DropdownSeparator />
    <DropdownLabel>session</DropdownLabel>
    <DropdownItem>disconnect</DropdownItem>
  </DropdownContent>
</Dropdown>`,
      },
    ],
    a11y: [
      'Radix DropdownMenu exposes role="menu" with role="menuitem" children and manages aria-expanded on the trigger.',
      'ArrowDown opens the menu and focuses the first item; ArrowUp/ArrowDown cycle items.',
      'Typeahead focuses items by their text content; Escape closes and returns focus to the trigger.',
      'DropdownSeparator renders as role="separator" and is skipped by keyboard focus.',
    ],
    preview: () =>
      h(
        Dropdown,
        null,
        h(
          DropdownTrigger,
          { asChild: true },
          h(Button, { variant: 'outline' }, 'open menu'),
        ),
        h(
          DropdownContent,
          { className: 'min-w-[10rem]' },
          h(DropdownLabel, null, 'file'),
          h(DropdownItem, null, 'new'),
          h(DropdownItem, null, 'open'),
          h(DropdownSeparator, null),
          h(DropdownItem, null, 'disconnect'),
        ),
      ),
  },
]

export function getComponent(tier: string, slug: string): ComponentDef | undefined {
  return components.find((c) => c.tier === tier && c.slug === slug)
}

export function getComponentsByTier(tier: string): ComponentDef[] {
  return components.filter((c) => c.tier === tier)
}

export function getAllComponents(): ComponentDef[] {
  return components
}

interface SidebarSection {
  label: string
  items: { name: string; href: string }[]
}

export function getSidebarSections(): SidebarSection[] {
  return [
    {
      label: '',
      items: [
        { name: 'Overview', href: '/' },
        { name: 'Getting Started', href: '/getting-started' },
      ],
    },
    {
      label: '// atoms',
      items: [
        { name: 'Button', href: '/components/atoms/button' },
        { name: 'Input', href: '/components/atoms/input' },
        { name: 'Badge', href: '/components/atoms/badge' },
        { name: 'Separator', href: '/components/atoms/separator' },
        { name: 'CopyButton', href: '/components/atoms/copy-button' },
        { name: 'Toggle', href: '/components/atoms/toggle' },
      ],
    },
    {
      label: '// molecules',
      items: [
        { name: 'Card', href: '/components/molecules/card' },
        { name: 'Table', href: '/components/molecules/table' },
        { name: 'Callout', href: '/components/molecules/callout' },
        { name: 'CodeBlock', href: '/components/molecules/code-block' },
        { name: 'Tabs', href: '/components/molecules/tabs' },
        { name: 'Tooltip', href: '/components/molecules/tooltip' },
      ],
    },
    {
      label: '// organisms',
      items: [
        { name: 'Accordion', href: '/components/organisms/accordion' },
        { name: 'Dialog', href: '/components/organisms/dialog' },
        { name: 'Dropdown', href: '/components/organisms/dropdown' },
      ],
    },
    {
      label: '',
      items: [{ name: 'Tokens', href: '/tokens' }],
    },
  ]
}
