// ABOUTME: Jest configuration for .github/scripts/ test suite.
// ABOUTME: Uses ts-jest for TypeScript support with node test environment.

import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json'
      }
    ]
  },
  moduleNameMapper: {
    '^@actions/core$': '<rootDir>/__mocks__/@actions/core',
    '^@actions/github$': '<rootDir>/__mocks__/@actions/github'
  }
}

export default config
