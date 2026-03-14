// ABOUTME: Entry point for the blink CLI tool.
// ABOUTME: Defines the main command using citty and validates the blink-registry workspace dependency.
import { defineCommand, runMain } from 'citty'
import type { ArtifactType } from 'blink-registry'

// Type-level usage to prove the workspace dependency resolves
type _VerifyImport = ArtifactType

const main = defineCommand({
  meta: {
    name: 'blink',
    version: '0.0.0',
    description: 'Apply opinionated DX configs, skills, and hooks',
  },
  run() {
    console.log('blink: no command specified. Run blink --help for usage.')
  },
})

runMain(main)
