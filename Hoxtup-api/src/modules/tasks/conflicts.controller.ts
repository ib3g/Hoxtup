import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import * as conflictService from './task-conflict.service.js'

type ConflictRequest = AuthenticatedRequest & TenantRequest

export async function listConflicts(req: ConflictRequest, res: Response, next: NextFunction) {
  try {
    const conflicts = await conflictService.listConflicts(req.tenantId, req.query.status as string | undefined)
    res.json({ conflicts, total: conflicts.length })
  } catch (error) {
    next(error)
  }
}

export async function acknowledgeConflict(req: ConflictRequest, res: Response, next: NextFunction) {
  try {
    const result = await conflictService.acknowledgeConflict(req.params.conflictId as string, req.tenantId)
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Conflit introuvable', status: 404 })
      return
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function resolveConflict(req: ConflictRequest, res: Response, next: NextFunction) {
  try {
    const { resolution } = req.body as { resolution: string }
    const result = await conflictService.resolveConflict(req.params.conflictId as string, req.tenantId, resolution)
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Conflit introuvable', status: 404 })
      return
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}
