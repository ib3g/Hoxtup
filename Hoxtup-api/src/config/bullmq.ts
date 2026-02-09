import { Queue } from 'bullmq'
import { redis } from './redis.js'

export const icalSyncQueue = new Queue('ical-sync', { connection: redis })
export const notificationsQueue = new Queue('notifications', { 
  connection: redis,
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
  connection: redis,
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
