import { z } from 'zod/v4'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().default('dev-secret-change-in-production'),
  BETTER_AUTH_URL: z.string().default('http://localhost:8000'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
})

export const config = envSchema.parse(process.env)
export type Config = z.infer<typeof envSchema>
