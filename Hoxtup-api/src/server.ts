import { createApp } from './app.js'
import { config } from './config/index.js'
import { logger } from './config/logger.js'

const app = createApp()

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'Server started')
})
