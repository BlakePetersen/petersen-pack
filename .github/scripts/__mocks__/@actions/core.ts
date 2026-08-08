// ABOUTME: Jest manual mock for @actions/core.
// ABOUTME: Provides no-op stubs for GitHub Actions toolkit functions.

export function info(_message: string): void {}
export function warning(_message: string): void {}
export function error(_message: string): void {}
export function setFailed(_message: string): void {}
export function getInput(_name: string): string {
  return ''
}
