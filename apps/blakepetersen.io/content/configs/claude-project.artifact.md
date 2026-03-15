---
name: Project CLAUDE.md
description: Starter template for project-level CLAUDE.md with project context and conventions
type: config
merge: section
destination: CLAUDE.md
---

<!-- blink:start claude-project -->

## Tech Stack

- Language: TypeScript 5.x with strict mode enabled
- Framework: (your framework here, e.g., Next.js 15, Express, Fastify)
- Package manager: pnpm (with workspace support for monorepos)

## Project Structure

- `src/` — application source code
- `tests/` — test files mirroring src/ structure
- `scripts/` — build and automation scripts

## Conventions

- Use named exports over default exports
- Colocate tests with source files or mirror the src/ layout in tests/
- Prefer composition over inheritance

## Development

- Install dependencies: `pnpm install`
- Run dev server: `pnpm dev`
- Run tests: `pnpm test`
- Build for production: `pnpm build`

<!-- blink:end claude-project -->
