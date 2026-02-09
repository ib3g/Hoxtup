import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import * as notificationsController from './notifications.controller.js'

export const notificationsRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler

notificationsRouter.get('/notifications', auth, tenant, notificationsController.listNotifications as RequestHandler)
notificationsRouter.get('/notifications/unread-count', auth, tenant, notificationsController.getUnreadCount as RequestHandler)
notificationsRouter.patch('/notifications/read-all', auth, tenant, notificationsController.markAllAsRead as RequestHandler)
notificationsRouter.get('/notifications/preferences', auth, tenant, notificationsController.getPreferences as RequestHandler)
notificationsRouter.patch('/notifications/preferences', auth, tenant, notificationsController.updatePreferences as RequestHandler)
notificationsRouter.patch('/notifications/:id/read', auth, tenant, notificationsController.markAsRead as RequestHandler)
