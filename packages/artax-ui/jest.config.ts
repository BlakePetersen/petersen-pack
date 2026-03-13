// ABOUTME: Jest configuration for the artax-ui design system package.
// ABOUTME: Uses ts-jest with jsdom environment for React component testing.
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          moduleResolution: 'node',
          strict: true,
          skipLibCheck: true,
          isolatedModules: true
        }
      }
    ]
  }
}

export default config
