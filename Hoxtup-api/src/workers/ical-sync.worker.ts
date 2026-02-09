import { Worker } from 'bullmq'
import { redisConnection } from '../config/bullmq.js'
import { syncSource } from '../modules/reservations/ical-sync.service.js'
import { logger } from '../common/utils/logger.js'

export function startICalSyncWorker() {
  const worker = new Worker(
    'ical-sync',
    async (job) => {
      const { sourceId } = job.data as { sourceId: string }
      logger.info({ sourceId }, `[ical-sync] Syncing source`)

      try {
        const stats = await syncSource(sourceId)
        logger.info({ sourceId, ...stats }, `[ical-sync] Sync completed`)
        return stats
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        logger.error({ sourceId, err }, `[ical-sync] Sync failed: ${msg}`)
        throw err
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  )

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, `[ical-sync] Job failed`)
  })

  return worker
}
