import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 15000,
    env: {
      NODE_ENV: 'test',
      PORT: '8000',
      DATABASE_URL: 'postgresql://hoxtup:hoxtup_dev@localhost:5433/hoxtup_dev',
      REDIS_URL: 'redis://localhost:6379',
      CORS_ORIGINS: 'http://localhost:3000',
      LOG_LEVEL: 'info',
      BETTER_AUTH_URL: 'http://localhost:8000',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname,
    },
  },
})
