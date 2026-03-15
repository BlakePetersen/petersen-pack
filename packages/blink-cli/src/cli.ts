// ABOUTME: Entry point for the blink CLI tool.
// ABOUTME: Defines the main command with subcommand routing using citty.
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'blink',
    version: '0.0.0',
    description: 'Apply opinionated DX configs, skills, and hooks',
  },
  subCommands: {
    apply: () => import('./commands/apply').then((m) => m.default),
    diff: () => import('./commands/diff').then((m) => m.default),
    doctor: () => import('./commands/doctor').then((m) => m.default),
    eject: () => import('./commands/eject').then((m) => m.default),
    init: () => import('./commands/init').then((m) => m.default),
    list: () => import('./commands/list').then((m) => m.default),
    status: () => import('./commands/status').then((m) => m.default),
    update: () => import('./commands/update').then((m) => m.default),
  },
})

runMain(main)
