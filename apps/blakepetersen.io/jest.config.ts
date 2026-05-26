// ABOUTME: Jest configuration for content pipeline integration tests.
// ABOUTME: Uses ts-jest with node environment for build-time Velite pipeline testing.
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/visual/'],
  moduleNameMapper: {
    '^@/scaffold/(.*)$': '<rootDir>/../../packages/blink-cli/src/scaffold/$1',
    '^@/writer$': '<rootDir>/../../packages/blink-cli/src/writer',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^#content$': '<rootDir>/.velite',
  },
  testTimeout: 30000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
}

export default config
