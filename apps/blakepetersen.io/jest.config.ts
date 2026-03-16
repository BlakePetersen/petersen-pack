// ABOUTME: Jest configuration for content pipeline integration tests.
// ABOUTME: Uses ts-jest with node environment for build-time Velite pipeline testing.
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^#content$': '<rootDir>/.velite',
    '^@blink-dx/registry$': '<rootDir>/../../packages/blink-registry/src/index.ts',
  },
  testTimeout: 30000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
        },
      },
    ],
  },
}

export default config
