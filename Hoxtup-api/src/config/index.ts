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
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('Hoxtup <noreply@hoxtup.local>'),
  POLAR_ACCESS_TOKEN: z.string().default(''),
  POLAR_SANDBOX: z.coerce.boolean().default(true),
  POLAR_WEBHOOK_SECRET: z.string().default(''),
  POLAR_SUCCESS_URL: z.string().default('http://localhost:3000/dashboard/billing?checkout=success'),
})

export const config = envSchema.parse(process.env)
export type Config = z.infer<typeof envSchema>
