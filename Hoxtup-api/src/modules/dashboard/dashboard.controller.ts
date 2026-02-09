import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import type { RbacRequest } from '../../common/middleware/rbac.middleware.js'
import * as dashboardService from './dashboard.service.js'

type DashRequest = AuthenticatedRequest & TenantRequest & RbacRequest

export async function getHomeDashboard(req: DashRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getHomeDashboard(req.tenantId, req.user.id, req.user.name, req.user.role)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export async function getFieldDashboard(req: DashRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFieldDashboard(req.tenantId, req.user.id)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export async function getActivitySummary(req: DashRequest, res: Response, next: NextFunction) {
  try {
    const dateStr = req.query.date as string | undefined
    const date = dateStr ? new Date(dateStr) : new Date()
    if (isNaN(date.getTime())) {
      res.status(400).json({ type: 'validation-error', title: 'Date invalide', status: 400 })
      return
    }
    const data = await dashboardService.getActivitySummary(req.tenantId, req.user.id, req.user.role, date)
    res.json(data)
  } catch (error) {
    next(error)
  }
}
