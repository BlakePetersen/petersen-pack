// ABOUTME: Public API entry point for the artax-ui design system.
// ABOUTME: Exports all components, variants, and utilities.

// Atoms
export { Button, buttonVariants } from './components/atoms/button/button'
export { Input } from './components/atoms/input/input'
export { Badge, badgeVariants } from './components/atoms/badge/badge'
export { Separator } from './components/atoms/separator/separator'
export { CopyButton } from './components/atoms/copy-button/copy-button'
export { ToggleBase } from './components/atoms/toggle/toggle'
export { ToggleInteractive } from './components/atoms/toggle/toggle-interactive'

// Molecules
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './components/molecules/card/card'
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from './components/molecules/table/table'
export { Callout } from './components/molecules/callout/callout'
export type { CalloutVariant } from './components/molecules/callout/callout'
export { CodeBlock } from './components/molecules/code-block/code-block'
export { TabsList, TabsTrigger, TabsContent } from './components/molecules/tabs/tabs'
export { TooltipContent } from './components/molecules/tooltip/tooltip'
export {
  TabsInteractive,
  TabsInteractiveList,
  TabsInteractiveTrigger,
  TabsInteractiveContent
} from './components/molecules/tabs/tabs-interactive'
export {
  TooltipInteractiveProvider,
  TooltipInteractive,
  TooltipInteractiveTrigger,
  TooltipInteractiveContent
} from './components/molecules/tooltip/tooltip-interactive'

// Organisms
export {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from './components/organisms/accordion/accordion'
export {
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription
} from './components/organisms/dialog/dialog'
export {
  DropdownContent,
  DropdownItem,
  DropdownSeparator
} from './components/organisms/dropdown/dropdown-menu'
export {
  AccordionInteractive,
  AccordionInteractiveItem,
  AccordionInteractiveTrigger,
  AccordionInteractiveContent
} from './components/organisms/accordion/accordion-interactive'
export {
  DialogInteractive,
  DialogInteractiveTrigger,
  DialogInteractiveContent,
  DialogInteractiveOverlay,
  DialogInteractiveTitle,
  DialogInteractiveDescription,
  DialogInteractiveClose
} from './components/organisms/dialog/dialog-interactive'
export {
  DropdownInteractive,
  DropdownInteractiveTrigger,
  DropdownInteractiveContent,
  DropdownInteractiveItem,
  DropdownInteractiveSeparator,
  DropdownInteractiveLabel
} from './components/organisms/dropdown/dropdown-interactive'
export { cn } from './lib/utils'
export { mdxComponents } from './mdx/components'

// Providers
export { ThemeProvider, useTheme } from './providers/theme-provider'
export type { Theme } from './providers/theme-provider'
