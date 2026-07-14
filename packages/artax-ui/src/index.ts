// ABOUTME: Public API entry point for the artax-ui design system.
// ABOUTME: Exports all components, variants, and utilities.

// Atoms
export { Button, buttonVariants } from './components/atoms/button/button'
export { Input } from './components/atoms/input/input'
export { Badge, badgeVariants } from './components/atoms/badge/badge'
export { Separator } from './components/atoms/separator/separator'
export { CopyButton } from './components/atoms/copy-button/copy-button'
export { Toggle, TogglePrimitive } from './components/atoms/toggle/toggle'

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
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsListPrimitive,
  TabsTriggerPrimitive,
  TabsContentPrimitive
} from './components/molecules/tabs/tabs'
export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipContentPrimitive
} from './components/molecules/tooltip/tooltip'
export { PrevNextNav } from './components/molecules/prev-next-nav/prev-next-nav'
export { AuthorNote } from './components/molecules/author-note/author-note'
export type { AuthorNoteProps } from './components/molecules/author-note/author-note'
export { DecisionRationale } from './components/molecules/decision-rationale/decision-rationale'
export type { DecisionRationaleProps, Alternative } from './components/molecules/decision-rationale/decision-rationale'
export { ThemeToggle } from './components/molecules/theme-toggle/theme-toggle'

// Organisms
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionItemPrimitive,
  AccordionTriggerPrimitive,
  AccordionContentPrimitive
} from './components/organisms/accordion/accordion'
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlayPrimitive,
  DialogContentPrimitive,
  DialogTitlePrimitive,
  DialogDescriptionPrimitive
} from './components/organisms/dialog/dialog'
export { Modal } from './components/organisms/modal/modal'
export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownContentPrimitive,
  DropdownItemPrimitive,
  DropdownSeparatorPrimitive
} from './components/organisms/dropdown/dropdown-menu'
export { cn } from './lib/utils'
export { tokens } from './styles/tokens'
export type { BgToken, TextToken, BorderToken, RingToken, FontToken } from './styles/tokens'
export { mdxComponents } from './mdx/components'

// Providers
export { ThemeProvider, useTheme } from './providers/theme-provider'
export type { Theme } from './providers/theme-provider'
