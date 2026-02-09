import { createServer } from 'node:http'
import { app } from './app.js'
import { config } from './config/index.js'
import { logger } from './common/utils/logger.js'
import { startICalSyncWorker } from './workers/ical-sync.worker.js'

import { startNotificationWorker } from './workers/notification.worker.js'
import { startEmailWorker } from './workers/email.worker.js'

const server = createServer(app)

let icalWorker: ReturnType<typeof startICalSyncWorker> | null = null
let notificationWorker: ReturnType<typeof startNotificationWorker> | null = null
let emailWorker: ReturnType<typeof startEmailWorker> | null = null

server.listen(config.PORT, () => {
  logger.info(`Server running on http://localhost:${config.PORT}`)

  if (config.NODE_ENV !== 'test') {
    icalWorker = startICalSyncWorker()
    notificationWorker = startNotificationWorker()
    emailWorker = startEmailWorker()
    logger.info('Background workers started (iCal, Notification, Email)')
  }
})

function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`)
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
