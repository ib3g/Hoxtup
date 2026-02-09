import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import * as fusionService from './task-fusion.service.js'

type FusionRequest = AuthenticatedRequest & TenantRequest

export async function listSuggestions(req: FusionRequest, res: Response, next: NextFunction) {
  try {
    const suggestions = await fusionService.listFusionSuggestions(req.tenantId)
    res.json({ suggestions, total: suggestions.length })
  } catch (error) {
    next(error)
  }
}

export async function acceptFusion(req: FusionRequest, res: Response, next: NextFunction) {
  try {
    const result = await fusionService.acceptFusion(req.params.pairId as string, req.tenantId, req.user.id)
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Suggestion introuvable', status: 404 })
      return
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function rejectFusion(req: FusionRequest, res: Response, next: NextFunction) {
  try {
    const result = await fusionService.rejectFusion(req.params.pairId as string, req.tenantId)
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Suggestion introuvable', status: 404 })
      return
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}
