import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null })

export const icalSyncQueue = new Queue('ical-sync', { connection })
export const notificationsQueue = new Queue('notifications', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  }
})

export const emailsQueue = new Queue('emails', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  }
})

export { connection as redisConnection }
