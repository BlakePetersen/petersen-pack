<!-- ABOUTME: npm README for the @blink-dx/cli package. -->
<!-- ABOUTME: Documents installation, commands, and flags for the Blink CLI. -->

# @blink-dx/cli

Apply opinionated DX configs from the command line. Blink manages ESLint, Prettier, TypeScript, lint-staged, and other tooling configs so you don't have to maintain them by hand.

## Install

```sh
npm install -g @blink-dx/cli
```

## Quick Start

```sh
# See available configs
blink list

# Apply a config to your project
blink apply eslint

# Check what's managed
blink status
```

## Commands

| Command        | Description                                       |
| -------------- | ------------------------------------------------- |
| `blink list`   | List available configs from the registry          |
| `blink apply`  | Apply a config to the current project             |
| `blink status` | Show which configs are managed and their state    |
| `blink update` | Update managed configs to latest registry version |
| `blink diff`   | Show pending changes before updating              |
| `blink eject`  | Remove blink management from a config             |
| `blink doctor` | Diagnose common issues with managed configs       |
| `blink init`   | Initialize blink in a project                     |

## Flags

| Flag        | Description                                     |
| ----------- | ----------------------------------------------- |
| `--dry-run` | Preview changes without writing files           |
| `--yes`     | Skip confirmation prompts                       |
| `--global`  | Apply to user home directory instead of project |

## Documentation

Full documentation and config guides: [blakepetersen.io](https://blakepetersen.io)

## License

MIT
