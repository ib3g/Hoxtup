import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import * as icalController from './ical.controller.js'

export const icalRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler

icalRouter.get('/properties/:propertyId/ical-sources', auth, tenant, requirePermission('property:read'), icalController.listSources as RequestHandler)
icalRouter.post('/properties/:propertyId/ical-sources', auth, tenant, requirePermission('property:update'), icalController.createSource as RequestHandler)
icalRouter.patch('/properties/:propertyId/ical-sources/:sourceId', auth, tenant, requirePermission('property:update'), icalController.updateSource as RequestHandler)
icalRouter.delete('/properties/:propertyId/ical-sources/:sourceId', auth, tenant, requirePermission('property:update'), icalController.deleteSource as RequestHandler)
