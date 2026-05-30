import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'forks',
    testTimeout: 30_000,
    hookTimeout: 60_000,
    globalSetup: './tests/global-setup.ts',
  },
})
