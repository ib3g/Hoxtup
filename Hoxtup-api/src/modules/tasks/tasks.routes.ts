import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import * as tasksController from './tasks.controller.js'
import * as autoRulesController from './auto-rules.controller.js'
import * as fusionController from './fusion.controller.js'
import * as incidentsController from './incidents.controller.js'
import * as conflictsController from './conflicts.controller.js'

export const tasksRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler

tasksRouter.get('/tasks', auth, tenant, requirePermission('task:read'), tasksController.listTasks as RequestHandler)
tasksRouter.get('/tasks/my', auth, tenant, requirePermission('task:read'), tasksController.getMyTasks as RequestHandler)
tasksRouter.get('/tasks/scoped', auth, tenant, requirePermission('task:read'), tasksController.listTasksScoped as RequestHandler)
tasksRouter.get('/tasks/fusion-suggestions', auth, tenant, requirePermission('task:validate'), fusionController.listSuggestions as RequestHandler)
tasksRouter.post('/tasks/fusion/:pairId/accept', auth, tenant, requirePermission('task:validate'), fusionController.acceptFusion as RequestHandler)
tasksRouter.post('/tasks/fusion/:pairId/reject', auth, tenant, requirePermission('task:validate'), fusionController.rejectFusion as RequestHandler)
tasksRouter.post('/tasks/bulk-assign', auth, tenant, requirePermission('task:assign'), tasksController.bulkAssignTasks as RequestHandler)
tasksRouter.get('/tasks/:id', auth, tenant, requirePermission('task:read'), tasksController.getTask as RequestHandler)
tasksRouter.post('/tasks', auth, tenant, requirePermission('task:create'), tasksController.createTask as RequestHandler)
tasksRouter.patch('/tasks/:id/assign', auth, tenant, requirePermission('task:assign'), tasksController.assignTask as RequestHandler)
tasksRouter.patch('/tasks/:id/transition', auth, tenant, requirePermission('task:update'), tasksController.transitionTask as RequestHandler)
tasksRouter.patch('/tasks/:id/proxy-transition', auth, tenant, requirePermission('task:proxy'), tasksController.proxyTransitionTask as RequestHandler)
tasksRouter.post('/tasks/:id/incident', auth, tenant, requirePermission('incident:create'), incidentsController.reportIncident as RequestHandler)

tasksRouter.get('/incidents', auth, tenant, requirePermission('task:read'), incidentsController.listIncidents as RequestHandler)
tasksRouter.patch('/incidents/:incidentId/resolve', auth, tenant, requirePermission('incident:resolve'), incidentsController.resolveIncident as RequestHandler)

tasksRouter.get('/conflicts', auth, tenant, requirePermission('task:read'), conflictsController.listConflicts as RequestHandler)
tasksRouter.patch('/conflicts/:conflictId/acknowledge', auth, tenant, requirePermission('task:validate'), conflictsController.acknowledgeConflict as RequestHandler)
tasksRouter.patch('/conflicts/:conflictId/resolve', auth, tenant, requirePermission('task:validate'), conflictsController.resolveConflict as RequestHandler)

tasksRouter.get('/properties/:propertyId/auto-rules', auth, tenant, requirePermission('property:read'), autoRulesController.listAutoRules as RequestHandler)
tasksRouter.patch('/properties/:propertyId/auto-rules/:ruleId', auth, tenant, requirePermission('property:update'), autoRulesController.updateAutoRule as RequestHandler)
