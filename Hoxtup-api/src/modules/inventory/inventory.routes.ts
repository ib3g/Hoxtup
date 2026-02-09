import { Router, type RequestHandler } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { tenantMiddleware } from '../../common/middleware/tenant.middleware.js'
import { requirePermission } from '../../common/middleware/rbac.middleware.js'
import { scopeMiddleware, requirePropertyAccess } from '../../common/middleware/scope.middleware.js'
import * as inventoryController from './inventory.controller.js'

export const inventoryRouter = Router()

const auth = requireAuth as RequestHandler
const tenant = tenantMiddleware as RequestHandler

// Consumable items
inventoryRouter.get('/properties/:propertyId/inventory', auth, tenant, scopeMiddleware, requirePropertyAccess(), requirePermission('inventory:read'), inventoryController.listItems as RequestHandler)
inventoryRouter.get('/properties/:propertyId/inventory/summary', auth, tenant, scopeMiddleware, requirePropertyAccess(), requirePermission('inventory:read'), inventoryController.getInventorySummary as RequestHandler)
inventoryRouter.post('/inventory/items', auth, tenant, requirePermission('inventory:manage'), inventoryController.createItem as RequestHandler)
inventoryRouter.patch('/inventory/items/:id', auth, tenant, requirePermission('inventory:manage'), inventoryController.updateItem as RequestHandler)
inventoryRouter.post('/inventory/items/:id/movements', auth, tenant, requirePermission('inventory:read'), inventoryController.recordMovement as RequestHandler)
inventoryRouter.get('/inventory/items/:id/movements', auth, tenant, requirePermission('inventory:read'), inventoryController.getMovements as RequestHandler)

// Assets
inventoryRouter.get('/properties/:propertyId/assets', auth, tenant, requirePermission('inventory:read'), inventoryController.listAssets as RequestHandler)
inventoryRouter.post('/assets', auth, tenant, requirePermission('inventory:manage'), inventoryController.createAsset as RequestHandler)
inventoryRouter.patch('/assets/:id', auth, tenant, requirePermission('inventory:manage'), inventoryController.updateAsset as RequestHandler)
inventoryRouter.delete('/assets/:id', auth, tenant, requirePermission('inventory:manage'), inventoryController.deleteAsset as RequestHandler)

// Revenue & Financials
inventoryRouter.get('/properties/:propertyId/revenue', auth, tenant, requirePermission('billing:view'), inventoryController.listRevenue as RequestHandler)
inventoryRouter.post('/properties/:propertyId/revenue', auth, tenant, requirePermission('billing:manage'), inventoryController.addRevenue as RequestHandler)
inventoryRouter.get('/properties/:propertyId/financials', auth, tenant, requirePermission('billing:view'), inventoryController.getPropertyFinancials as RequestHandler)
inventoryRouter.get('/financials/summary', auth, tenant, requirePermission('billing:view'), inventoryController.getOrgFinancialSummary as RequestHandler)
