import { Worker } from 'bullmq'
import { redisConnection, emailsQueue } from '../config/bullmq.js'
import { createNotification } from '../modules/notifications/notification.service.js'
import { logger } from '../common/utils/logger.js'
import { prisma } from '../config/database.js'
import { NOTIFICATION_TRIGGERS } from '../modules/notifications/notification-triggers.config.js'
import type { NotificationType } from '../generated/prisma/client.js'

interface NotificationJobData {
  organizationId: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  deepLink?: string
}

export function startNotificationWorker() {
  const worker = new Worker(
    'notifications',
    async (job) => {
      const { organizationId, userId, type, title, body, data, deepLink } = job.data as NotificationJobData
      
      logger.info({ userId, type }, '[notification-worker] Processing notification')

      try {
        // 1. Create in-app notification
        await createNotification(organizationId, userId, type, title, body, data, deepLink)

        // 2. Check if email is required and enabled
        const trigger = NOTIFICATION_TRIGGERS[type]
        if (trigger?.channels.includes('EMAIL')) {
          const pref = await prisma.notificationPreference.findUnique({
            where: { userId_notificationType_channel: { userId, notificationType: type, channel: 'EMAIL' } },
          })

          const emailEnabled = pref ? pref.enabled : true // default enabled

          if (trigger.priority === 'critical' || emailEnabled) {
            await emailsQueue.add('send-email', {
              userId,
              title,
              body,
              vars: data ?? {},
            })
          }
        }

        return { success: true }
      } catch (err) {
        logger.error({ err, userId, type }, '[notification-worker] Failed to process notification pipeline')
        throw err
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  )

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, '[notification-worker] Job failed')
  })

  return worker
}
