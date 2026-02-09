import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { z } from 'zod/v4'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url().default('redis://localhost:6379'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
})

describe('config validation', () => {
  const validEnv = {
    NODE_ENV: 'development',
    PORT: '8000',
    DATABASE_URL: 'postgresql://hoxtup:hoxtup_dev@localhost:5432/hoxtup_dev',
    REDIS_URL: 'redis://localhost:6379',
    CORS_ORIGINS: 'http://localhost:3000',
    LOG_LEVEL: 'info',
  }

  it('should parse valid environment variables', () => {
    const result = envSchema.parse(validEnv)

    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBe(8000)
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL)
  })

  it('should apply default values when optional vars are missing', () => {
    const minimalEnv = {
      DATABASE_URL: 'postgresql://hoxtup:hoxtup_dev@localhost:5432/hoxtup_dev',
    }

    const result = envSchema.parse(minimalEnv)

    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBe(8000)
    expect(result.REDIS_URL).toBe('redis://localhost:6379')
    expect(result.LOG_LEVEL).toBe('info')
  })

  it('should reject missing DATABASE_URL', () => {
    expect(() => envSchema.parse({})).toThrow()
  })

  it('should reject invalid NODE_ENV', () => {
    expect(() =>
      envSchema.parse({ ...validEnv, NODE_ENV: 'staging' }),
    ).toThrow()
  })

  it('should coerce PORT from string to number', () => {
    const result = envSchema.parse({ ...validEnv, PORT: '3000' })
    expect(result.PORT).toBe(3000)
  })
})
