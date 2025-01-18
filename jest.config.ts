import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?[tj]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  projects: [
    {
      displayName: 'api',
      testMatch: ['<rootDir>/packages/api/tests/**/?(*.)+(spec|test).ts']
    }
  ]
}
export default config
