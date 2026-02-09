import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import * as reservationsController from './reservations.controller.js'

export const reservationsRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler

reservationsRouter.get('/reservations', auth, tenant, requirePermission('property:read'), reservationsController.listReservations as RequestHandler)
reservationsRouter.get('/reservations/:id', auth, tenant, requirePermission('property:read'), reservationsController.getReservation as RequestHandler)
reservationsRouter.post('/reservations', auth, tenant, requirePermission('property:update'), reservationsController.createReservation as RequestHandler)
reservationsRouter.patch('/reservations/:id', auth, tenant, requirePermission('property:update'), reservationsController.updateReservation as RequestHandler)
reservationsRouter.delete('/reservations/:id', auth, tenant, requirePermission('property:update'), reservationsController.cancelReservation as RequestHandler)
