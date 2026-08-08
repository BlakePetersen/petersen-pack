// ABOUTME: Package manager detection from lockfile presence.
// ABOUTME: Identifies pnpm, yarn, or npm and generates install commands.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export type PackageManager = 'pnpm' | 'yarn' | 'npm'

interface PmConfig {
  name: PackageManager
  lockfile: string
  installDev: (packages: string[]) => string
}

const PM_CONFIGS: PmConfig[] = [
  {
    name: 'pnpm',
    lockfile: 'pnpm-lock.yaml',
    installDev: pkgs => `pnpm add -D ${pkgs.join(' ')}`
  },
  {
    name: 'yarn',
    lockfile: 'yarn.lock',
    installDev: pkgs => `yarn add -D ${pkgs.join(' ')}`
  },
  {
    name: 'npm',
    lockfile: 'package-lock.json',
    installDev: pkgs => `npm install -D ${pkgs.join(' ')}`
  }
]

export function detectPackageManager(cwd: string): PackageManager {
  for (const config of PM_CONFIGS) {
    if (existsSync(join(cwd, config.lockfile))) {
      return config.name
    }
  }
  return 'npm'
}

export function installDevCommand(
  pm: PackageManager,
  packages: string[]
): string {
  const config = PM_CONFIGS.find(c => c.name === pm)!
  return config.installDev(packages)
}
