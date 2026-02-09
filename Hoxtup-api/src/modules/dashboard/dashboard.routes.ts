import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import * as dashboardController from './dashboard.controller.js'

export const dashboardRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler

dashboardRouter.get('/dashboard/home', auth, tenant, requirePermission('analytics:view'), dashboardController.getHomeDashboard as RequestHandler)
dashboardRouter.get('/dashboard/field', auth, tenant, requirePermission('task:read'), dashboardController.getFieldDashboard as RequestHandler)
dashboardRouter.get('/dashboard/activity', auth, tenant, requirePermission('analytics:view'), dashboardController.getActivitySummary as RequestHandler)
