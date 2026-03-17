// ABOUTME: Dev-only components preview page showing all artax-ui components side-by-side.
// ABOUTME: Renders light and dark theme columns for visual validation. Returns 404 in production.
import { notFound } from 'next/navigation'
import {
  Badge,
  Button,
  Input,
  Separator,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Callout,
  CodeBlock,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Toggle,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from 'artax-ui'

export default function DevComponentsPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-neutral-500 p-8">
      <h1 className="mb-8 text-center font-mono text-2xl text-white">
        artax-ui Component Preview
      </h1>
      <div className="grid grid-cols-2 gap-8">
        <ThemeColumn theme="light" />
        <ThemeColumn theme="dark" />
      </div>
    </div>
  )
}

function ThemeColumn({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} className="space-y-8 bg-background p-6 text-foreground border border-border">
      <h2 className="font-mono text-lg font-bold">{theme} mode</h2>

      <Section title="Badge">
        <div className="flex gap-2">
          <Badge>default</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="secondary">secondary</Badge>
        </div>
      </Section>

      <Section title="Button">
        <div className="flex gap-2 flex-wrap">
          <Button>default</Button>
          <Button variant="outline">outline</Button>
          <Button variant="ghost">ghost</Button>
          <Button disabled>disabled</Button>
        </div>
      </Section>

      <Section title="Input">
        <Input placeholder="Type something..." />
      </Section>

      <Section title="Separator">
        <Separator />
      </Section>

      <Section title="Toggle">
        <Toggle aria-label="Bold">B</Toggle>
      </Section>

      <Section title="Card">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Card body content goes here.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Callout">
        <div className="space-y-2">
          <Callout variant="info">This is an info callout.</Callout>
          <Callout variant="warning">This is a warning callout.</Callout>
          <Callout variant="error">This is an error callout.</Callout>
          <Callout variant="success">This is a success callout.</Callout>
        </div>
      </Section>

      <Section title="CodeBlock">
        <CodeBlock filename="example.ts" language="typescript">
          <pre><code>{'const greeting = "hello world"'}</code></pre>
        </CodeBlock>
      </Section>

      <Section title="Table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Component A</TableCell>
              <TableCell>Atom</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Component B</TableCell>
              <TableCell>Molecule</TableCell>
              <TableCell>Draft</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Component C</TableCell>
              <TableCell>Organism</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for tab 1</TabsContent>
          <TabsContent value="tab2">Content for tab 2</TabsContent>
          <TabsContent value="tab3">Content for tab 3</TabsContent>
        </Tabs>
      </Section>

      <Section title="Accordion">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>What is artax-ui?</AccordionTrigger>
            <AccordionContent>
              A terminal-aesthetic design system for Next.js.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Does it support theming?</AccordionTrigger>
            <AccordionContent>
              Yes, both light and dark modes via CSS custom properties.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Tooltip">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted font-mono text-sm">
                hover for tooltip
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Tooltip content here
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-sm text-muted-foreground">{`// ${title}`}</h3>
      {children}
    </div>
  )
}
