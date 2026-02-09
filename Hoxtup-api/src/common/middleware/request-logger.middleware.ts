import { pinoHttp, type Options } from 'pino-http'
import type { IncomingMessage } from 'node:http'
import { logger } from '../utils/logger.js'

const options: Options = {
  logger,
  autoLogging: {
    ignore: (req: IncomingMessage) => req.url === '/api/v1/health',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
}

export const requestLogger = pinoHttp(options)
