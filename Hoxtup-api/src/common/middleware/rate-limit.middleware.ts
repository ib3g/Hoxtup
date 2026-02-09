import rateLimit, { type Store } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redis } from '../../config/redis.js'

const isTest = process.env.NODE_ENV === 'test'
const isDev = process.env.NODE_ENV === 'development'

function createRedisStore(prefix: string): Store | undefined {
  if (isTest || isDev) return undefined
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => redis.call(...(args as [string, ...string[]])) as any,
    prefix,
  })
}

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('rl:global:'),
  message: {
    type: 'https://api.hoxtup.com/errors/rate-limit',
    title: 'Too Many Requests',
    status: 429,
    detail: 'You have exceeded the rate limit. Please try again later.',
  },
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('rl:auth:'),
  message: {
    type: 'https://api.hoxtup.com/errors/rate-limit',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Too many login attempts. Please try again in 15 minutes.',
  },
})
