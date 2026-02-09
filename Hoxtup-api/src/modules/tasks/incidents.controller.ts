import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import * as incidentsService from './incidents.service.js'
import type { IncidentType } from '../../generated/prisma/client.js'

type IncidentRequest = AuthenticatedRequest & TenantRequest

export async function reportIncident(req: IncidentRequest, res: Response, next: NextFunction) {
  try {
    const { type, description, photoUrl } = req.body as { type: IncidentType; description?: string; photoUrl?: string }
    const incident = await incidentsService.reportIncident(
      req.params.id as string,
      req.tenantId,
      req.user.id,
      type,
      description,
      photoUrl,
    )
    if (!incident) {
      res.status(404).json({ type: 'not-found', title: 'Tâche introuvable ou pas en cours', status: 404 })
      return
    }
    res.status(201).json(incident)
  } catch (error) {
    next(error)
  }
}

export async function resolveIncident(req: IncidentRequest, res: Response, next: NextFunction) {
  try {
    const { resolution, createRepairTask } = req.body as { resolution: string; createRepairTask?: boolean }
    const result = await incidentsService.resolveIncident(
      req.params.incidentId as string,
      req.tenantId,
      req.user.id,
      resolution,
      createRepairTask,
    )
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Incident introuvable', status: 404 })
      return
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function listIncidents(req: IncidentRequest, res: Response, next: NextFunction) {
  try {
    const incidents = await incidentsService.listIncidents(req.tenantId, req.query.status as string | undefined)
    res.json({ incidents, total: incidents.length })
  } catch (error) {
    next(error)
  }
}
