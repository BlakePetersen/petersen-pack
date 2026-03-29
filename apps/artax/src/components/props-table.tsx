// ABOUTME: 4-column props table renderer using artax-ui Table components.
// ABOUTME: Displays Prop, Type, Default, Description columns for component documentation.

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'artax-ui'
import type { PropDef } from '@/lib/component-registry'

export function PropsTable({ props }: { props: PropDef[] }) {
  if (props.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No props documented</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prop</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Default</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.map((prop) => (
          <TableRow key={prop.name}>
            <TableCell className="font-mono">{prop.name}</TableCell>
            <TableCell className="font-mono text-muted-foreground">
              {prop.type}
            </TableCell>
            <TableCell className="font-mono">{prop.default}</TableCell>
            <TableCell>{prop.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
