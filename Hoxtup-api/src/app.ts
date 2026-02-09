import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as OpenApiValidator from 'express-openapi-validator'
import { createCorsOptions } from './config/cors.js'
import { config } from './config/index.js'
import { requestLogger } from './common/middleware/request-logger.middleware.js'
import { rateLimiter, authRateLimiter } from './common/middleware/rate-limit.middleware.js'
import { errorHandler } from './common/middleware/error-handler.middleware.js'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './modules/auth/auth.config.js'
import { healthRouter } from './modules/health/health.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { usersRouter } from './modules/users/users.routes.js'
import { propertiesRouter } from './modules/properties/properties.routes.js'
import { icalRouter } from './modules/ical/ical.routes.js'
import { reservationsRouter } from './modules/reservations/reservations.routes.js'
import { registerCascadeListeners } from './modules/reservations/reservation-cascade.service.js'
import { tasksRouter } from './modules/tasks/tasks.routes.js'
import { registerAutoGenerationListeners } from './modules/tasks/task-auto-generator.service.js'
import { registerFusionListeners } from './modules/tasks/task-fusion.service.js'
import { notificationsRouter } from './modules/notifications/notifications.routes.js'
import { registerNotificationListeners } from './modules/notifications/notification-dispatcher.js'
import { registerConflictDetectionListeners } from './modules/tasks/task-conflict.service.js'
import { calendarRouter } from './modules/calendar/calendar.routes.js'
import { inventoryRouter } from './modules/inventory/inventory.routes.js'
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js'
import { billingRouter } from './modules/billing/billing.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const app = express()

app.use(helmet())
app.use(compression())
app.use(cors(createCorsOptions(config.CORS_ORIGINS)))
app.use(express.json({ limit: '10mb' }))
app.use(requestLogger)
app.use(rateLimiter)

app.post('/api/auth/sign-in/email', authRateLimiter)

app.use('/api/auth', toNodeHandler(auth))

app.use(
  OpenApiValidator.middleware({
    apiSpec: path.resolve(__dirname, '../openapi.yaml'),
    validateRequests: true,
    validateResponses: process.env.NODE_ENV !== 'production',
    ignorePaths: /.*\/(health|auth|webhooks)/,
  }),
)

app.use('/api/v1', healthRouter)
app.use('/api/v1', authRouter)
app.use('/api/v1', usersRouter)
app.use('/api/v1', propertiesRouter)
app.use('/api/v1', icalRouter)
app.use('/api/v1', reservationsRouter)
app.use('/api/v1', tasksRouter)
app.use('/api/v1', notificationsRouter)
app.use('/api/v1', calendarRouter)
app.use('/api/v1', inventoryRouter)
app.use('/api/v1', dashboardRouter)
app.use('/api/v1', billingRouter)

app.use(errorHandler)

registerCascadeListeners()
registerAutoGenerationListeners()
registerFusionListeners()
registerNotificationListeners()
registerConflictDetectionListeners()
