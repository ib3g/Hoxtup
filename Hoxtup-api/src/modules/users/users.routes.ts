import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import { scopeMiddleware } from '../../common/middleware/scope.middleware.js'
import * as usersController from './users.controller.js'

export const usersRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler
const scope = scopeMiddleware as RequestHandler

usersRouter.get('/team', auth, tenant, requirePermission('team:read'), scope, usersController.listTeam as RequestHandler)
usersRouter.post('/team/staff-managed', auth, tenant, requirePermission('team:manage'), usersController.createStaffManaged as RequestHandler)
usersRouter.patch('/team/:id/role', auth, tenant, requirePermission('team:manage'), usersController.updateRole as RequestHandler)
usersRouter.delete('/team/:id', auth, tenant, requirePermission('team:manage'), usersController.removeMember as RequestHandler)
