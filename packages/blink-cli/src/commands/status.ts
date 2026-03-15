// ABOUTME: Shows installed blink items with version and update status.
// ABOUTME: Compares manifest entries against registry for update availability.
import { defineCommand } from 'citty'
import consola from 'consola'
import { readManifest } from '@/manifest'
import { fetchIndex } from '@/registry'
import { formatStatusTable } from '@/output'

export default defineCommand({
  meta: {
    name: 'status',
    description: 'Show installed items and update availability',
  },
  args: {
    json: {
      type: 'boolean',
      description: 'Output raw JSON',
      default: false,
    },
  },
  async run({ args }) {
    const manifest = await readManifest(process.cwd())

    if (!manifest) {
      consola.warn('blink is not initialized. Run `blink init` first.')
      process.exit(1)
      return
    }

    if (manifest.items.length === 0) {
      consola.info('No items installed.')
      return
    }

    if (args.json) {
      console.log(JSON.stringify(manifest.items, null, 2))
      return
    }

    let registryItems: import('blink-registry').RegistryItem[] = []
    try {
      const index = await fetchIndex()
      registryItems = index.items
    } catch {
      // Show items without update info on network failure
    }

    consola.log(formatStatusTable(manifest.items, registryItems))
  },
})
