import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import * as calendarController from './calendar.controller.js'

export const calendarRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler

calendarRouter.get('/calendar', auth, tenant, requirePermission('task:read'), calendarController.getCalendarEvents as RequestHandler)
