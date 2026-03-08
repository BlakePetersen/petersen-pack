// ABOUTME: Composition story showing multiple artax-ui components together.
// ABOUTME: Demonstrates cohesive terminal-native aesthetic with Badge, Separator, Input, Button.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/button'
import { Input } from '../components/input'
import { Badge } from '../components/badge'
import { Separator } from '../components/separator'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/card'

const meta = {
  title: 'Overview/Terminal Interface',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Dashboard: Story = {
  render: () => (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <div className="font-mono text-sm text-terminal-muted">
        ┌─── artax-ui v2 ───┐
      </div>

      <Card>
        <CardHeader>
          <CardTitle>terminal_session</CardTitle>
          <CardDescription>Interactive command interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>active</Badge>
              <Badge variant="outline">pid:4201</Badge>
              <Badge variant="secondary">node:22</Badge>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Input placeholder="enter command..." />
              <Button>run</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="ghost">clear</Button>
          <Button variant="outline">history</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>system_status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-terminal-muted">cpu_usage</span>
              <span className="text-terminal-success">12%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">memory</span>
              <span className="text-amber-accent">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">disk_io</span>
              <span className="text-terminal-text">340 MB/s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="font-mono text-sm text-terminal-muted">
        └─── ──── ──── ───┘
      </div>
    </div>
  ),
}
