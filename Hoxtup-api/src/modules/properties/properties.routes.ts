import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import { scopeMiddleware } from '../../common/middleware/scope.middleware.js'
import { subscriptionGuard } from '../../common/middleware/subscription-guard.middleware.js'
import * as propertiesController from './properties.controller.js'

export const propertiesRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler
const subGuard = subscriptionGuard as RequestHandler
const scope = scopeMiddleware as RequestHandler

propertiesRouter.get('/properties', auth, tenant, subGuard, requirePermission('property:read'), scope, propertiesController.listProperties as RequestHandler)
propertiesRouter.get('/properties/:id', auth, tenant, subGuard, requirePermission('property:read'), scope, propertiesController.getProperty as RequestHandler)
propertiesRouter.post('/properties', auth, tenant, subGuard, requirePermission('property:create'), propertiesController.createProperty as RequestHandler)
propertiesRouter.patch('/properties/:id', auth, tenant, subGuard, requirePermission('property:update'), propertiesController.updateProperty as RequestHandler)
propertiesRouter.delete('/properties/:id', auth, tenant, subGuard, requirePermission('property:archive'), propertiesController.archiveProperty as RequestHandler)
propertiesRouter.patch('/properties/:id/reactivate', auth, tenant, subGuard, requirePermission('property:archive'), propertiesController.reactivateProperty as RequestHandler)
