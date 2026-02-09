import { Router, type RequestHandler } from 'express'
import { requireAuth, reauthMiddleware } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import * as billingController from './billing.controller.js'

export const billingRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler
const reauth = reauthMiddleware as RequestHandler

billingRouter.get('/billing', auth, tenant, requirePermission('billing:view'), billingController.getSubscription as RequestHandler)
billingRouter.get('/billing/plans', auth, tenant, billingController.getPlans as RequestHandler)
billingRouter.post('/billing/cancel', auth, tenant, requirePermission('billing:manage'), reauth, billingController.cancelSubscription as RequestHandler)
billingRouter.post('/webhooks/polar', billingController.handleWebhook as RequestHandler)
