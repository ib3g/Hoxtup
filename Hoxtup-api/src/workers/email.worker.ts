import { Worker } from 'bullmq'
import { redisConnection } from '../config/bullmq.js'
import { sendEmail } from '../modules/notifications/email.service.js'
import { renderEmail } from '../modules/notifications/email-template.service.js'
import { logger } from '../common/utils/logger.js'
import { prisma } from '../config/database.js'

interface EmailJobData {
  userId: string
  title: string
  body: string
  vars: Record<string, string>
}

export function startEmailWorker() {
  const worker = new Worker(
    'emails',
    async (job) => {
      const { userId, title, body, vars } = job.data as EmailJobData
      
      logger.info({ userId }, '[email-worker] Processing email')

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        })

        if (!user?.email) {
          logger.warn({ userId }, '[email-worker] User has no email, skipping')
          return
        }

        const { subject, html } = renderEmail(title, body, vars)
        await sendEmail({
          to: user.email,
          subject,
          html,
        })

        return { success: true }
      } catch (err) {
        logger.error({ err, userId }, '[email-worker] Failed to send email')
        throw err
      }
    },
    {
      connection: redisConnection,
      concurrency: 2, // Low concurrency for SMTP limits
    },
  )

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, '[email-worker] Job failed')
  })

  return worker
}
