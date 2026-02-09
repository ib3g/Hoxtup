import { Redis } from 'ioredis'
import { config } from './index.js'

function createRedisClient() {
  return new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  })
}

const globalForRedis = globalThis as unknown as { redis: Redis | undefined }

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}
