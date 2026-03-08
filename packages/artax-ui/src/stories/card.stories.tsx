// ABOUTME: Storybook stories for the Card component.
// ABOUTME: Demonstrates // header prefix, content areas, and composition patterns.
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/card'
import { Button } from '../components/button'
import { Badge } from '../components/badge'

const meta = {
  title: 'Components/Card',
  component: Card,
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>deployment_status</CardTitle>
        <CardDescription>Last deployed 2 hours ago</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-terminal-success">●</span>
          <span>[active]</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm">redeploy</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithBadges: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>system_info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge>v2.0.0</Badge>
          <Badge variant="outline">stable</Badge>
          <Badge variant="secondary">node:22</Badge>
        </div>
      </CardContent>
    </Card>
  ),
}

export const Minimal: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="p-6">
        <p className="font-mono text-sm text-terminal-secondary">
          No deployments found.
        </p>
      </CardContent>
    </Card>
  ),
}
