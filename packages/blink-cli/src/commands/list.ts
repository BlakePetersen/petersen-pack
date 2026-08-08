// ABOUTME: Displays available artifacts from the Blink registry.
// ABOUTME: Supports grouped table output and raw JSON output.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { fetchIndex } from '@/registry'
import { formatListTable } from '@/output'

export default defineCommand({
  meta: {
    name: 'list',
    description: 'List available configs, skills, and hooks'
  },
  args: {
    json: {
      type: 'boolean',
      description: 'Output raw JSON',
      default: false
    }
  },
  async run({ args }) {
    try {
      const index = await fetchIndex()

      if (args.json) {
        console.log(JSON.stringify(index.items, null, 2))
        return
      }

      consola.log(formatListTable(index.items))
    } catch {
      consola.error(
        'Failed to fetch registry. Check your connection and try again.'
      )
      process.exit(1)
    }
  }
})
