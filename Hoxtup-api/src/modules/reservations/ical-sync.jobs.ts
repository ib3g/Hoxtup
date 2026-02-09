import { icalSyncQueue } from '../../config/bullmq.js'

export async function scheduleSourceSync(sourceId: string, intervalMinutes: number) {
  const jobId = `ical-sync-${sourceId}`

  await removeSourceSync(sourceId)

  await icalSyncQueue.add('sync', { sourceId }, {
    repeat: { every: intervalMinutes * 60 * 1000 },
    jobId,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  })
}

export async function removeSourceSync(sourceId: string) {
  const repeatableJobs = await icalSyncQueue.getRepeatableJobs()
  for (const job of repeatableJobs) {
    if (job.id === `ical-sync-${sourceId}`) {
      await icalSyncQueue.removeRepeatableByKey(job.key)
    }
  }
}

export async function triggerImmediateSync(sourceId: string) {
  await icalSyncQueue.add('sync-now', { sourceId }, {
    jobId: `ical-sync-now-${sourceId}-${Date.now()}`,
  })
}
