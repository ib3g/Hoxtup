import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './config/auth.js'
import { config } from './config/index.js'
import { createCorsOptions } from './config/cors.js'
import { logger } from './config/logger.js'
import { propertiesRouter } from './modules/properties/routes.js'
import { icalRouter } from './modules/ical/routes.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(compression())
  const corsOptions = createCorsOptions(config.CORS_ORIGINS)
  app.use(cors(corsOptions))

  app.all('/api/auth/*splat', (req, res, _next) => {
    const origin = req.headers.origin
    const allowedOrigins = config.CORS_ORIGINS.split(',').map((o) => o.trim())

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }

    toNodeHandler(auth)(req, res)
  })

  app.use(express.json())

  app.use('/api/v1/properties', propertiesRouter)
  app.use('/api/v1/properties/:propertyId/ical-sources', icalRouter)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      logger.error({ err }, 'Unhandled error')
      res.status(500).json({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: config.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      })
    },
  )

  return app
}
