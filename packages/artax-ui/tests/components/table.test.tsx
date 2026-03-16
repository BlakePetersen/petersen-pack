// ABOUTME: Tests for the terminal-styled Table component family.
// ABOUTME: Validates rendering, box-drawing aesthetic, and monospace styling.
import { render, screen } from '@testing-library/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from '../../src/components/molecules/table/table'

describe('Table', () => {
  it('renders a table element', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('applies monospace font', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole('table').className).toContain('font-mono')
  })

  it('applies terminal border styling', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole('table').className).toContain('border-border')
  })

  it('renders TableHeader with thead', () => {
    render(
      <Table>
        <TableHeader data-testid="thead">
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(screen.getByTestId('thead').tagName).toBe('THEAD')
  })

  it('renders TableBody with tbody', () => {
    render(
      <Table>
        <TableBody data-testid="tbody">
          <TableRow>
            <TableCell>data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('tbody').tagName).toBe('TBODY')
  })

  it('renders TableRow with tr', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('row').tagName).toBe('TR')
  })

  it('renders TableHead with th', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(screen.getByRole('columnheader')).toBeInTheDocument()
    expect(screen.getByRole('columnheader').textContent).toBe('Name')
  })

  it('renders TableCell with td', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>value</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole('cell')).toBeInTheDocument()
    expect(screen.getByRole('cell').textContent).toBe('value')
  })

  it('renders TableCaption', () => {
    render(
      <Table>
        <TableCaption>A terminal table</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('A terminal table')).toBeInTheDocument()
  })

  it('passes custom className', () => {
    render(
      <Table className="custom-class">
        <TableBody>
          <TableRow>
            <TableCell>data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole('table').className).toContain('custom-class')
  })
})
